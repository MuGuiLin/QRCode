const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: './',
  lintOnSave: false,
  filenameHashing: true,
  transpileDependencies: true,
  productionSourceMap: false,

  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    port: 8080,
    compress: true,
    proxy: {
      '/api': {
        target: 'https://www.xxx.com',
        secure: true,
        changeOrigin: true,
        ws: false,
        pathRewrite: {
          '^/api': '/',
        },
      },
    },
  },
})
