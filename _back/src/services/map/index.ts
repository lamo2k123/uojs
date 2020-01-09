import { resolve, join } from 'path';
import { existsSync } from 'fs';
import BinReader from '@lamo2k123/bin-reader';
import config from 'config';

export class Map {

    static files: Array<string> = [
        'map0LegacyMUL.uop',
        'map1LegacyMUL.uop',
        'map2LegacyMUL.uop',
        'map3LegacyMUL.uop',
        'map4LegacyMUL.uop',
        'map5LegacyMUL.uop'
    ];

    static dir = resolve(config.dir.uo);

    constructor() {

    }

    get validation(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            for(const file of Map.files) {
                const path = join(Map.dir, file);

                if(!existsSync(path)) {
                    console.error('[Map:validation] File `%s` not found!', path);

                    reject(false);
                }
            }

            resolve(true);
        });
    }

}

export default new Map();