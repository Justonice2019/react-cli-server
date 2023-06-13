const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const tools = require('./utils/tools');

process.env.NODE_ENV = 'development'

try{
  const {
    DEV
  } = require('./utils/env');

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
    template: compileConfig.template
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
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      if (compileConfig.api) {
        const handler = require(path.join(tools.cwd, compileConfig.api))
        handler(middlewares, devServer)
      }
      return middlewares;
    },
    ...devConfig,
  };

  const devServer = new WebpackDevServer(serverOptions, webpack(webpackConfig));

  devServer.listen(devConfig.port, devConfig.host, () => {
    console.log(chalk.green(`Server started on http://${devConfig.host}:${devConfig.port}, Please wait while webpack compiling modules...`));
  });
} catch(ex) {
  console.log(chalk.red(ex));
  process.exit(1);
}
