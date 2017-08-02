/* eslint-env node */

const path = require('path');
const compact = require('lodash/compact');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');

const REPO_ROOT = __dirname;
const ASSETS_PATH = path.resolve(REPO_ROOT, 'dist');

module.exports = (env) => ({
  entry: './src/index.js',
  output: {
    path: ASSETS_PATH,
    filename: 'index.js',
    library: 'immutableUpdate',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
    ],
  },
  plugins: compact([
    new CleanPlugin([ASSETS_PATH], { root: REPO_ROOT }),
    (env === 'dist:min' ? new webpack.optimize.UglifyJsPlugin() : null),
  ]),
})
