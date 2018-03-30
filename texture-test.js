const Texture = require('./uodatareader/texture');

const texture = new Texture({ baseDirectory: './uo-data' });

console.log(texture.loadTexture(211).jpeg().toFile('output-2.jpeg'))


const { resolve } = require('path');

const TextureMap = require('./reader/texture-map');

const textureMap = new TextureMap({
    extra: true,
    file : {
        index: resolve('./uo-data/texidx.mul'),
        data : resolve('./uo-data/texmaps.mul')
    }
});

textureMap.get(211).jpeg().toFile('test-2.jpeg');
textureMap.get(211).png().toFile('test-2.png');
textureMap.get(211).webp().toFile('test-2.webp');
