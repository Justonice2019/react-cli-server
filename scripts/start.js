const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const tools = require('./utils/tools');
const {
  DEV
} = require('./utils/env');
process.env.NODE_ENV = 'development'
try{
  const {
    config: configPath,
    webpack: webpackConfigPath
  } = tools.getCmdParams(DEV);

  const {
    compile: compileConfig,
    dev: devConfig,
  } = tools.getConfig(configPath);

  const options = {
    entry: compileConfig.entry,
    template: compileConfig.template,
  };
  const webpackDefaultConfig = require('../conf/webpack.config')(options);
  let webpackConfig = webpackDefaultConfig;
  if (fs.existsSync(path.join(tools.cwd, webpackConfigPath))) {
    webpackConfig = webpackMerge.merge(webpackDefaultConfig, require(path.join(tools.cwd, webpackConfigPath)))
  }
  const url = `http://${devConfig.host}:${devConfig.port}`;
  const serverOptions = {
    static: {
      publicPath: url,
    },
    client: {
      logging: 'info', // 'log' | 'info' | 'warn' | 'error' | 'none' | 'verbose' 允许在浏览器中设置日志级别，例如在重载之前，在一个错误之前或者 热模块替换 启用时。
      overlay: false, // boolean = true object: { errors boolean = true, warnings boolean = true } 当出现编译错误或警告时，在浏览器中显示全屏覆盖。
      progress: false, // boolean 在浏览器中以百分比显示编译进度。
      reconnect: false, // 告诉 dev-server 它应该尝试重新连接客户端的次数。当为 true 时，它将无限次尝试重新连接。
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      if (compileConfig.api) {
        const handler = require(path.join(tools.cwd, compileConfig.api))
        return handler(middlewares, devServer, compileConfig)
      }
      return middlewares;
    },
    ...devConfig,
  };
  const devServer = new WebpackDevServer(serverOptions, webpack(webpackConfig));
  devServer.start(devConfig.port, devConfig.host, () => {
    console.log(chalk.green(`Server started on ${url}, Please wait while webpack compiling modules...`));
  });
} catch(ex) {
  console.log(chalk.red(ex));
  process.exit(1);
}
