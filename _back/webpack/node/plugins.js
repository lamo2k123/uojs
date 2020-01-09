const DaemonCommandPlugin = require('daemon-command-webpack-plugin');

module.exports = [
    new DaemonCommandPlugin('start:services'/*, {
        manager : 'yarn'
    }*/)
];