'use strict';

const path = require('path');
const webpack = require('webpack');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
    // The chunks to build 
    entry: {
        time: path.join(__dirname, 'src/time/index.js'),
        mss: path.join(__dirname, 'src/mss/index.js'),
        widgets: path.join(__dirname, 'src/widgets.js'),
        vendor: ['redux', 'redux-logger', 'redux-thunk', 'moment', 'moment-timezone', 'seamless-immutable', 'isomorphic-fetch', 'babel-polyfill']
    },

    // Where to put the bundles
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].js'
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minCunks: Infinity,
        }),
        new Visualizer()
    ],

    module: {
        // These tell webpack how to load various file types
        loaders: [
            // Javascript via babel
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: [['env', {modules: false}]]
                }
            },

            // CSS
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}