const path = require('path');

const { defineConfig } = require('@rspack/cli');
const { rspack } = require('@rspack/core');

module.exports = defineConfig({
  entry: './app/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json', '.scss', '.css'],
    modules: ['node_modules'],
  },
  plugins: [
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'app', 'images'),
          to: path.resolve(__dirname, 'dist', 'images'),
        },
      ],
    }),
    new rspack.CssExtractRspackPlugin(),
    new rspack.ProvidePlugin({
      jQuery: 'jquery',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: require.resolve('file-loader'),
            options: {},
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset',
      },
      {
        test: /\.css$/,
        use: [rspack.CssExtractRspackPlugin.loader, require.resolve('css-loader')],
      },
      {
        test: /\.scss$/,
        use: [
          rspack.CssExtractRspackPlugin.loader,
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              modules: false,
              sourceMap: true,
            },
          },
          {
            loader: require.resolve('sass-loader'),
            options: {
              api: 'modern-compiler',
              implementation: require.resolve('sass-embedded'),
              sassOptions: {
                silenceDeprecations: ['global-builtin', 'legacy-js-api', 'mixed-decls', 'color-functions', 'import'],
              },
            },
          },
        ],
      },
    ],
  },
  // FIXME(nikolark): This workflow does not work
  devServer: {
    port: 8001,
    proxy: [
      {
        context: '/api',
        target: 'http://localhost:8000',
      },
    ],
  },
});
