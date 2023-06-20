const path = require('path')
const os = require('os');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const chalk = require('chalk');

const threads = os.cpus().length;
const isProduction = process.env.NODE_ENV === 'production';
const tools = require('../scripts/utils/tools')

const getStyleLoaders = pre => {
  return [
    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
    'css-loader',
    'postcss-loader',
    pre
  ].filter(Boolean)
}


module.exports = function (options = {}) {
  const template = options.template ? path.resolve(tools.cwd, options.template) : path.resolve(__dirname, '../template/index.ejs')
  return {
    entry: {
      main: options.entry,
    },
    output: {
      path: isProduction ? path.resolve('./dist') : undefined,
      filename: isProduction ? 'js/[name].[contenthash:10].js' : 'js/[name].js',
      chunkFilename: isProduction ? 'js/[name].chunk.[contenthash:10].js' : 'js/[name].chunk.js',
      assetModuleFilename: isProduction ? 'media/[hash:10][ext][query]' : 'images/[hash][ext][query]',
      clean: isProduction,
      publicPath: ''
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    resolve: {
      extensions: ['.jsx', '.js', '.json']
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.css$/i,
              use: getStyleLoaders()
            },
            {
              test: /\.less$/i,
              use: getStyleLoaders('less-loader')
            },
            {
              test: /\.s[ac]ss$/i,
              use: getStyleLoaders('sass-loader')
            },
            {
              test: /\.styl$/i,
              use: getStyleLoaders('stylus-loader')
            },
            {
              test: /\.(png|jpe?g|gif|svg)$/i,
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: 8 * 1024
                }
              },
            },
            {
              test: /\.txt$/i,
              type: 'asset/source'
            },
            {
              test: /\.(woff2?|ttf)$/,
              type: 'asset/resource',
            },
            {
              test: /\.jsx?$/,
              use: [
                {
                  loader: 'thread-loader',
                  options: {
                    works: threads,
                  },
                },
                {
                  loader: 'babel-loader',
                  options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                    plugins: [!isProduction && 'react-refresh/babel'].filter(Boolean)
                  },
                }
              ]
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        title: options.title || 'react-app',
        template,
      }),
      isProduction && new MiniCssExtractPlugin({
        filename: 'styles/[name].[contenthash:10].css',
        chunkFilename: 'styles/[name].chunk.[contenthash:10].css',
      }),
      !isProduction && new ESLintPlugin({
        context: path.resolve(tools.cwd, './src'),
        exclude: 'node_modules',
        cache: true,
        cacheLocation: path.resolve(
            tools.cwd,
            './node_modules/.cache/eslint-webpack-plugin/.eslintcache'
        ),
        threads
      }),
      new PreloadWebpackPlugin({
        rel: 'prefetch',
      }),
      !isProduction && new ReactRefreshWebpackPlugin(),
      isProduction && new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(tools.cwd, './public'),
            to: path.resolve(tools.cwd, './dist'),
            globOptions: {
              ignore: ['**/index.html', '**/index.ejs'],
            },
          },
        ],
      }),
      new webpack.ProgressPlugin({
        activeModules: true,         // 默认false，显示活动模块计数和一个活动模块正在进行消息。
        entries: true,               // 默认true，显示正在进行的条目计数消息。
        modules: false,              // 默认true，显示正在进行的模块计数消息。
        modulesCount: 5000,          // 默认5000，开始时的最小模块数。PS:modules启用属性时生效。
        profile: false,              // 默认false，告诉ProgressPlugin为进度步骤收集配置文件数据。
        dependencies: false,         // 默认true，显示正在进行的依赖项计数消息。
        dependenciesCount: 10000,    // 默认10000，开始时的最小依赖项计数。PS:dependencies启用属性时生效。
        handler(percentage, message, ...args) {   // 钩子函数
          console.log(chalk.green.bold(~~(percentage * 100) + '%') + ' ' + chalk.blue.bold(message) + ' ' + args.join(chalk.blue.bold(' | ')))
        }
      }),
    ].filter(Boolean),
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            name: 'vendors',
            filename: 'js/[name].chunk.[contenthash:10].js'
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          react: {
            test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
            name: 'react',
            priority: 40,
            filename: 'js/[name].chunk.[contenthash:10].js'
          },
        }
      },
      minimize: isProduction,
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserWebpackPlugin({
          parallel: threads,
        }),
      ],
      runtimeChunk: {
        name: (entrypoint) => `runtime~${entrypoint.name}.js`,
      },
    },
    performance: false
  }
}
