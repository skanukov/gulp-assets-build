;(function() {
    const core = window._core;
    const logger = new core.utils.Logger('layout.js');
    
    class Layout {
        constructor(selector) {
            this._selector = selector;
        }

        init() {
            logger.log('Layout init called for', this._selector);
        }
    }

    core.ui = core.ui || {};
    core.ui.Layout = Layout;
})();
