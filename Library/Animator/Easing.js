// Easing.js

var Easing = 
{
	LinearTween: function(time, begin, change, duration)
	{
		return begin + (change/duration) * time;
	},

	EaseOutBounce: function(t, b, c, d)
	{
		t = t / d;
		if (t < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	}
}