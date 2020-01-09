const K = 255.0 / 31.0;

class ColorConverter {

    static from1555to8888(color) {
        return Buffer.from([
            Math.floor(((color & 0x7C00) >> 10) * K),
            Math.floor(((color & 0x03E0) >> 5) * K),
            Math.floor((color & 0x1F) * K),
            ((color & 0x8000) >> 15) * 255
        ]);
    }

}

module.exports = ColorConverter;
