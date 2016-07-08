const makeLocalModuleRegex = require('local-module-regex');
const addLoader = require('webpack-config-builders').addLoader;
const cssLoaderChain = `css?modules&importLoaders=1&camelCase&localIdentName=[path][name]---[local]---[hash:base64:5]!postcss!sass`;

const loadersForPackage = packageRoot => {
    const isInPackageRegex = makeLocalModuleRegex(packageRoot);
    return {
        html: addLoader({
            test: /\.html$/,
            include: isInPackageRegex,
            loader: 'webpack-compile-templates/lib/compile'
        }),
        js6x: addLoader({
            test: /\.jsx?$/,
            include: isInPackageRegex,
            loader: 'babel'
        }),
        cssWithExtractor: extractorPlugin => addLoader({
            test: /\.s?css$/,
            include: isInPackageRegex,
            loader: extractorPlugin.extract('style', cssLoaderChain)
        }),
        css: addLoader({
            test: /\.s?css$/,
            include: isInPackageRegex,
            loader: `style!${cssLoaderChain}`
        }),
        json: addLoader({
            test: /\.json$/,
            include: isInPackageRegex,
            loader: 'json'
        }),
        enzyme: function (config) { // externals for enzyme
            if (undefined === config.externals) {
                config = Object.assign({externals: []}, config);
            }
            return Object.assign({}, config, {externals: config.externals.concat([{
                'cheerio': 'window',
                'react/addons': true,
                'react/lib/ExecutionEnvironment': true,
                'react/lib/ReactContext': true
            }])});
        }
    };
};

module.exports.loadersForPackage = loadersForPackage;
Object.assign(module.exports, loadersForPackage(process.cwd()));
