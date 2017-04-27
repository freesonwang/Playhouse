var Application = new Class
({
	Extends: GeometryScene,

	initialize: function(attributes)
	{
		this.canvas_id          = ko.observable     ($default(attributes.canvas_id,          undefined, "canvas_id is required."));
		this.pages              = ko.observable     ($default(attributes.pages,              undefined, "Pages is required."));
		this.default_page       = ko.observable     ($default(attributes.page,               undefined, "Current page is required."));
		this.current_page       = ko.observable     ($default(attributes.page,               undefined, "Current page is required."));
		this.texture_list       = ko.observable     ($default(attributes.texture_list,       undefined, "Texture list is required."));
		this.model_catalog      = ko.observable     ($default(attributes.model_catalog,      undefined, "Model catalog is required."));
		this.theme_bases        = ko.observableArray($default(attributes.theme_bases,        undefined, "Theme bases is required."));
		this.theme_accents      = ko.observableArray($default(attributes.theme_accents,      undefined, "Theme accents is required."));
		this.is_sidepanel_open  = ko.observable     ($default(attributes.is_sidepanel_open,  true));
		this.is_conductor_open  = ko.observable     ($default(attributes.is_conductor_open,  true));
		this.last_selected      = ko.observable     ($default(attributes.last_selected,      null));
		this.mode_switchers     = ko.observableArray($default(attributes.mode_switchers,     []));
		this.parent(attributes);
		this.models             = ko.computed(function(){
			return this.geometries().filter(function(geometry){
				return geometry instanceof Model;
			})
		}, this);
		this.selected_models     = ko.computed(function(){
			return this.models().filter(function(model){
				return model.is_selected();
			})
		}, this);
		this.average_position    = ko.computed(function(){
			var x = this.AverageSelectedModelProperty("position_x");
			var y = this.AverageSelectedModelProperty("position_y");
			var z = this.AverageSelectedModelProperty("position_z");
			return [x, y, z];
		}, this);
		this.move_manipulator = null;
	},

	AverageSelectedModelProperty: function(key)
	{
		return this.models().filter(function(model){
			return model.is_selected();
		}).map(function(selected_model){
			return selected_model[key]();
		}).average();
	},

	GetModelFromID: function(id)
	{
		return this.models().filter(function(model) {
			return model.id() == id 
		}).pick();
	},

	SelectAllModels: function()
	{
		this.models().each(function(model){
			model.Select();
		});
	},

	DeselectAllModels: function()
	{
		this.models().each(function(model){
			model.Deselect();
		});
	},

	AddPointLight: function()
	{
		this.AddAModelFromCatalog("Point Light", "primitive", "PointLight", "../../Resources/Models/Primitives/Sphere/SphereBG.png");
	},

	AddAModelFromCatalog: function(name, type, key, bg)
	{
		var spinner = new Spinner(document.body, {
			message: "Please wait..."
		});
		spinner.chain(function(){
			spinner.show(true);
		});
		spinner.chain(this.AddModelByType.bind(this, [name, type, key, bg]));
		this.animators()[0].addEvent("complete", function(){
			spinner.hide();
		});
		spinner.callChain();
		spinner.callChain();
	},

	AddModelByType: function(name, type, key, bg)
	{
		if ("primitive" == type) {
			var gl = this.gl;
			var data = null;
			if ("Cube" == key) {
				var x = 1;
				var y = 1; 
				var z = 1;
				data = CreateRectangularPrismData(gl, x, y, z);
			}
			else if ("Sphere" == key) {
				var radius = 1;
				var latitude_resolution = 20;
				var longitude_resolution = 20;
				data = CreateSphereData(gl, radius, latitude_resolution, longitude_resolution);
			}
			else if ("PointLight" == key) {
				var radius = 0.25;
				var latitude_resolution = 20;
				var longitude_resolution = 20;
				data = CreateSphereData(gl, radius, latitude_resolution, longitude_resolution);
			}
			else if ("Plane" == key) {
				var h_length = 10.0;
				var v_length = 10.0;
				var cols = 10;
				var rows = 10;
				var axis = [0, 1, 0];
				var axis_value = 0.0;
				data = CreatePlaneData(gl, h_length, v_length, cols, rows, axis, axis_value)
			}
			else if ("Cone" == key) {
				var radius   = 1.0;
				var segments = 25;
				var height   = 2;
				var axis     = [0, 1, 0];
				data = CreateConeData(gl, radius, segments, height, axis);
			}
			assert($chk(data), "Invalid key was passed from catalog");
			data.name = name;
			if($chk(bg)) data.dialog_bg = bg;
			this.AddModel(data);
		}
		else if ("obj" == type) {
			var self = this;
			LoadFile(key, true, function(response_text){
				var data = ParseOBJModelText(self.gl, key, response_text);
				data.name = name;
				if($chk(bg)) data.dialog_bg = bg;
				self.AddModel(data);
			});
		}
	},

	AddModel: function(data)
	{
		var self = this;
		var gl = this.gl;
		var model = new Model(gl, data);
		this.AddGeometry(model);
		this.animators()[0].AttachGeometry(model);
		return model;
	},

	DeleteModel: function(model)
	{
		model.dialog.is_open(false);
		this.animators()[1].AttachGeometry(model);
		return model;
	},

	SwitchPage: function(page)
	{
		this.current_page(page);
	},

	SwitchToDefaultPage: function()
	{
		this.current_page(this.default_page());
	},

	IsOnDefaultPage: function()
	{
		return this.current_page() == this.default_page();
	}, 

	EnableBase: function(base)
	{
		EnableStylesheetForGroup(base.name, "Base");
	},

	EnableAccent: function(accent)
	{
		EnableStylesheetForGroup(accent.name, "Accent");
	}
});
