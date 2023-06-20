const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const tools = require('./utils/tools');
const {
  PROD
} = require('./utils/env');
process.env.NODE_ENV = 'production'
try{
  const {
    config: configPath,
    webpack: webpackConfigPath
  } = tools.getCmdParams(PROD);

  const {
    compile: compileConfig,
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
  webpack(webpackConfig, (err, stats) => {
    if(err) {
      console.log(chalk.red(err.details || err));
      process.exit(1);
    }
    const info = stats.toJson('verbose');
    if(stats.hasWarnings())
      console.log(chalk.yellow(info.warnings.join('\n')));
    if(stats.hasErrors()) {
      console.log(chalk.red(info.errors.join('\n')));
      process.exit(1);
    }
    console.log(chalk.green(' - publicPath:'), info.publicPath);
  })
} catch(ex) {
  console.log(chalk.red(ex));
  process.exit(1);
}
