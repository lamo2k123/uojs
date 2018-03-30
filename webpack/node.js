const { resolve } = require('path');
const DaemonCommandPlugin = require('daemon-command-webpack-plugin');

module.exports = (env = {}) => ({
    context         : resolve(__dirname, '..'),
    entry           : './src/server',
    mode            : 'development',
    devtool         : 'inline-source-map',
    target          : 'node',
    externals       : [
        'koa',
        'daemon-command-webpack-plugin/marker'
    ],
    output          : {
        path            : resolve(__dirname, '..', 'build', 'server'),
        filename        : 'index.js',
        publicPath      : '/',
        libraryTarget   : 'commonjs2'
    },
    module          : {
        rules : [{
            test: /\.tsx?$/,
            use : [{
                loader: 'ts'
            }]
        }]
    },
    resolve         : {
        alias : {
            // 'server/component': resolve(options.context, 'src', 'server', 'components'),
            // 'client/component': resolve(options.context, 'src', 'client', 'components'),
            // component         : resolve(options.context, 'src', 'common', 'components'),
            // route             : resolve(options.context, 'src', 'common', 'routes'),
            // config            : resolve(options.context, 'configs', 'config'),
            // common            : resolve(options.context, 'src', 'common')
        },
        enforceExtension : false,
        extensions : [
            '.ts',
            '.js',
            '.pcss',
            '.json',
            '.jsx'
        ]
    },
    resolveLoader   : {
        extensions : [
            '.js'
        ],
        enforceExtension : false,
        moduleExtensions : [
            '-loader'
        ]
    },
    plugins: [
        new DaemonCommandPlugin('start:server', {
            marker : true
        })
    ]
    // performance     : require('./performance')(options),
    // bail            : options.production,
    // profile         : options.production
});