const { resolve } = require('path');

module.exports = {
    alias : {
        'service': resolve(global.webpack.context, 'src', 'services'),
        'config' : resolve(global.webpack.context, 'config')
    },
    enforceExtension : false,
    extensions : [
        '.ts',
        '.js',
        '.json'
    ]
};