const makeLocalModuleRegex = require('local-module-regex');
const addLoader = require('webpack-config-builders').addLoader;
const webpackCombineLoaders = require('webpack-combine-loaders');
const cssLoaderChain = [{
    loader: 'css-loader',
    query: {
        modules: true,
        importLoaders: 1,
        camelCase: true,
        localIdentName: '[path][name]---[local]---[hash:base64:5]'
    }
}, {
    loader: 'postcss-loader'
}];
function buildLoader(loaders, queryOverride) {
    return webpackCombineLoaders(loaders.reduce((memo, loader) => memo.concat(loader), []).map(loader => {
        if ('string' === typeof loader) {
            loader = {loader}
        }
        if (!loader.query) {
            loader = Object.assign({query: {}}, loader);
        }
        if (queryOverride && queryOverride[loader.loader]) {
            loader = Object.assign({}, loader, {query: Object.assign(
                {},
                loader.query,
                queryOverride[loader.loader]
            )});
        }
        return loader;
    }));
};

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
        cssWithExtractor: (extractorPlugin, queryOverride) => addLoader({
            test: /\.s?css$/,
            include: isInPackageRegex,
            loader: extractorPlugin.extract({
                fallbackLoader: 'style-loader',
                loader: buildLoader([cssLoaderChain, 'sass-loader'], queryOverride)
            })
        }),
        css: queryOverride => addLoader({
            test: /\.s?css$/,
            include: isInPackageRegex,
            loader: buildLoader(['style-loader', cssLoaderChain, 'sass-loader'], queryOverride)
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
