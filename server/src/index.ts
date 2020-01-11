import { join } from 'path';

import FileReader from './components/file-reader';

const test = new FileReader({
    dir: join(process.cwd(), 'uo'),
    file: 'map0.idx',
    uopFileExt: 'dat'
});

console.log(test);
