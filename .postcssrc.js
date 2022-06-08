module.exports = {
    plugins: {
      "postcss-import": {},
      autoprefixer: {},
      "postcss-url": {},
      "postcss-aspect-ratio-mini": {},
      "postcss-write-svg": {
        utf8: false
      },
      'postcss-px-to-viewport': {
        unitToConvert: "px",
        viewportWidth: 375, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
        viewportHeight: 812, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
        unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
        viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
        fontViewportUnit: "vw",
        selectorBlackList: ['.ig-'],  // <div class="ig-aa"></div> 指定不转换为视窗单位的类，在该类型名下写不会转换为vw，可以无限添加,建议定义一至两个通用的类名
        minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
        mediaQuery: false, // 允许在媒体查询中转换`px`
        replace: true,
        exclude: /(\/|\\)(node_modules)(\/|\\)/
      },
      'postcss-viewport-units': {
        filterRule: rule => rule.selector.includes('::after') && rule.selector.includes('::before')
      },
      "cssnano": {
        "cssnano-preset-advanced": {
          zindex: false,
          autoprefixer: false
        },
      }
    }
  }