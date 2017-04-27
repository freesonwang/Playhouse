// InterpolatedAnimator.js

var InterpolatedAnimator = new Class
({
	Extends: Animator,

	initialize: function(attributes)
	{
		this.parent(attributes);
		this.duration     = ko.observable     ($default(attributes.duration,     1.0));
		this.interpolates = ko.observableArray($default(attributes.interpolates, null));
		this.easing       = ko.observable     ($default(attributes.easing,       Easing.LinearTween)); 
		this.constants    = ko.observable     ($default(attributes.constants,    {}));
		this.callback     = this.addEvent("complete", attributes.callback);
		assert($chk(this.interpolates()),   "Interpolates cannot be null");
		assert($chk(this.constants()),      "Interpolates cannot be null");
		assert($chk(this.duration() > 0.0), "Duration must be positive")
	},

	AttachGeometry: function(geometry)
	{
		this.parent(geometry);
		for(key in this.constants()) {
			geometry[key](this.constants()[key]);
		}
		for(var i = 0; i < this.interpolates().length; i++) {
			var interpolate = this.interpolates()[i];
			var key = interpolate.key;
			interpolate.initial = $chk(interpolate.initial) ? interpolate.initial : geometry[key]() + interpolate.initial_offset;
			interpolate.target  = $chk(interpolate.target)  ? interpolate.target  : geometry[key]() + interpolate.target_offset;
			geometry[key](interpolate.initial);
		}
		return geometry;
	},

	DetachGeometry: function(geometry)
	{
		this.parent(geometry);
		delete geometry._InterpolatedAnimator_start_time;
		return geometry;
	},

	Animate: function(gl)
	{
		for (var g = 0; g < this.geometries().length; g++) {
			var geometry = this.geometries()[g];
			geometry._InterpolatedAnimator_start_time = geometry._InterpolatedAnimator_start_time || new Date();
			var is_done = true;
			for(var i = 0; i < this.interpolates().length; i++) {
				var interpolate = this.interpolates()[i];
				var key         = interpolate.key;
				var initial     = interpolate.initial;
				var target      = interpolate.target;
				var current     = geometry[key]();
				var dist        = target - initial;
				var done_now    = dist > 0 && current >= target || dist < 0 && current <= target || dist == 0;
				if(!done_now) {
					var time     = MillisecondsToSeconds(new Date().getTime() - geometry._InterpolatedAnimator_start_time.getTime());
					var begin    = initial;
					var finish   = target;
					var duration = this.duration();
					var interpolated_value = this.easing()(time, begin, dist, duration);
					geometry[key](interpolated_value);
				}
				is_done = is_done && done_now;
			};
			if(is_done) {
				for(var i = 0; i < this.interpolates().length; i++) {
					var interpolate = this.interpolates()[i];
					geometry[interpolate.key](interpolate.target);
				}
				this.DetachGeometry(geometry);
				this.fireEvent("complete", [geometry]);
			}
		}
	}
});
