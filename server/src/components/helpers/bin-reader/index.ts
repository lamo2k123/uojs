import { readFileSync, existsSync } from 'fs';
import uniqueId from 'lodash.uniqueid';

import { IPosition, TBuffer, EReadType } from './types';

class BinReader {

    private readonly _buffer!: Buffer;
    private _position: IPosition = {};

    constructor(value?: Buffer | string) {
        if(typeof value === 'string') {
            if(existsSync(value)) {
                this._buffer = readFileSync(value);
            } else {
                console.error('File `%s` not found.', value);
            }
        } else if(Buffer.isBuffer(value)) {
            this._buffer = value;
        }
    }

    get position(): IPosition {
        return this._position;
    }

    setPosition = (key: string, position = 0) => {
        this._position[key] = position;
    };

    skip = (key: string, BYTE: number) => {
        if(typeof this._position[key] === 'number') {
            this.setPosition(key, this._position[key] + BYTE);
        } else {
            console.warn('Incorrect argument value `key: %s`, `position: %n`', key, this._position[key]);
        }
    };

    isEnd = (key: string): boolean => {
        if(typeof this._position[key] === 'number' && this._buffer && this._buffer.length) {
            return this._buffer.length <= this._position[key];
        }

        console.warn('Incorrect `position: %n` or `buffer: %s`', this._position[key], this._buffer);

        return false;
    };

    int = (key: string, type: EReadType = EReadType.readIntLE, BYTE: number): number => {
        if(typeof this._position[key] !== 'number') {
            console.warn('Incorrect argument value `position: %n` or `BYTE: %n`', this._position[key], BYTE);
        }

        if(this._buffer === null) {
            console.warn('Incorrect buffer === null');
        }

        const result = this._buffer[type](this._position[key], BYTE);

        this.setPosition(key, this._position[key] + BYTE);

        return result;
    };

    read = (key: string = uniqueId('read-')) => {
        this.setPosition(key);

        return {
            key,
            nextInt    : (BYTE: number) => this.int(key, EReadType.readIntLE, BYTE),
            nextUInt   : (BYTE: number) => this.int(key, EReadType.readUIntLE, BYTE),
            isEnd      : () => this.isEnd(key),
            skip       : (BYTE: number) => this.skip(key, BYTE),
            setPosition: (position?: number) => this.setPosition(key, position),
            getPosition: () => this._position[key]
        };
    }
}

export default BinReader;
