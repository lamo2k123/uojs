const { resolve } = require('path');

module.exports = (env = {}) => {

    global.webpack = {
        context    : resolve(__dirname, '..', '..'),
        env        : env.production ? 'production' : 'development',
        production : env.production,
        development: !env.production
    };

    return {
        context      : global.webpack.context,
        entry        : './src/services',
        devtool      : false, // @TODO: Source map correct
        target       : 'node',
        mode         : global.webpack.env,
        externals    : require('./externals'),
        output       : require('./output'),
        module       : require('./module'),
        resolve      : require('./resolve'),
        resolveLoader: require('./resolve-loader'),
        plugins      : require('./plugins'),
        performance  : false,
        bail         : global.webpack.production,
        profile      : global.webpack.production
    }
};