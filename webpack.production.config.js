'use strict';

const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.common.config');

config.devtool = 'source-map';

config.plugins.push(
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        sourceMap: true,
        compressor: {
            warnings: false,
            screw_ie8: true
        }
    })
);

module.exports = config;