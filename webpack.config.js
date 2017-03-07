'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // Controls sourcemaps
    devtool: 'eval-source-map',

    // The chunks to build 
    entry: {
        widgets: path.join(__dirname, 'src/widgets.js'),
        mss: path.join(__dirname, 'src/mss/index.js'),
        vendor: ['react', 'react-dom']
    },

    // Where to put the bundles
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].js',
        publicPath: '/'
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new HtmlWebpackPlugin({ inject: true, template: './demo/mss/index.html' }),
        new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
		}),
        new webpack.NamedModulesPlugin()
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
                    presets: [['env', {modules: false}], 'react', 'react-hmre'],
                    plugins: ['react-hot-loader/babel']
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