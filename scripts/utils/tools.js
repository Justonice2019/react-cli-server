const {program} = require('commander')
const chalk = require('chalk');
const path = require('path')
const {DEV} = require('./env');
const cwd = process.cwd()
// const NODE_MODULES = path.join(cwd, 'node_modules');
// const parseJson = file => JSON.parse(fs.readFileSync(file));
// const isModule = name => {
//   if(name.includes('./'))
//     return false;
//   return true;
// };
//
// const getModuleMainPath = moduleName => {
//   const packageJson = parseJson(path.join(NODE_MODULES, moduleName, 'package.json')) || {};
//   return path.join(NODE_MODULES, moduleName, packageJson.main);
// };
module.exports = {
  cwd,
  // NODE_MODULES,
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
  // // 获取所有 client 信息
  // resolveClients: dependencies => {
  //   let _dependencies
  //   if(typeof dependencies === 'string')
  //     _dependencies = [dependencies]
  //   else
  //     _dependencies = dependencies
  //   const pages = {};
  //   _dependencies.forEach(clientName => {
  //     const mainPath = path.join(cwd, clientName);
  //     const clientConfig = require(mainPath);
  //     // 解析所有 Page
  //     Object.keys(clientConfig.pages).forEach(pageName => {
  //       const page = clientConfig.pages[pageName];
  //       const key = pageName.replace(/\//g, '.');
  //       pages[key] = {
  //         url: pageName,
  //       };
  //       if(page.path)
  //         pages[key].path = isModule(clientName)
  //             ? path.join(NODE_MODULES, clientName, `./lib/${page.path}`)
  //             : path.join(cwd, clientName, page.path);
  //       else if(page.dependency)
  //         pages[key].path = path.join(NODE_MODULES, page.dependency);
  //       else
  //         console.log(chalk.red(`Not found path or dependency in ${pageName}`));
  //     });
  //   })
  //   return pages;
  // },
}
