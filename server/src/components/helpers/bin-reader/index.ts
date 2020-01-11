import { readFileSync, existsSync } from 'fs';
import uniqueId from 'lodash.uniqueid';

import { IPosition } from './types';

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

    readAndMove = (key: string, method: 'readIntLE' | 'readUIntLE' | 'readBigInt64LE' | 'readBigUInt64LE', byte = 8): number | bigint => {
        const currentPosition = this._position[key];

        this.setPosition(key, this._position[key] + byte);

        if(method === 'readBigInt64LE' || method === 'readBigUInt64LE') {
            return this._buffer[method](currentPosition);
        }

        return this._buffer[method](currentPosition, byte);
    };

    read = (key: string = uniqueId('read-')) => {
        this.setPosition(key);

        return {
            key,
            nextInt8     : () => this.readAndMove(key, 'readIntLE', 1) as number,
            nextInt16    : () => this.readAndMove(key, 'readIntLE', 2) as number,
            nextInt32    : () => this.readAndMove(key, 'readIntLE', 4) as number,
            nextBigInt64 : () => this.readAndMove(key, 'readBigInt64LE') as bigint,
            nextUInt8    : () => this.readAndMove(key, 'readUIntLE', 1) as number,
            nextUInt16   : () => this.readAndMove(key, 'readUIntLE', 2) as number,
            nextUInt32   : () => this.readAndMove(key, 'readUIntLE', 4) as number,
            nextBigUInt64: () => this.readAndMove(key, 'readBigUInt64LE') as bigint,
            isEnd        : () => this.isEnd(key),
            skip         : (BYTE: number) => this.skip(key, BYTE),
            setPosition  : (position?: number) => this.setPosition(key, position),
            getPosition  : () => this._position[key]
        };
    }
}

export default BinReader;
