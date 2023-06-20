const {program} = require('commander')
const path = require('path')
const {DEV} = require('./env');
const cwd = process.cwd()
module.exports = {
  cwd,
  getConfig: configPath => {
    const config = require(path.join(cwd, configPath))
    const defaultConfig = require(path.join(__dirname, '../../conf/tools.default.conf.js'));
    return Object.freeze({
      compile: {
        ...defaultConfig.compile,
        ...config.compile
      },
      dev: {
        ...defaultConfig.dev,
        ...config.dev
      },
    });
  },
  getCmdParams: env => {
    program
        .usage('<command> [options]')
        .description('react-cli-server start --config ./conf/tools.conf.js -w ./conf/webpack.dev.conf.js')
        .option('-c, --config <path>', 'Tools config json file', './conf/tools.conf.js')
        .option('-w, --webpack <path>', 'Webpack config file', env === DEV ? './conf/webpack.dev.conf.js' : './conf/webpack.prod.conf.js')
    program.parse()
    return program.opts()
  },
}
