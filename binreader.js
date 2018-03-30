const { openSync, statSync, readFileSync, writeFileSync } = require('fs');

class Reader {

    constructor(options) {

        this._descriptor = openSync(options.file, 'r');
        this._stat = statSync(options.file);

        const buffer = readFileSync(options.file);

        const data = {
            lookup: new Int32Array(buffer.length / 12),
            length: new Int32Array(buffer.length / 12),
            extra : new Int32Array(buffer.length / 12)
        };


        for(let i = 0; i < buffer.length / 12; i++) {
            data.lookup[i] = buffer.readIntLE(i * 12, 4, true);
            data.length[i] = buffer.readIntLE(i * 12 + 4, 4, true);
            data.extra[i] = buffer.readIntLE(i * 12 + 8, 4, true);
        }

        writeFileSync('res-test-2.json', JSON.stringify(data))


        const bufferData = readFileSync(resolve('./uo-data/texmaps.mul'));

        const { from1555to8888 } = require('./reader/helpers/color-converter');
        const sharp = require('sharp');
        const crypto = require('crypto');

        const unic = new Set();

        const sprites = [];

        let o = 0;
        // for(let i = 0; i < data.lookup.length; i ++) {
        for(let i = 0; i < data.lookup.length; i ++) {
            if(data.lookup[i] && data.length[i]) {
                o++;
                const test = Buffer.alloc(data.length[i]);
                bufferData.copy(test, 0, data.lookup[i]);

                const md5 = crypto.createHash('md5').update(test).digest("hex");

                if(!unic.has(md5)) {
                    const size = data.extra[i] === 0 ? 64 : 128;
                    const resrt = Buffer.alloc(size * size * 4);

                    unic.add(md5);

                    for(let j = 0; j < size * size; j++) {
                        const value = test.readInt16LE(j * 2);

                        const color = from1555to8888(value | 0x8000);

                        color.copy(resrt, j * 4);
                    }

                    // 217 unused texture
                    // 2 no draw texture
                    sharp(resrt, {
                        raw: {
                            height  : size,
                            width   : size,
                            channels: 4
                        }
                    })
                        // .resize(64, 64) // test
                        .jpeg().toFile(`test/texture-${size}x${size}-${i}.jpeg`);

                    /////
                    const map0Text = require('./map0-unic.json');

                    if(map0Text.indexOf(i) !== -1) {
                        sprites.push(`test/texture-${size}x${size}-${i}.jpeg`)
                    }
                }
            }
            console.log(o)
        }

        console.log(o, unic.size, sprites)

        var Spritesmith = require('spritesmith');

        Spritesmith.run({src: sprites}, function handleResult (err, result) {
            writeFileSync('test/alt-unic-map0-res.png', result.image);
            console.log(err, result)
            // result.image; // Buffer representation of image
            // result.coordinates; // Object mapping filename to {x, y, width, height} of image
            // result.properties; // Object with metadata about spritesheet {width, height}
        });

    }

    get size() {
        return this._stat.size;
    }


}

const { resolve } = require('path');
new Reader({
    file: resolve('./uo-data/texidx.mul'),
})
return;

class BinReader {
    constructor(options) {
        if (!options.filename) {
            throw 'invalid filename';
        }
        this.options = Object.assign({
            bufferSize: 1024,
            byteOrder: 'LE'
        }, options);

        this.position = 0;
        this.bufferPosition = 0;
        this.currentBufferSize = null;
        this.stats = fs.statSync(this.options.filename);
        this.fileDescriptor = fs.openSync(this.options.filename, 'r');
        this.buffer = Buffer.alloc(this.options.bufferSize);
    }
    get length() {
        console.log('len', this.stats)
        return this.stats.size;
    }
    get canRead() {
        return this.position < this.length;
    }
    seek(position) {
        this.position = position;
        return this.canRead;
    }
    fillBuffer() {
        const position = this.bufferPosition = this.position;
        this.currentBufferSize = fs.readSync(
            this.fileDescriptor,
            this.buffer,
            0,
            this.buffer.length,
            position
        );

        return this.currentBufferSize > 0;
    }

    readLE(size, signed) {
        if (!this.canRead) {
            return null;
        }

        if (size > 8 || size < 1) {
            throw new Error('invalid size');
        }

        if (this.currentBufferSize === null
            || (this.position - this.bufferPosition < 0)
            || ((this.position - this.bufferPosition) + size) > this.buffer.length) {
            this.fillBuffer();
        }

        const bufferOffset = this.position - this.bufferPosition;
        const bytesCanRead = this.buffer.length - bufferOffset;

        if (bytesCanRead < size) {
            const tmpBuffer = Buffer.alloc(size);
            let bytesRead = this.buffer.copy(tmpBuffer, 0);
            this.position += bytesRead;
            while(bytesRead < size) {
                this.fillBuffer();
                const bytesCopied = this.buffer.copy(tmpBuffer, bytesRead, 0, size - bytesRead);
                bytesRead += bytesCopied;
                this.position += bytesCopied;
            }

            return this.readFromBuffer(tmpBuffer, 0, size, signed);
        } else {
            // can read full
            this.position += size;
            return this.readFromBuffer(this.buffer, bufferOffset, size, signed);
        }
    }
    readFromBuffer(buffer, offset, size, signed) {
        if (signed) {
            return this.options.byteOrder === 'LE' ? buffer.readIntLE(offset, size, true) : buffer.readIntBE(offset, size, true);
        }
        return this.options.byteOrder === 'LE' ? buffer.readUIntLE(offset, size, true) : buffer.readUIntBE(offset, size, true);
    }
    nextLong()   { return this.readLE(8, true);  }
    nextULong()  { return this.readLE(8, false); }
    nextInt()    { return this.readLE(4, true);  }
    nextUInt()   { return this.readLE(4, false); }
    nextShort()  { return this.readLE(2, true);  }
    nextUShort() { return this.readLE(2, false); }
    nextByte()   { return this.readLE(1, false); }
    nextSByte()  { return this.readLE(1, true);  }
}

module.exports = BinReader;
