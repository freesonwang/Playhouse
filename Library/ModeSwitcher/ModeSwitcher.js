var ModeSwitcher = new Class
({
	initialize: function(attributes)
	{
		this.name  = ko.observable($default(attributes.name, undefined, "name is required"))
		this.modes = ko.observableArray($default(attributes.modes, undefined, "modes are required"));
		this.active_mode = ko.observable();
		this.DeactivateAllModes();
		if(attributes.default_mode) {
			this.SwitchMode(attributes.default_mode)
		}
	},

	IsActive: function(mode)
	{
		return this.active_mode() == mode;
	},

	SwitchMode: function(mode_name)
	{
		var new_mode = this.modes().filter(function(mode){return mode.name == mode_name}).pick();
		assert($chk(new_mode), "Mode:'" + mode_name + "' could not be found.");
		var old_mode = this.active_mode();
		if (old_mode && old_mode.responder) {
			old_mode.responder.detach();
		}
		if(new_mode.responder) {
			new_mode.responder.attach();
		}
		this.active_mode(new_mode);
	},

	DeactivateAllModes: function()
	{
		this.modes().each(function(mode){
			if(mode.responder) {
				mode.responder.detach();
			}
		});
	}
})