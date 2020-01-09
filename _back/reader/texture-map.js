const { readSync } = require('fs');
const sharp = require('sharp');
const Reader = require('./index');
const { from1555to8888 } = require('./helpers/color-converter');

class TextureMap {

    constructor(options) {
        this._reader = new Reader(options);
    }

    get(id) {
        let item = this._reader.lookup(id);

        if(!item) {
            item = this._reader.lookup(2);
        }

        console.log(item);

        const size = item.extra === 0 ? 64 : 128;
        const buffer = {
            read : Buffer.alloc(item.length),
            write: Buffer.alloc(size * size * 4)
        };

        readSync(this._reader.readerData.fileDescriptor, buffer.read, 0, buffer.read.length, item.lookup);

        console.log(buffer.read)

        for(let i = 0; i < size * size; i++) {
            const value = buffer.read.readInt16LE(i * 2);
            const color = from1555to8888(value | 0x8000);

            color.copy(buffer.write, i * 4);
        }

        return sharp(buffer.write, {
            raw: {
                height  : size,
                width   : size,
                channels: 4
            }
        });
    }
}

module.exports = TextureMap;
