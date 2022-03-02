const webpack = require('webpack');

module.exports = {
  node: {global: true, __filename: false, __dirname: false},
  resolve: {
    fallback: {
      fs: false,
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  // TODO This is only a workaround, if this is changed in the future please remove it
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};
