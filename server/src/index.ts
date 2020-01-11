import { join } from 'path';
import { writeFileSync } from 'fs';

import Map from './components/file-reader/map';

const test = new Map({
    dir : join(process.cwd(), 'uo'),
    file: 'map0.idx',
    size: [6144, 4096]
});

// writeFileSync('temp-arr.json', JSON.stringify(test.map));
// console.log(JSON.stringify(test.map));
