const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseStyleLoader = (env) => (env === 'production' ? MiniCssExtractPlugin.loader : require.resolve('style-loader'));

module.exports = (env, argv) => {
  return {
    entry: './app/index.js',
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: ['.jsx', '.js', '.json', '.scss', '.css'],
      modules: ['node_modules']
    },
    plugins: [
      new MiniCssExtractPlugin(),
      env === 'production' ? new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/) : null,
      env !== 'production' ? new HtmlWebpackPlugin({ template: './app/index.html' }) : null,
      new webpack.ProvidePlugin({
        jQuery: 'jquery'
      })
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {}
            }
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: require.resolve('file-loader')
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader')
        },
        {
          test: /\.css$/,
          loaders: [baseStyleLoader(env), require.resolve('css-loader')]
        },
        {
          test: /\.scss$/,
          loaders: [
            baseStyleLoader(env),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                modules: false,
                sourceMap: true
              }
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sassOptions: {
                  precision: 8
                }
              }
            }
          ]
        }
      ]
    },
    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      historyApiFallback: true,
      overlay: {
        errors: true,
        warnings: false
      },
      port: 8001,
      publicPath: '/',
      proxy: {
        '/api': 'http://localhost:8000'
        // TODO: get urls
      },
      stats: {
        assets: false,
        modules: false,
        chunks: false
      }
    },
    devtool: env === 'production' ? 'source-map' : 'cheap-module-eval-source-map'
  };
};
