const { resolve } = require('path');
const config = require('./../../config.json');

let dir = 'build';

if(config.dir && config.dir.build) {
    dir = config.dir.build;
}

// @TODO: Multiple output service
module.exports = {
    path         : resolve(global.webpack.context, dir, 'services'),
    filename     : 'index.js',
    publicPath   : '/',
    libraryTarget: 'commonjs2'
};