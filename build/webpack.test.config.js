/* eslint-disable import/no-extraneous-dependencies */
const merge = require('webpack-merge');

const common = require('./webpack.base.config.js');

module.exports = merge(common, {
  mode: 'development',
});
