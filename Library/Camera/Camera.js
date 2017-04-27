// Camera.js
// Represents a camera for the scene. Allows tracking, panning, and zooming.

var Camera = new Class
({
	Extends: Trackable,

	initialize: function(canvas, attributes)
	{
		this.position     = ko.observable($default(attributes.position, undefined, "position is required."))
		this.rot_x        = ko.observable($default(attributes.rot_x, undefined, "rot_x is required."))
		this.rot_y        = ko.observable($default(attributes.rot_y, undefined, "rot_y is required."))
		this.zoom         = ko.observable($default(attributes.zoom, undefined, "zoom is required."))
		this.zoom_factor  = ko.observable($default(attributes.zoom_factor, undefined, "zoom_factor is required."))
		this.pan_factor   = ko.observable($default(attributes.pan_factor, undefined, "pan_factor is required."))
		this.track_factor = ko.observable($default(attributes.track_factor, undefined, "track_factor is required."))
		this.can_spin     = ko.observable($default(attributes.can_spin, undefined, "can_spin is required.")) //X
		this.can_roll     = ko.observable($default(attributes.can_roll, undefined, "can_roll is required.")) //Y
		this.can_pan      = ko.observable($default(attributes.can_pan, undefined, "can_pan is required."))
		this.can_zoom     = ko.observable($default(attributes.can_zoom, undefined, "can_zoom is required."))
	},

	Track: function(event)
	{
		this.SetXYDifference(event.client.x, event.client.y);
		if (this.can_roll()) {
			this.rot_x(this.rot_x() +  this.track_factor() * this.diff_y);
		}
		if (this.can_spin()) {
			this.rot_y(this.rot_y() + this.track_factor() * this.diff_x);
		}
	},

	Zoom: function(event)
	{
		this.SetXYDifference(event.client.x, event.client.y);
		if (this.can_zoom()) {
			this.zoom(this.zoom() - this.zoom_factor() * this.diff_y);
		}
	},

	Pan: function(event)
	{
		this.SetXYDifference(event.client.x, event.client.y);
		if (this.can_pan()) {
			this.position([this.position()[0]  + this.pan_factor() * this.diff_x,
			this.position()[1]  - this.pan_factor() * this.diff_y,
			this.position()[2]]);
		}
	},

	Look: function(p_mat)
	{
		mat4.translate(p_mat, [0, 0, -this.zoom()]);
		mat4.translate(p_mat, this.position());
		mat4.rotate(p_mat, this.rot_x(), [1, 0, 0]);
		mat4.rotate(p_mat, this.rot_y(), [0, 1, 0]);
		return p_mat;
	},

	SetToPosition: function(position, rot_x, rot_y, zoom)
	{
		this.position(position);
		this.rot_x(rot_x);
		this.rot_y(rot_y);
		this.zoom(zoom);
	}
});

