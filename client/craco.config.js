const reactHotReloadPlugin = require('craco-plugin-react-hot-reload');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WebpackBar = require('webpackbar');
const CracoAntDesignPlugin = require('craco-antd');
const path = require('path');
const fs = require('fs');
const rewireBabelLoader = require('craco-babel-loader');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// Don't open the browser during development
process.env.BROWSER = 'none';

let plugins = [
  {
    plugin: CracoAntDesignPlugin,
    options: {
      customizeThemeLessPath: path.join(__dirname, 'src/antd.customize.less'),
    },
  },
  {
    plugin: rewireBabelLoader,
    options: {
      includes: [resolveApp('node_modules/isemail')],
      excludes: [/(node_modules|bower_components)/],
    },
  },
];

if (process.env.NODE_ENV !== 'production') {
  plugins.push({ plugin: reactHotReloadPlugin });
}

module.exports = {
  webpack: {
    plugins: [
      new WebpackBar({ profile: true }),
      ...(process.env.NODE_ENV === 'development' ? [new BundleAnalyzerPlugin({ openAnalyzer: false })] : []),
    ],
  },
  plugins: plugins,
};
