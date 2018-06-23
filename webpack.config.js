const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    'github-applet/app': './src/github-applet/app',
  },

  output: {
    path: path.join(__dirname, 'docs'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.css/,
        exclude: /node_modules/,
        loader: 'css-loader',
      },
    ],
  },

  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },

  devtool: 'source-map',
};
