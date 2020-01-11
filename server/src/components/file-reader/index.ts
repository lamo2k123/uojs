import { basename, join, extname } from 'path';
import { existsSync } from 'fs';

import hashFileName from './../helpers/hash-file-name';
import BinReader from './../helpers/bin-reader';

import { IOptions, IHashes, IEntries, IFile } from './types';

class Index {

    private readonly _options!: IOptions;

    private _entries: IEntries = {};
    private _file: IFile = {};
    private _reader!: BinReader;

    constructor(options: IOptions) {
        // @TODO: Validate options
        this._options = options;

        this.readIndex();
    }

    public get file() {
        if(this._options.file && (!this._file.ext || !this._file.path || !this._file.base)) {
            let ext = extname(this._options.file);
            let base = basename(this._options.file, ext);
            let path = join(this._options.dir, this._options.file);

            if(ext === '.idx' && !existsSync(path)) {
                const baseUOP = `${base}LegacyMUL`;
                const pathUOP = join(this._options.dir, `${baseUOP}.uop`);

                if(existsSync(pathUOP)) {
                    ext = '.uop';
                    path = pathUOP;
                    base = baseUOP;
                }
            }

            if(!this._file.ext) {
                this._file.ext = ext;
            }

            if(!this._file.path) {
                this._file.path = path;
            }

            if(!this._file.base) {
                this._file.base = base;
            }
        }

        return this._file;
    }

    public get reader() {
        if(!this._reader) {
            this._reader = new BinReader(this.file.path);
        }

        return this._reader;
    }

    public get entries() {
        return this._entries;
    }

    private generateHashesUOP = (length: number) => {
        const hashes: IHashes = {};

        if(length && this.file.base && this._options.uopFileExt) {
            const name = this.file.base.toLowerCase();

            for(let i = 0; i < length; i++) {
                const path = `build/${name}/${i.toString().padStart(8, '0')}.${this._options.uopFileExt}`;
                const hashed = hashFileName(path);

                hashes[hashed] = i;
            }
        }

        return hashes;
    };

    readIndex() {
        if(this.file.path) {
            const read = this.reader.read();

            // Mythic Package File Format - https://github.com/lamo2k123/uojs/wiki/Mythic-Package-File-Format-(.UOP)
            if(this.file.ext === '.uop') {
                if(read.nextInt32() !== 0x50594D) {
                    throw Error('MYP0 byte invalid!');
                }

                read.skip(8);

                let position = Number(read.nextBigInt64());

                read.skip(4);

                const length = read.nextInt32();
                const hashes = this.generateHashesUOP(length);

                this._entries.lookup = new Int32Array(length);
                this._entries.length = new Int32Array(length);

                if(this._options.hasExtra) {
                    this._entries.extra = new Int32Array(length);
                }

                read.setPosition(position);

                do {
                    const count = read.nextInt32();
                    position = Number(read.nextBigInt64());

                    for(let i = 0; i < count; i++) {
                        const offset = Number(read.nextBigInt64());
                        const headerLength = read.nextInt32();
                        const compressedLength = read.nextInt32();
                        const decompressedLength = read.nextInt32();
                        const hash = read.nextBigUInt64();

                        read.nextUInt32(); // adler32

                        const flag = read.nextInt16();

                        if(offset === 0) {
                            continue;
                        }

                        const idx = hashes[hash.toString()];

                        this._entries.lookup[idx] = offset + headerLength;
                        this._entries.length[idx] = flag === 1 ? compressedLength : decompressedLength;

                        if(this._options.hasExtra && Array.isArray(this._entries.extra)) {
                            this._entries.extra[idx] = 0; // TODO: ?
                        }

                    }
                } while (read.isEnd() && read.setPosition(position));
            }
        }
    }
}

export default Index;
