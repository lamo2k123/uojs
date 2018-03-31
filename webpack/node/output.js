const { resolve } = require('path');

// @TODO: Multiple output service
module.exports = {
    path         : resolve(global.webpack.context, 'build', 'services'),
    filename     : 'index.js',
    publicPath   : '/',
    libraryTarget: 'commonjs2'
};