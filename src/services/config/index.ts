import Ajv from 'ajv';

import config from 'config';
import schema from 'service/config/schema';

export class Config {

    ajv = new Ajv();

    get validation(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const validate = this.ajv.validate(schema, config);

            if(validate) {
                resolve(validate);
            } else {
                reject(this.ajv.errors);
            }
        });
    }

}

export default new Config();