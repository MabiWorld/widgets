describe('ratePing', function () {
	var ratePing;
	beforeEach(module('serverStat'));
	beforeEach(inject(function (_ratePingFilter_) {
		ratePing = _ratePingFilter_;
	}));

	it('returns off for 0', function () {
		expect(ratePing(0)).toBe('off');
	});

	it('returns low for 1', function () {
		expect(ratePing(1)).toBe('low');
	});

	it('returns low for 49', function () {
		expect(ratePing(49)).toBe('low');
	});

	it('returns low for 50', function () {
		expect(ratePing(50)).toBe('low');
	});

	it('returns medium for 51', function () {
		expect(ratePing(51)).toBe('medium');
	});

	it('returns medium for 499', function () {
		expect(ratePing(499)).toBe('medium');
	});

	it('returns medium for 500', function () {
		expect(ratePing(500)).toBe('medium');
	});

	it('returns high for 501', function () {
		expect(ratePing(501)).toBe('high');
	});

	it('returns high for 2000', function () {
		expect(ratePing(2000)).toBe('high');
	});
});