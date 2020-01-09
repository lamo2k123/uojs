const { existsSync } = require('fs');
const { extname } = require('path');
const BinReader = require('binreader');

class Reader {

    static isUOP(path) {
        if(path) {
            const ext = extname(path);

            return ext === '.uop';
        }
    }

    constructor(options = {}) {
        this._options = options;

        this.readerIndex;
    }

    lookup(index) {
        if(this.data.lookup) {
            if(index < 0 || index >= this.data.lookup) {
                return {
                    lookup: -1,
                    length: -1
                };
            }

            return {
                lookup: this.data.lookup[index],
                length: this.data.length[index],
                extra : this._options.extra ? this.data.extra[index] : []
            };
        }

        return null;
    }

    get data() {
        if(!this._data) {
            if(this.isIndexUOP) {
                // @TODO: UOP Support
            } else {
                this._data = {
                    lookup: new Int32Array(this.count),
                    length: new Int32Array(this.count)
                };

                if(this._options.extra) {
                    this._data.extra = new Int32Array(this.count);
                }

                for(let i = 0; i < this.count; i++) {
                    this._data.lookup[i] = this.readerIndex.nextInt();
                    this._data.length[i] = this.readerIndex.nextInt();

                    if(this._data.extra) {
                        this._data.extra[i] = this.readerIndex.nextInt();
                    }
                }
                const {writeFileSync} = require('fs');
                writeFileSync('res-test-1.json', JSON.stringify(this._data.lookup))
            }
        }

        return this._data;
    }

    get count() {
        return Math.floor(this.readerIndex.length / 12);
    }

    get isIndexUOP() {
        return Reader.isUOP(this._options.file.index);
    }

    get isDataUOP() {
        return Reader.isUOP(this._options.file.data);
    }

    get bufferSize() {
        return this._options.bufferSize || 1024 * 4;
    }

    get readerIndex() {
        if(!this._readerIndex) {
            if(existsSync(this._options.file.index)) {
                this._readerIndex = new BinReader({
                    filename  : this._options.file.index,
                    bufferSize: this.bufferSize
                });
            } else {
                console.error('readerIndex: file `%s` not found.', this._options.file.index);
            }
        }

        return this._readerIndex;
    }

    get readerData() {
        if(!this._readerData) {
            if(existsSync(this._options.file.data)) {
                this._readerData = new BinReader({
                    filename  : this._options.file.data,
                    bufferSize: this.bufferSize
                });
            } else {
                console.error('readerData: file `%s` not found.', this._options.file.data);
            }
        }

        return this._readerData;
    }

}

module.exports = Reader;
