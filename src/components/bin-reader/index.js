const { readFileSync, existsSync } = require('fs');
const uniqueId = require('lodash.uniqueid');

class BinReader {

    constructor(file) {
        if(existsSync(file)) {
            this.buffer = readFileSync(file);
        } else {
            console.error('File `%s` not found.', file);
        }
    }

    set buffer(buffer) {
        this._buffer = buffer;
    }

    get buffer() {
        return this._buffer;
    }

    setPosition(key, position = 0) {
        if(!this._position) {
            this._position = {};
        }

        this._position[key] = position;
    }

    getPosition(key) {
        if(this._position) {
            return this._position[key];
        } else {
            return null;
        }
    }

    skip(key, BYTE) {
        const position = this.getPosition(key);

        this.setPosition(key, position + BYTE);
    }

    isEnd(key) {
        return this.buffer.length > this.getPosition(key)
    }

    read(key) {
        if(!key) {
            key = uniqueId('read-');
        }

        this.setPosition(key);

        return {
            int8       : this.int.bind(this, key, 'readIntLE', 8),
            int4       : this.int.bind(this, key, 'readIntLE', 4),
            int2       : this.int.bind(this, key, 'readIntLE', 2),
            int1       : this.int.bind(this, key, 'readIntLE', 1),
            uInt8      : this.int.bind(this, key, 'readUIntLE', 8),
            uInt4      : this.int.bind(this, key, 'readUIntLE', 4),
            uInt2      : this.int.bind(this, key, 'readUIntLE', 2),
            uInt1      : this.int.bind(this, key, 'readUIntLE', 1),
            isEnd      : this.isEnd.bind(this, key),
            skip       : this.skip.bind(this, key),
            setPosition: this.setPosition.bind(this, key)
        }
    }

    int(key, type = 'readIntLE', BYTE) {
        const position = this.getPosition(key);

        this.setPosition(key, position + BYTE);

        return this.buffer[type](position, BYTE, true);
    }

}

module.exports = BinReader;