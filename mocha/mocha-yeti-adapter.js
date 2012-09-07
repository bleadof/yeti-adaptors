/*
 * - BUNYIP - http://github.com/ryanseddon/bunyip
 * Yeti Jasmine adaptor, drop this in a test suite that will run through Yeti.
 * See readme.md for specific instructions.
 * MIT License - Copyright (c) 2012 Ryan Seddon
 * http://github.com/ryanseddon/yeti-adpators
*/

var BUNYIP = BUNYIP || {};

(function(win, undef){

    var testsuite = {}, spec,
        tostring = {}.toString;

    BUNYIP = testsuite;

    if (typeof module !== 'undefined' &&
        module.exports) {
        module.exports = BUNYIP;
    }

    /**
     * Initialize a new `Base` reporter.
     *
     * All other reporters generally
     * inherit from this reporter, providing
     * stats such as test duration, number
     * of tests passed / failed etc.
     *
     * @param {Runner} runner
     * @api public
     */

    function Base(runner) {
        var self = this,
            stats = this.stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 },
            failures = this.failures = [],
            slow = 75;

        if (!runner) return;
        this.runner = runner;

        runner.on('start', function(){
            stats.start = new Date;
        });

        runner.on('suite', function(suite){
            stats.suites = stats.suites || 0;
            suite.root || stats.suites++;
        });

        runner.on('test end', function(test){
            stats.tests = stats.tests || 0;
            stats.tests++;
        });

        runner.on('pass', function(test){
            stats.passes = stats.passes || 0;

            var medium = slow / 2;
            test.speed = test.duration > slow
                ? 'slow'
                : test.duration > medium
                ? 'medium'
                : 'fast';

            stats.passes++;
        });

        runner.on('fail', function(test, err){
            stats.failures = stats.failures || 0;
            stats.failures++;
            test.err = err;
            failures.push(test);
        });

        runner.on('end', function(){
            stats.end = new Date;
            stats.duration = new Date - stats.start;
        });

        runner.on('pending', function(){
            stats.pending++;
        });
    }

    function BunyipReporter(runner) {
        Base.call(this, runner);
        var _biResults = {},
            self = this;

        self._biResults = _biResults;

        runner.on('suite', function(suite) {
            if(suite.tests.length < 1) {
                return;
            }
            var suiteName = suite.fullTitle();
            if(!_biResults[suiteName]) {
                _biResults[suiteName] = {
                    name: suiteName,
                    total: suite.total(),
                    passed: 0,
                    failed: 0
                };
            }
        });

        runner.on('test end', function(test) {
            var suite = test.parent,
                suiteName = suite.fullTitle(),
                testState = test.state !== 'failed' ? 'pass' : 'fail';
           if(_biResults[suiteName]) {
                _biResults[suiteName].passed += (testState !== 'fail' ? 1 : 0);
                _biResults[suiteName].failed += (testState === 'fail' ? 1 : 0);
            }
            console.log(self);
            _biResults[suiteName][test.title] = {
                result: testState,
                message: test ? self.message(test): '',
                name: test.title
            };
        });
        runner.on('end', function() {
            _biResults.passed = self.stats.passes;
            _biResults.failed = self.stats.failures;
            _biResults.total = self.stats.tests;
            _biResults.duration = self.stats.duration;
        });
    }

    BunyipReporter.prototype = new Base();
    BunyipReporter.prototype.constructor = BunyipReporter;

    BunyipReporter.prototype.message = function(test) {
        var message = "";
        if(test.state === 'failed') {
            message = test.err.message;
        }
        return message;
    };

    BunyipReporter.prototype.results = function() {
        return this._biResults;
    };

    /* Yeti uses socket.io and emits a results event when test suite has completed */
    BunyipReporter.prototype.complete = function(results) {
        //console.log(results);
        if (win.$yetify !== undef) {
            $yetify.tower.emit("results", results);
        }
    };

    BUNYIP.BunyipReporter = BunyipReporter;

    BUNYIP.hookup = function(mocha) {
        mocha.setup({reporter: BunyipReporter});
    };

})(this);