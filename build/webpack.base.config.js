const slsw = require('serverless-webpack');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const infra =
  process.env.BUILD_MODE === 'CI' ? { region: 'mock-region' } : require('../infra.json');

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: 'production',
  externals: nodeExternals(),

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      INFRA: JSON.stringify(infra),
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
};
