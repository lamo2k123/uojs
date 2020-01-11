import Index from './index';

import { IEntries } from './types';
import { IOptions, ITile } from './types/map';

class Map {

    private _id: Array<Uint16Array> = [];
    private _z: Array<Int8Array> = [];

    constructor(options: IOptions) {
        // @TODO: validate options AJV

        const length = {
            width : options.size[0] >> 3,
            height: options.size[1] >> 3
        };

        const index = new Index({
            dir       : options.dir,
            file      : options.file,
            uopFileExt: 'dat'
        });

        const read = index.reader.read();

        for(let y = 0; y < length.width; y++) {
            for(let x = 0; x < length.height; x++) {
                let offset = ((x * length.height) + y) * 196 + 4;

                if(index.file.ext === '.uop') {
                    offset = this.UOPOffsetCalculate(offset, index.entries);
                }

                read.setPosition(offset);

                if(read.isEnd()) {
                    throw new Error(`could not seek to ${offset}`);
                }

                // tslint:disable-next-line increment-decrement
                for(let i = 0; i < 64; ++i) {
                    const resultY = ~~(i / 8) + (y * 8);
                    const resultX = (i % 8) + (x * 8);

                    if(!this._id[resultY]) {
                        this._id[resultY] = new Uint16Array(options.size[1]);
                    }

                    if(!this._z[resultY]) {
                        this._z[resultY] = new Int8Array(options.size[1]);
                    }

                    this._id[resultY][resultX] = read.nextUInt16();
                    this._z[resultY][resultX] = read.nextInt8();
                }
            }
        }
    }

    private UOPOffsetCalculate = (offset: number, entries: IEntries) => {
        let position = 0;

        if(entries.lookup && entries.length) {
            for(let i = 0; i < entries.lookup.length; i++) {
                const cursorPosition = (position + entries.length[i]) >>> 0;

                if (offset < cursorPosition) {
                    return (entries.lookup[i] + (offset - position)) >>> 0;
                }

                position = cursorPosition;
            }

            return entries.lookup.length;
        }

        return position;
    };

    getTiles = (x: number, y: number, size: number) => {
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

        const cell = {
            startX: x - size,
            startY: y - size,
            endX  : x + size,
            endY  : y + size
        };

        const block = {
            startX: ~~(cell.startX / 8),
            startY: ~~(cell.startY / 8),
            endX  : ~~(cell.endX / 8),
            endY  : ~~(cell.endY / 8)
        };

        let startPositionX = cell.startX % 8;
        let startPositionY = cell.startY % 8;

        const result: Array<Array<ITile>> = [];

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

                    if(!result[resultY]) {
                        result[resultY] = [];
                    }

                    for(let cellX = startPositionX; cellX < 8; cellX++) {
                        const globalX = (blockX * 8) + cellX;

                        if(globalX > cell.endX) {
                            break;
                        }

                        result[resultY].push({
                            id: this._id[globalY][globalX],
                            z : this._z[globalY][globalX]
                        });
                    }
                }

                startPositionX = 0;
            }

            startPositionY = 0;
            startPositionX = cell.startX % 8;
        }

        return result;
    }

}

export default Map;
