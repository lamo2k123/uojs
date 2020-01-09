const fs = require('fs')
const uodatareader = require('./uodatareader')({
    baseDirectory: './uo-data',
    maps: [
        {fileIndex: 0, mapId: 0, width: 6144, height: 4096},
        // {fileIndex: 0, mapId: 1, width: 6144, height: 4096}
    ]
});

const map = uodatareader.maps[0];
// console.time('Request' + 0, map);
// const block = map ? map.getTiles(200, 200, 0) : [];
// console.timeEnd('Request' + 0);

const result = [];
return
for(let x = 0; x <= 6144; x++) {
    if(!result[x]) {
        result[x] = [];
    }

    for(let y = 0; y <= 4096; y++) {
        const { id, z } = map.getTiles(x, y, 0)[0];

        console.log('add = x: %s, y: %s, id: %s, z: %s', x, y, id, z);
        result[x][y] = [id, z];
    }

    fs.appendFileSync('testssss.json', JSON.stringify(result[x]) + ',', 'utf8')
}