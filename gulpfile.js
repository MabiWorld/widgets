'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const del = require('del');
const webpackStream = require('webpack-stream');
var webpack2 = require('webpack');
const argv = require('yargs').argv;
const Q = require('q');

// If gulp was called in the terminal with the --prod flag, set the node environment to production
if (argv.prod) {
  process.env.NODE_ENV = 'production';
}
let PROD = process.env.NODE_ENV === 'production';

const config = {
	webpack: './webpack.config.js',
	paths: {
		entry: 'app/widgets.js',
		distDir: PROD ? 'dist.prod' : 'dist.dev'
	}
};
// paths = {
//     scripts: './app/**/*.js',
//     styles: ['./app/**/*.css', './app/**/*.scss'],
//     demos: './app/**/demo.html',
//     partials: ['app/**/*.html', '!app/**/demo.html'],
//     distDev: './dist.dev',
// 	distProd: './dist.prod',
// 	images: '',
// 	entry: 'app/widgets.js'
// };

function lint() {

}

function test() {

}

// pipe that builds the app by invoking webpack on the entrypoint. Copies to dist
function build() {
	return gulp.src(config.paths.entry)
		.pipe(webpackStream(require(config.webpack), webpack2))
		.pipe(gulp.dest(config.paths.distDir));
}

// Gulp tasks
gulp.task('build', build);