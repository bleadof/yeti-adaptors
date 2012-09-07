(function(root) {

    var BUNYIP = root.BUNYIP;

    if (typeof module !== 'undefined' &&
        module.exports) {
        var expect = require('expect.js');
        BUNYIP = require('../mocha-yeti-adapter.js');
    }


    describe('BunyipReporter', function() {
        var reporter;
        var runner;
        var initialFixture = {
            fullTitle: function() {
                return "BunyipReporter onSuite";
            },
            total: function() {
                return 1;
            },
            tests: [1]
        };

        var testFixture1 = {
            parent: initialFixture,
            title: '#onTest',
            state: 'passed'
        };

        var testFixture2 = {
            parent: initialFixture,
            title: '#onTest',
            state: 'failed'
        };

        beforeEach(function(){
            runner = new EventEmitter();
            reporter = new BUNYIP.BunyipReporter(runner);
        });

        it('should have on creation initialized _biResults', function() {
            expect(reporter._biResults).to.be.ok();
        });

        it('should on runner suite event add the suite with initial values to _biResults', function() {
            var suiteName = initialFixture.fullTitle();
            runner.emit('suite', initialFixture);

            expect(reporter._biResults[suiteName]).to.be.ok();
            expect(reporter._biResults[suiteName].name).to.be(suiteName);
            expect(reporter._biResults[suiteName].total).to.be(initialFixture.total());
            expect(reporter._biResults[suiteName].passed).to.be(0);
            expect(reporter._biResults[suiteName].failed).to.be(0);
        });

        it('should on test end event pass add the state to test results', function() {
            var suiteName = initialFixture.fullTitle();
            runner.emit('suite', initialFixture);
            runner.emit('test end', testFixture1);
            expect(reporter._biResults[suiteName].passed).to.be(1);
        });

        it('should on test end event fail add the state to the test results ', function() {
            var suiteName = initialFixture.fullTitle();
            runner.emit('suite', initialFixture);
            runner.emit('test end', testFixture2);
            expect(reporter._biResults[suiteName].failed).to.be(1);
        });

    });


    /*** EventEmitter is our mock base ***/

    /**
     * Check if `obj` is an array.
     */

    function isArray(obj) {
        return '[object Array]' == {}.toString.call(obj);
    }

    /**
     * Event emitter constructor.
     *
     * @api public
     */

    function EventEmitter(){};

    /**
     * Adds a listener.
     *
     * @api public
     */

    EventEmitter.prototype.on = function (name, fn) {
        if (!this.$events) {
            this.$events = {};
        }

        if (!this.$events[name]) {
            this.$events[name] = fn;
        } else if (isArray(this.$events[name])) {
            this.$events[name].push(fn);
        } else {
            this.$events[name] = [this.$events[name], fn];
        }

        return this;
    };

    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    /**
     * Adds a volatile listener.
     *
     * @api public
     */

    EventEmitter.prototype.once = function (name, fn) {
        var self = this;

        function on () {
            self.removeListener(name, on);
            fn.apply(this, arguments);
        };

        on.listener = fn;
        this.on(name, on);

        return this;
    };

    /**
     * Removes a listener.
     *
     * @api public
     */

    EventEmitter.prototype.removeListener = function (name, fn) {
        if (this.$events && this.$events[name]) {
            var list = this.$events[name];

            if (isArray(list)) {
                var pos = -1;

                for (var i = 0, l = list.length; i < l; i++) {
                    if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
                        pos = i;
                        break;
                    }
                }

                if (pos < 0) {
                    return this;
                }

                list.splice(pos, 1);

                if (!list.length) {
                    delete this.$events[name];
                }
            } else if (list === fn || (list.listener && list.listener === fn)) {
                delete this.$events[name];
            }
        }

        return this;
    };

    /**
     * Removes all listeners for an event.
     *
     * @api public
     */

    EventEmitter.prototype.removeAllListeners = function (name) {
        if (name === undefined) {
            this.$events = {};
            return this;
        }

        if (this.$events && this.$events[name]) {
            this.$events[name] = null;
        }

        return this;
    };

    /**
     * Gets all listeners for a certain event.
     *
     * @api public
     */

    EventEmitter.prototype.listeners = function (name) {
        if (!this.$events) {
            this.$events = {};
        }

        if (!this.$events[name]) {
            this.$events[name] = [];
        }

        if (!isArray(this.$events[name])) {
            this.$events[name] = [this.$events[name]];
        }

        return this.$events[name];
    };

    /**
     * Emits an event.
     *
     * @api public
     */

    EventEmitter.prototype.emit = function (name) {
        if (!this.$events) {
            return false;
        }

        var handler = this.$events[name];

        if (!handler) {
            return false;
        }

        var args = [].slice.call(arguments, 1);

        if ('function' == typeof handler) {
            handler.apply(this, args);
        } else if (isArray(handler)) {
            var listeners = handler.slice();

            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
            }
        } else {
            return false;
        }

        return true;
    };

})(this);