import { basename } from 'path';

import pad from 'component/helpers/pad';

import { IOptions } from './types';

const Test = (options: IOptions) => {
    // @TODO: Validate options


};

class Index {

    private readonly _options!: IOptions | null;
    private _pathFull!: string;

    constructor(options: IOptions) {
        // @TODO: validate options
        this._options = options;

    }

    get pathFull(): string | null {
        if(this._pathFull) {
            return this._pathFull;
        }

        const indexFile = this._options.indexFile || this._options.mulFile;
    }

    getFullPath() {
        if (this.path) {
            return this.path;
        }
        const indexFile = this.options.indexFile || this.options.mulFile;
        let newPath = path.join(this.options.baseDirectory, indexFile);
        const basename = path.basename(indexFile, '.idx');
        if (fs.existsSync(newPath)) {
            this.path = newPath;
            this.isUOP = false;

            return this.path;
        }

        newPath = path.join(this.options.baseDirectory, `${basename}LegacyMUL.uop`);
        if (fs.existsSync(newPath)) {
            this.path = newPath;
            this.isUOP = true;

            return this.path;
        }

        return null;
    }


    buildUOPHashes() {
        const hashes = {};
        const basename = basename(this.getFullPath().toLowerCase(), '.uop');
        for(let i = 0; i < /*header.count*/this.options.length; i++) {
            const filename = `build/${basename}/${pad(i, 8)}.${this.options.uopFileExtension}`;
            const hashed = hash(filename).join('.');
            hashes[hashed] = i;
        }
        return hashes;
    }
}

export default Index;

const fs = require('graceful-fs');
const path = require('path');
const hash = require('uop-hash');
const BinReader = require('binreader');

// const pad = require('./pad');

class FileIndexReader {
    constructor(options) {
        this.options = options;
        this.readIndex();
    }
    get length() {
        if (this.indexLookups) {
            return this.indexLookups.length;
        }
        return 0;
    }
    lookup(index) {
        if (!this.indexLookups) {
            return null;
        }
        if (index < 0 || index >= this.indexLookups.length) {
            return {
                lookup: -1,
                length: -1
            };
        }
        return {
            lookup: this.indexLookups[index],
            length: this.indexLengths[index],
            extra:  (this.indexExtras || [])[index]
        };
    }
    getMulReader() {
        if (this.mulReader) {
            return this.mulReader;
        }
        this.mulReader = new BinReader({
            filename: this.getFullMulPath(),
            bufferSize: 1024 * 4
        });
        return this.mulReader;
    }
    getReader() {
        if (this.reader) {
            return this.reader;
        }
        this.reader = new BinReader({
            filename: this.getFullPath(),
            bufferSize: 1024 * 4
        });
        return this.reader;
    }
    getFullMulPath() {
        //TODO: combine these two redundant funcs into one
        if (this.mulPath) {
            return this.mulPath;
        }
        let newPath = path.join(this.options.baseDirectory, this.options.mulFile);
        const basename = path.basename(this.options.mulFile, '.mul');
        if (fs.existsSync(newPath)) {
            this.mulPath = newPath;
            this.isUOP = false;

            return this.mulPath;
        }

        newPath = path.join(this.options.baseDirectory, `${basename}LegacyMUL.uop`);
        if (fs.existsSync(newPath)) {
            this.mulPath = newPath;
            this.isUOP = true;

            return this.mulPath;
        }

        return null;
    }
    getFullPath() {
        if (this.path) {
            return this.path;
        }
        const indexFile = this.options.indexFile || this.options.mulFile;
        let newPath = path.join(this.options.baseDirectory, indexFile);
        const basename = path.basename(indexFile, '.idx');
        if (fs.existsSync(newPath)) {
            this.path = newPath;
            this.isUOP = false;

            return this.path;
        }

        newPath = path.join(this.options.baseDirectory, `${basename}LegacyMUL.uop`);
        if (fs.existsSync(newPath)) {
            this.path = newPath;
            this.isUOP = true;

            return this.path;
        }

        return null;
    }
    readIndex() {
        const reader = this.getReader();

        if (this.isUOP) {
            // uop format:
            if (reader.nextInt() != 0x50594D) {
                throw 'header magic number is invalid';
            }
            reader.nextLong(); // version + sig
            let nextBlock = reader.nextLong();
            const blockCapacity = reader.nextInt();
            const count = reader.nextInt();

            if (!this.options.length) {
                this.options.length = count;
            }
            const hashes = this.buildUOPHashes();
            const indexLookups = new Int32Array(this.options.length);
            const indexLengths = new Int32Array(this.options.length);
            const indexExtras  = this.options.hasExtra ? new Int32Array(this.options.length) : null;

            reader.seek(nextBlock);
            do {
                const filesCount = reader.nextInt();
                nextBlock = reader.nextULong();
                /*if (nextBlock <= 0) {
                    break;
                }*/
                for(let i = 0; i < filesCount; i++) {
                    const offset = reader.nextULong();
                    //console.log(offset);

                    const headerLength = reader.nextInt();
                    const compressedLength = reader.nextInt();
                    const decompressedLength = reader.nextInt();
                    const hash = [reader.nextUInt(), reader.nextUInt()].reverse().join('.');
                    reader.nextInt(); //adler32
                    const flag = reader.nextShort();
                    if (offset === 0) {
                        continue;
                    }
                    const idx = hashes[hash];
                    /*index[idx] = {
                        lookup: (offset + headerLength),
                        length: flag === 1 ? compressedLength : decompressedLength
                    }*/

                    indexLookups[idx] = (offset + headerLength);
                    indexLengths[idx] = flag === 1 ? compressedLength : decompressedLength;
                    if (this.options.hasExtra) {
                        indexExtras[idx] = 0; // TODO?
                    }
                }
            } while (reader.canRead && reader.seek(nextBlock));

            this.indexLookups = indexLookups;
            this.indexLengths = indexLengths;
            this.indexExtras  = indexExtras;
        } else {
            // standard mul format:
            const count = ~~(reader.length / 12);
            const indexLookups = new Int32Array(this.options.length);
            const indexLengths = new Int32Array(this.options.length);
            const indexExtras  = this.options.hasExtra ? new Int32Array(this.options.length) : null;

            for(var i = 0; i < count; i++) {
                indexLookups[i] = reader.nextInt();
                indexLengths[i] = reader.nextInt();
                if (this.options.hasExtra) {
                    indexExtras[i]   = reader.nextInt();;
                }
            }
            this.indexLookups = indexLookups;
            this.indexLengths = indexLengths;
            this.indexExtras  = indexExtras;
        }
    }
    buildUOPHashes() {
        const hashes = {};
        const basename = path.basename(this.getFullPath().toLowerCase(), '.uop');
        for(let i = 0; i < /*header.count*/this.options.length; i++) {
            const filename = `build/${basename}/${pad(i, 8)}.${this.options.uopFileExtension}`;
            const hashed = hash(filename).join('.');
            hashes[hashed] = i;
        }
        return hashes;
    }
}

module.exports = FileIndexReader;
