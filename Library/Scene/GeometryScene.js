//GeometryScene.js
//A GeometryScene supports drawing geometry created from points in a float array.
//It keeps an array of geometry and during simply calls draw on all of the geometries
//in the array.

var GeometryScene = new Class
({
	Extends: Scene,

	initialize: function(attributes)
	{
		this.parent($default(attributes.canvas, undefined, "canvas is required"));
		this.canvas_width             = ko.observable($default(attributes.canvas_width,  window.getSize().x));
		this.canvas_height            = ko.observable($default(attributes.canvas_height, window.getSize().y));
		
		this.camera                   = $default(attributes.camera, undefined, "Camera is required");
		this.geometries               = ko.observableArray($default(attributes.geometries, []));
		this.id_counter               = 0;
		this.shaders                  = new Object();
		this.animators                = ko.observableArray($default(attributes.animators, []));
		this.textures                 = new Object();
		
		this.dirlight_ambient_color   = ko.observable($default(attributes.dirlight_ambient_color, [0, 0, 0]));
		this.dirlight_diffuse_color   = ko.observable($default(attributes.dirlight_diffuse_color, [1, 1, 1]));
		this.dirlight_direction       = ko.observable($default(attributes.dirlight_direction,     [1, 1, 1]));
		
		this.framebuffer              = null;
		this.texturebuffer            = null;
		this.renderbuffer             = null;

		this.ptlights                 = ko.observableArray($default(attributes.ptlights, []));
		//
		this.ptlight_pos             = ko.observable([0, 10, 0]);
		this.ptlight_ambient_color   = ko.observable([1, 0, 0]);
		//

		this.drawn_heads_up_geometries = ko.computed(function(){
			return this.geometries().filter(function(geometry){
				return geometry.want_draw_heads_up();
			});
		}, this);

		this.normal_geometries = ko.computed(function(){
			return this.geometries().filter(function(geometry){
				return !geometry.want_draw_heads_up();
			});
		}, this);

		this.draw_order = [this.normal_geometries, this.drawn_heads_up_geometries];

		this.CreateSceneFramebuffer();
	},

	//Adds a piece of Geometry to the scene.
	AddGeometry: function(geometry)
	{
		this.geometries.push(geometry);
		geometry.id(this.id_counter);
		this.id_counter = this.id_counter + 1;
		return geometry;
	},
	
	DeleteGeometry: function(geometry)
	{
		this.geometries.remove(geometry);
		return geometry;
	},

	//Adds an Animator to the scene.
	AddAnimator: function(animator)
	{
		this.animators.push(animator);
		return animator;
	},

	//Loads a texture into the scene.
	LoadTexture: function(path, mag_filter_mode, min_filter_mode)
	{
		var gl = this.gl;
		mag_filter_mode = $chk(mag_filter_mode) ? mag_filter_mode : gl.LINEAR;
		min_filter_mode = $chk(min_filter_mode) ? min_filter_mode : gl.LINEAR_MIPMAP_NEAREST;
		if(!(path in this.textures)) {
			var texture =  CreateTexture(this.gl, path, mag_filter_mode, min_filter_mode);
			this.textures[path] = texture;
		}
		return this.textures[path];
	},

	GetShader: function(requirements)
	{	
		var hash = Object.values(requirements);
		if(!this.shaders[hash]) {
			var shader = new Shader(this.gl, requirements);
			this.shaders[hash] = shader;
		}
		return this.shaders[hash];
	},

	GetOpaqueShader: function(requirements)
	{
		requirements.draw_opaque      = true;
		requirements.draw_translucent = false;
		return this.GetShader(requirements);
	},

	GetTranslucentShader: function(requirements)
	{
		requirements.draw_opaque      = false;
		requirements.draw_translucent = true;
		return this.GetShader(requirements);
	},

	GetPickedGeometryID: function(x, y)
	{
		var gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
		this.PrepareToDraw();
		
		for(var i = 0, ilen = this.draw_order.length; i < ilen; i++) {
			this.draw_order[i]().each(function(geometry){
				var shader   = this.GetShader({
					has_color:        false,
					has_lighting:     false,
					has_texture:      false,
					has_colors:       false,
					draw_opaque:      false,
					draw_translucent: false,
					is_selected:      false,
					want_id_color:    true
				});
				geometry.Draw(this, shader);
			}, this);
		}

		var pixel = ReadPixel(gl, x, y);
		var id = GetIDFromHashColor(pixel);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		if(id >= 0 && id < this.id_counter) {
			return id;
		}
		else {
			return null;
		}
	},

	GetGeometryFromID: function(id)
	{
		return this.geometries().filter(function(geometry) {
			return geometry.id() == id;
		}).pick();
	},

	SetTextureForGeometry: function(geometry, image_path)
	{
		var texture = this.LoadTexture(image_path);
		geometry.SetTexture(texture, image_path);
	},

	CreateSceneFramebuffer: function()
	{
		var w = NearestSuperiorPowerOf2(this.canvas_width());
		var h = NearestSuperiorPowerOf2(this.canvas_height());
		var tuple = CreateFramebuffer(this.gl, w, h);
		this.framebuffer   = tuple[0];
		this.texturebuffer = tuple[1];
		this.renderbuffer  = tuple[2];
	},

	PrepareToDraw: function()
	{
		this.parent();
		this.p_mat = this.camera.Look(this.p_mat);
	},

	//Draws the scene by iterating through the array of Geometry.
	Draw: function()
	{
		this.PrepareToDraw();
		for(var i = 0, ilen = this.draw_order.length; i < ilen; i++) {
			this.draw_order[i]().each(function(geometry){
				var requirements = geometry.GetShaderRequirements();
				var shader   = this.GetShader(requirements);
				assert(shader, "Shader invalid.");
				geometry.Draw(this, shader);
			}, this);
		}
	},

	//Animates the scene, first calling the animators and animating,
	//then calling Draw.
	Run: function()
	{
		var self = this;
		var Tick = function(){
			requestAnimFrame(Tick);

			for(var a = 0, alen = self.animators().length; a < alen; a++) {
				self.animators()[a].Animate(self.gl);
			}

			self.Draw();

			self.canvas.set("width",  self.canvas_width());
			self.canvas.set("height", self.canvas_height());
		};
		Tick();
	}
});
