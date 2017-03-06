'use strict';

const webpack = require('webpack'),
	path = require('path'),	
	HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.NODE_ENV;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'production';

module.exports = makeWebpackConfig();

function makeWebpackConfig() {
	var config = {};

	/**
	 * Entry
	 * Reference: http://webpack.github.io/docs/configuration.html#entry
	 * Should be an empty object if it's generating a test build
	 * Karma will set this when it's a test build
	 */
	config.entry = {};
	if (!isTest) {
		config.entry.widgets = './app/widgets.js';

		if (!isProd) {
			config.entry.mss = './app/mss/demo/index.js';
			
			// Don't load these from a CDN for dev
			config.entry.vendor = ['angular', 'angular-translate', 'reflect-metadata'];
		}
	}

    /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   * Should be an empty object if it's generating a test build
   * Karma will handle setting it up for you when it's a test build
   */
	config.output = isTest ? {} : {
		filename: '[name].bundle.js'
	};

	/**
	 * Devtool
	 * Reference: http://webpack.github.io/docs/configuration.html#devtool
	 * Type of sourcemap to use per build type
	 */
	if (isTest) {
		config.devtool = 'inline-source-map';
	}
	else if (isProd) {
		config.devtool = 'source-map';
	}
	else {
		config.devtool = 'eval-source-map';
	}

	config.resolve = {
		alias: {
			mss: path.resolve(__dirname, 'app', 'mss')
		},
	}

	config.module = {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query: {
					presets: ['env']
				}
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				// ASSET LOADER
				// Reference: https://github.com/webpack/file-loader
				// Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
				// Rename the file using the asset hash
				// Pass along the updated reference to your code
				// You can add here any file extension you want to get copied to your output
				test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
				loader: 'url-loader?limit=10000'
			}
		]
	}

	config.plugins = [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
		})
	];
	if (!isTest && !isProd) {
		// const vis = require('webpack-visualizer-plugin')
		// config.plugins.push(new vis());

		config.plugins.push(
			new HtmlWebpackPlugin({
				inject: true,
				template: './app/mss/demo/index.html'
			})
		);
	}

	if (!isProd) {
		config.plugins.push(
			new webpack.ContextReplacementPlugin(
				/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
				__dirname
			)
		)
	}

	return config;
}