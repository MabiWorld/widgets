const commonConfig = require('./webpack.common.js');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

module.exports = function (args) {
    return webpackMerge(commonConfig({env: ENV}), {
        devtool: 'cheap--module-source-map',
        plugins: [
            new HtmlWebpackPlugin({ inject: true, template: './demo/mss/index.html' })
        ]
    });
}