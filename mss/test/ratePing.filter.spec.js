describe('ratePing', function () {
	var ratePing;
	beforeEach(module('serverStat'));
	beforeEach(inject(function (_ratePingFilter_) {
		ratePing = _ratePingFilter_;
	}));

	it('returns off for 0', function () {
		expect(ratePing(0)).toBe('off');
	});
});