const path = require('path');
const fs = require('fs');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: 'coverage-istanbul-loader',
        options: {esModules: true},
        enforce: 'post',
        include: [
          path.join(__dirname, '..', 'bame', 'src'),
          ...fs
            .readdirSync(path.join(__dirname, '..', '..', 'libs'), {withFileTypes: true})
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(__dirname, '..', '..', 'libs', 'src', 'lib', dirent.name)),
        ],
        exclude: [/\.(e2e|spec)\.ts$/, /node_modules/, /(ngfactory|ngstyle)\.js/],
      },
    ],
  },
};
