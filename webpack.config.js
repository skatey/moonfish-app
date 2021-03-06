const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin({
  filename: '[name]-[contenthash].css'
});

const isProduction = process.argv.indexOf('-p') >= 0;
const ENV = isProduction ? 'production' : 'development';

const plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: Infinity,
    filename: 'vendor-[hash].js',
  }),
  new webpack.ProvidePlugin({
    fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
  }),
  new webpack.DefinePlugin({
    ENV: JSON.stringify(ENV),
    PRODUCTION_HOSTNAME: JSON.stringify('production.com'),
    STAGING_HOSTNAME: JSON.stringify('staging.com'),
    'process.env': {
      // for react building https://facebook.github.io/react/docs/optimizing-performance.html#use-the-production-build
      NODE_ENV: JSON.stringify(ENV)
    }
  }),
  new HtmlWebpackPlugin({
    template: 'src/index.html'
  }),
  // This is necessary to emit hot updates (currently CSS only):
  new webpack.HotModuleReplacementPlugin(),
  extractLess
];

const app = ['babel-polyfill', './src/index'].filter(Boolean);

module.exports = {
  devtool: isProduction ? 'source-maps' : 'cheap-module-source-map',
  entry: {
    app
  },
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
  },
  resolve: {
    alias: {
      '../../theme.config$': path.resolve(path.join(__dirname, 'src'), 'theme/theme.config'),
    },
    extensions: ['.js', '.json', '.jsx'],
    modules: [path.join(__dirname, 'src'), 'node_modules']
  },
  devServer: {
    inline: true,
    port: 4000,
    historyApiFallback: true
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      use: [
        'babel-loader',
        // !isProduction && 'eslint-loader'
      ].filter(Boolean),
      exclude: /node_modules/,
    },
    {
      test: /\.less$/,
      use: extractLess.extract({
        fallback: {
          loader: 'style-loader'
        },
        use: ['css-loader', 'less-loader']
      }),
    }, {
      test: /\.(eot|png|jpg|ttf|svg|gif)$/,
      use: ['file-loader']
    }, {
      test: /\.(pdf)$/,
      loader: 'file-loader?name=[name].[ext]&outputPath=downloads/&publicPath=downloads/'
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&minetype=application/font-woff'
    }]
  },
  plugins
};
