const assert = require('assert');
const builders = require('..');
describe('dibsjs webpack builders', function () {
    it('should respect overrides', function () {
        assert(
            !builders.css({
                'css-loader': {
                    modules: undefined
                }
            })({}).module.loaders[0].loader.match(/modules/)
        );
        assert(
            builders.css()({}).module.loaders[0].loader.match(/modules/)
        );
    });
});
