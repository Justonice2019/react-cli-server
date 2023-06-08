const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const tools = require('./utils/tools');

process.env.NODE_ENV = 'development'

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
  entry: compileConfig.workingDir
};

const webpackDefaultConfig = require('../conf/webpack.config')(options);
// 合并 webpack 配置
let webpackConfig = webpackDefaultConfig;
if (fs.existsSync(path.join(tools.cwd, webpackConfigPath))) {
  webpackConfig = webpackMerge.smart(webpackDefaultConfig, require(path.join(cwd, webpackConfigPath)))
}

const devServer = new WebpackDevServer(webpack(webpackConfig));

devServer.listen(devConfig.port, devConfig.host, () => {
  console.log(chalk.green(`Server started on http://${devConfig.host}:${devConfig.port}, Please wait while webpack compiling modules...`));
});
