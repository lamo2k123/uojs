const { resolve } = require('path');

module.exports = {
    alias : {
        'service': resolve(global.webpack.context, 'src', 'services')
    },
    enforceExtension : false,
    extensions : [
        '.ts',
        '.js',
        '.json'
    ]
};