module.exports = {
    rules : [{
        test: /\.ts$/,
        use : [{
            loader : 'ts',
            options: {
                transpileOnly: true
            }
        }]
    }]
};