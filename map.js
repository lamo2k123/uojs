const { resolve, basename } = require('path');
const { openSync, statSync, readFileSync, writeFileSync } = require('fs');


class BinReader {

    constructor(options) {
        // @TODO: check file
        this.buffer = readFileSync(options.file);
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

const br = new BinReader({
    file: resolve('./uo-data/map0LegacyMUL.uop')
});

const read = br.read('map0');

if(read.int4() === 0x50594D) { // UOP magic number
    read.skip(8); // version + signature

    let position = read.int8();

    read.skip(4); // block capacity

    const count = read.int4();
    const data = {
        lookup: new Int32Array(count),
        length: new Int32Array(count),
        extra : new Int32Array(count)
    };

    function pad ( num, size ) {
        return ( Math.pow( 10, size ) + ~~num ).toString().substring( 1 );
    }

    const hash = require('uop-hash');
    const hashes = {};
    const name = basename('map0LegacyMUL.uop'.toLowerCase(), '.uop');
    for(let i = 0; i < count; i++) {
        // const filename = `build/${name}/${pad(i, 8)}.${this.options.uopFileExtension}`;
        const filename = `build/${name}/${pad(i, 8)}.dat`;
        const hashed = hash(filename).join('.');
        hashes[hashed] = i;
    }
    console.log(1111, hashes)

    read.setPosition(position);
    do {
        const filesCount = read.int4();
        position = read.uInt8();

        for(let i = 0; i < filesCount; i++) {
            const offset = read.uInt8();
            const length = {
                header      : read.int4(),
                compressed  : read.int4(),
                decompressed: read.int4()
            };

            const hash = [read.uInt4(), read.uInt4()].reverse().join('.');
            read.skip(4); // adler32
            const flag = read.int2();

            if (offset === 0) {
                continue;
            }

            const idx = hashes[hash];

            data.lookup[idx] = (offset + length.header);
            data.length[idx] = flag === 1 ? length.compressed : length.decompressed;
            // if(this.options.hasExtra) {
            if(true) {
                data.extra[idx] = 0; // TODO?
            }
            console.log(123, offset, length, hash, flag, hashes[hash])
        }
    } while(read.isEnd() && read.setPosition(position));

    console.log(data.length)

    class Map {

        constructor() {
            // writeFileSync('test-loadmap.json', JSON.stringify(this.loadMap()))

            this.map = this.loadMap();

            const test = new Set();

            for(const row of this.map.id) {
                for(const id of row) {
                    test.add(id);
                }
            }
            console.log(this.map.id.length, test.size)

            writeFileSync('map0-unic.json', JSON.stringify([...test]));

        }

        get width() {
            return 6144;
        }

        get heigth() {
            return 4096;
        }

        get widthBlock() {
            return this.width >> 3
        }

        get heigthBlock() {
            return this.heigth >> 3
        }

        loadMap() {
            let result = {
                id: new Array(this.width),
                z : new Array(this.width)
            };

            console.log('Start loop loaded map');
            for(let y = 0; y < this.widthBlock; y++) {
                for(let x = 0; x < this.heigthBlock; x++) {
                    let offset = ((x * this.heigthBlock) + y) * 196 + 4;

                    // if(this.index.isUOP) {
                    // console.log('off do', offset)
                    if(true) {
                        offset = this._calculateOffset(offset);
                    }

                    // console.log('off', offset)
                    // break;
                    read.setPosition(offset);

                    if(!read.isEnd()) {
                        throw new Error(`could not seek to ${offset}`);
                    }

                    for(let i = 0; i < 64; ++i) {
                        const resultY = ~~(i / 8) + (y * 8);
                        const resultX = (i % 8) + (x * 8);

                        if(!result.id[resultY]) {
                            result.id[resultY] = new Uint16Array(this.heigth);
                        }

                        if(!result.z[resultY]) {
                            result.z[resultY] = new Int8Array(this.heigth);
                        }

                        result.id[resultY][resultX] = read.uInt2();
                        result.z[resultY][resultX] = read.int1();
                    }
                }
            }
            console.log('End loop loaded map');

            return result;
        }

        _calculateOffset(offset) {
            let pos = 0;

            for(let i = 0; i < data.lookup.length; i++) {
                let currPos = (pos + data.length[i]) >>> 0;

                if (offset < currPos) {
                    return (data.lookup[i] + (offset - pos)) >>> 0;
                }
                pos = currPos;
            }

            return data.lookup.length;
        }

        getTiles(x, y, size) {
            /*
             SizeOfLandChunk = 196

             Block:
                Y: real position (Y / 8)
                X: real position (X / 8)
                SIZE-CHUNK : 196
                HEIGHT-CHUNK : map id: 0 = 512, 1 = 512, 2 = 200, 3 = 256, 4 = 181

                (({X} * {HEIGHT-CHUNK}) + {Y}) * {SIZE-CHUNK} + 4

             Cell:
                Y: min `0` max `7`
                X: min `0` max `7`

                (({Y} * 8) + {X}) * 3

             Block + Cell:
                ((({X} * {HEIGHT-CHUNK}) + {Y}) * {SIZE-CHUNK} + 4) + (({Y} * 8) + {X}) * 3
            */

            const diff = {
                start   : typeof size === 'number' ? size : 0,
                end     : typeof size === 'number' ? size : 7
            };

            const cell = {
                startX: x - diff.start,
                startY: y - diff.start,
                endX : x + diff.end,
                endY : y + diff.end
            };

            const block = {
                startX: ~~(cell.startX / 8),
                startY: ~~(cell.startY / 8),
                endX : ~~(cell.endX / 8),
                endY : ~~(cell.endY / 8)
            };

            let startPositionX = cell.startX % 8;
            let startPositionY = cell.startY % 8;

            const aResult = [];

            // Blocks
            for(let blockY = block.startY; blockY <= block.endY; blockY++) {
                for(let blockX = block.startX; blockX <= block.endX; blockX++) {
                    // Cells
                    for(let cellY = startPositionY; cellY < 8; cellY++) {
                        const globalY = (blockY * 8) + cellY;
                        const resultY = globalY - cell.startY;

                        if(globalY > cell.endY) {
                            break;
                        }

                        // Support old style format method getBlock
                        if(size && !aResult[resultY]) {
                            aResult.push([])
                        }

                        for(let cellX = startPositionX; cellX < 8; cellX++) {
                            const globalX = (blockX * 8) + cellX;

                            if(globalX > cell.endX) {
                                break;
                            }

                            if(size) {
                                aResult[resultY].push({
                                    id: this.map.id[globalY][globalX],
                                    z : this.map.z[globalY][globalX]
                                })
                            } else {
                                // Support old style format method getBlock
                                aResult.push({
                                    id: this.map.id[globalY][globalX],
                                    z : this.map.z[globalY][globalX]
                                })
                            }
                        }
                    }

                    startPositionX = 0;
                }

                startPositionY = 0;
                startPositionX = cell.startX % 8;
            }

            return aResult;
        }

    }

    new Map();

    // READ TILES
    // console.log(data, data.lookup.length)
} else {
    throw 'Bad UOP file.';
}

return

const uodatareader = require('./uodatareader')({
    baseDirectory: './uo-data/',
    maps: [
        {fileIndex: 0, mapId: 0, width: 6144, height: 4096},
        // {fileIndex: 0, mapId: 1, width: 6144, height: 4096}
    ]
});

return;

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

