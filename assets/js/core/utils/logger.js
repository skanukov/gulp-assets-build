;(function() {
    const core = window._core;

    class Logger {
        constructor(tag = '') {
            this._tag = tag;
        }

        log(...messages) {
            console.log(...this._makeMessage(messages));
        }

        _makeMessage(messages) {
            return this._tag ? [`${this._tag}:`].concat(messages) : messages;
        }
    }

    core.utils = core.utils || {};
    core.utils.Logger = Logger;
})();
