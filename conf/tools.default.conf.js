module.exports = {
  compile: {
    entry: './src/main.js',
    api: './api',
  },
  dev: {
    host: 'localhost', // 启动服务器域名
    port: 3000, // 启动服务器端口号
    open: true, // 是否自动打开浏览器
    hot: true, // 开启HMR功能（只能用于开发环境，生产环境不需要了）
    historyApiFallback: true,
  }
}
