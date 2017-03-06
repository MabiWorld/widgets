'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // Controls sourcemaps
    devtool: 'source-map',

    // The chunks to build 
    entry: {
        widgets: path.join(__dirname, 'src/widgets.js')
    },

    // Where to put the bundles
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].min.js'
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ],

    module: {
        // These tell webpack how to load various file types
        loaders: [
            // Javascript via babel
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },

            // CSS
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}