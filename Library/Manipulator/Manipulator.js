var Manipulator = new Class
({
	Extends: Trackable,

	initialize: function(attributes)
	{
		this.controls = ko.observableArray($default(attributes.controls, undefined, "Controls are required."));
		assert(this.controls().every(function(control) {
			return $chk(control.geometries) && control.geometries.length > 0;
		}), "Controls require geometry.");
		this.current_control = null;
		this.attached_geometries = ko.observableArray();
	},

	RespondToDrag: function(event)
	{
		this.SetXYDifference(event.client.x, event.client.y);
	},

	HasClickedControlGeometry: function(geometry)
	{
		var control = this.controls().filter(function(control){
			return control.geometries.indexOf(geometry) >= 0;
		}).pick();
		return control;
	},

	SetPositionForControls: function(x, y, z)
	{
		this.controls().each(function(control){
			control.geometries.each(function(geometry){
				geometry.SetPosition(x, y, z);
			});
		});
	},

	SetCurrentControl: function(geometry)
	{
		var control = this.controls().filter(function(control){
			return control.geometries.contains(geometry)
		}).pick();
		assert($chk(control), "Control should be found");
		this.current_control = control;
	},

	ClearCurrentControl: function()
	{
		this.current_control = null;
	},

	HideControls: function()
	{
		this.ToggleControlsVisibility(false);
	},

	ShowControls: function()
	{
		this.ToggleControlsVisibility(true);
	},

	ToggleControlsVisibility: function(want_visible)
	{
		this.controls().each(function(control){
			control.geometries.each(function(geometry){
				geometry.is_visible(want_visible);
			});
		});
	}
})


