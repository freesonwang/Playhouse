// Trackable.js

var Trackable = new Class
({
	initialize: function(id, attributes)
	{
		this.last_x = null;
		this.last_y = null;
		this.diff_x = null;
		this.diff_y = null;
	},
	
	SetXYDifference: function(x, y)
	{
		this.diff_x = $chk(this.last_x) ? x - this.last_x  : 0;
		this.diff_y = $chk(this.last_y) ? y - this.last_y  : 0;
		this.last_x = x;
		this.last_y = y;
	},

	ClearXYDifference: function()
	{
		this.last_x = null;
		this.last_y = null;
		this.diff_x = null;
		this.diff_y = null;
	}
});
