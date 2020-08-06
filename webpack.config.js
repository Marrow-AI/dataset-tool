const path = require("path");
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  watch: true,
  devServer: {
    contentBase: './server/static',
      hot: true,
      disableHostCheck: true
  },
  entry: {
    app: ["./client/data-tool/src/index.js"]
  },
  output: {
    path: path.resolve(__dirname, "server/static"),
    filename: "bundle.js"
  },
 plugins: [
     new webpack.HotModuleReplacementPlugin()
  ],
  module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env',{useBuiltIns: 'usage', corejs: 3}], '@babel/preset-react']
            }
          }
        },
        {
         test: /\.css$/,
         use: ['style-loader', 'css-loader']
        },
        {
         test: /\.less$/,
         use: ['less-loader']
        },
        {
         test: /\.(png|svg|jpg|gif)$/,
         use: [
           'file-loader',
         ],
       }
      ]
  }
};
