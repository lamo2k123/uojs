import config from 'service/config';
import map from 'service/map';

Promise.all([
    config.validation,
])
    .then(console.log)
    .catch(console.error);

console.log(map, config.validation);