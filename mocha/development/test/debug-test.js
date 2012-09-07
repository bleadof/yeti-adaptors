(function() {
    if (typeof module !== 'undefined' && module.exports) {
        var expect = require('expect.js');
    }

    describe('Array', function() {
        describe('#indexOf()', function() {
            it('should return -1 when the value is not present', function(){
                expect([1,2,3].indexOf(5)).to.be(-1);
                expect([1,2,3].indexOf(0)).to.be(-1);
            });
        });
        describe('#length', function() {
            it('should return 3 for [1,2,3]', function() {
                expect([1,2,3].length).to.be(3);
            });
            it('should return 0 for []', function() {
                expect([].length).to.be(0);
            });
        });
    });
})();