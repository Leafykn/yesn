var webpack = require('webpack');
var path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')

function resolve(dir){
  return path.join(__dirname, '..', dir);
}

module.exports = {
  entry: {
    'main': './src/index',
  },
  devtools:'source-map',
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, './dist'),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  externals: { },
  plugins: [
    new HtmlWebpackPlugin({ 
        template: './index.html',
        chunks:['main']
    })
  ]
}
