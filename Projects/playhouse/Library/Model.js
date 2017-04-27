var Model = new Class
({
	Extends: Geometry,

	initialize: function(gl, attributes)
	{
		this.parent(gl, attributes);
		this.id_name               = ko.computed(function(){
			return  "Model" + this.id();
		}, this);
		
		this.is_selectable         = ko.observable($default(attributes.is_selectable,         true));
		this.is_selected           = ko.observable($default(attributes.is_selected,           false));
		
		this.texture_dialog_name   = ko.observable($default(attributes.texture_dialog_name, "Set texture"));
		this.dialog                = new Dialog(this.name, $default(attributes.dialog_is_open, false), $default(attributes.dialog_bg, null));
		this.texture_dialog        = new Dialog(this.texture_dialog_name, $default(attributes.texture_dialog_is_open, false));
		this.can_show_data         = ko.observable($default(attributes.can_show_data,         true));
		this.can_delete            = ko.observable($default(attributes.can_delete,            true));
		this.can_toggle_visibility = ko.observable($default(attributes.can_toggle_visibility, true));
		
		var self = this;
		this.can_texture           = ko.computed(function(){
			return $chk(this.texcoords());
		}, self);
		this.dialog.is_open.subscribe(function(new_value) {
			self.ToggleSelection(new_value);
		});
		this.is_selected.subscribe(function(new_value) {
			self.dialog.is_open(new_value);
		});
	},

	GetShaderRequirements: function()
	{
		var requirements = this.parent();
		requirements.is_selected = this.is_selected();
		return requirements;
	},

	Select: function()
	{
		this.ToggleSelection(true);
	},

	Deselect: function()
	{
		this.ToggleSelection(false);
	},

	ToggleSelection: function(want_selected)
	{
		if(this.is_selectable()) {
			this.is_selected(want_selected);
		}
	}
});
