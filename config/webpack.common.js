'use strict';

const path = require('path');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const webpack = require('webpack');

module.exports = function (args) {
    return {
        entry: {
            widgets: './src/widgets.js',
            polyfills: ['babel-polyfill', 'zone.js'],
            vendor: [
                '@angular/platform-browser',
                '@angular/platform-browser-dynamic',
                '@angular/core',
                '@angular/common',
                // '@angular/forms',
                // '@angular/http',
                // '@angular/router',
                '@angularclass/hmr',
                'rxjs']
        },

        output: {
            path: path.join(__dirname, '/dist/'),
            filename: '[name].js'
        },

        resolve: {
            extensions: ['.ts', '.js'],
        },

        plugins: [
            new CheckerPlugin(),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.ContextReplacementPlugin(
                /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
                __dirname
            ),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'polyfills',
                chunks: ['polyfills']
            }),
            // This enables tree shaking of the vendor modules
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                chunks: ['main'],
                minChunks: module => /node_modules/.test(module.resource)
            }),
            // Specify the correct order the scripts will be injected in
            new webpack.optimize.CommonsChunkPlugin({
                name: ['polyfills', 'vendor'].reverse()
            }),
        ],

        /*
 * Options affecting the normal modules.
 *
 * See: http://webpack.github.io/docs/configuration.html#module
 */
        module: {

            rules: [

                /*
                 * Typescript loader support for .ts
                 *
                 * Component Template/Style integration using `angular2-template-loader`
                 * Angular 2 lazy loading (async routes) via `ng-router-loader`
                 *
                 * `ng-router-loader` expects vanilla JavaScript code, not TypeScript code. This is why the
                 * order of the loader matter.
                 *
                 * See: https://github.com/s-panferov/awesome-typescript-loader
                 * See: https://github.com/TheLarkInn/angular2-template-loader
                 * See: https://github.com/shlomiassaf/ng-router-loader
                 */
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: '@angularclass/hmr-loader',
                            options: {

                            }
                        },
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: 'tsconfig.webpack.json'
                            }
                        },
                    ],
                    exclude: [/\.(spec|e2e)\.ts$/]
                },

                /*
                 * to string and css loader support for *.css files (from Angular components)
                 * Returns file content as string
                 *
                 */
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
    }
}