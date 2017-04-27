// Geometry.js

var Geometry = new Class
({
	initialize: function(gl, attributes)
	{
		this.name                  = ko.observable($default(attributes.name, "Geometry"));
		if(attributes["vertices"]  instanceof Array && !$chk(attributes["groups"])) attributes["groups"] = Group.CreateDefaultGroup(this.name(), attributes["vertices"]);
		if(attributes["vertices"]  instanceof Array) attributes["vertices"]  = Buffer.ToBuffer(gl, "vertices",  attributes["vertices"]);
		if(attributes["indices"]   instanceof Array) attributes["indices"]   = Buffer.ToBuffer(gl, "indices",   attributes["indices"]);
		if(attributes["normals"]   instanceof Array) attributes["normals"]   = Buffer.ToBuffer(gl, "normals",   attributes["normals"]);
		if(attributes["texcoords"] instanceof Array) attributes["texcoords"] = Buffer.ToBuffer(gl, "texcoords", attributes["texcoords"]);
		if(attributes["colors"]    instanceof Array) attributes["colors"]    = Buffer.ToBuffer(gl, "colors",    attributes["colors"]);
		this.draw_mode             = ko.observable($default(attributes.draw_mode,             undefined, "Draw mode is required."));
		this.vertices              = ko.observable($default(attributes.vertices,              undefined, "Vertices is required."));
		this.groups                = ko.observable($default(attributes.groups,                undefined, "Groups is required."));
		this.indices               = ko.observable($default(attributes.indices,               null));
		this.normals               = ko.observable($default(attributes.normals,               null));
		this.texcoords             = ko.observable($default(attributes.texcoords,             null));
		this.colors                = ko.observable($default(attributes.colors,                null));
		this.texture               = ko.observable($default(attributes.texture,               null));
		this.is_visible            = ko.observable($default(attributes.is_visible,            true));
		this.want_translucent_pass = ko.observable($default(attributes.want_translucent_pass, true));
		this.want_draw_heads_up    = ko.observable($default(attributes.want_draw_heads_up,   false));
		this.id                    = ko.observable($default(attributes.id,                    null));
		this.color_r               = ko.computed(Geometry.CreateFloatObservable(this, "color_r"              , $default(attributes.color_r,                  1)));
		this.color_g               = ko.computed(Geometry.CreateFloatObservable(this, "color_g"              , $default(attributes.color_g,                  1)));
		this.color_b               = ko.computed(Geometry.CreateFloatObservable(this, "color_b"              , $default(attributes.color_b,                  1)));
		this.color_a               = ko.computed(Geometry.CreateFloatObservable(this, "color_a"              , $default(attributes.color_a,                  1)));
		this.position_x            = ko.computed(Geometry.CreateFloatObservable(this, "position_x"           , $default(attributes.position_x,               0)));
		this.position_y            = ko.computed(Geometry.CreateFloatObservable(this, "position_y"           , $default(attributes.position_y,               0)));
		this.position_z            = ko.computed(Geometry.CreateFloatObservable(this, "position_z"           , $default(attributes.position_z,               0)));
		this.rotation              = ko.computed(Geometry.CreateFloatObservable(this, "rotation"             , $default(attributes.rotation,                 0)));
		this.rotation_axis_x       = ko.computed(Geometry.CreateFloatObservable(this, "rotation_axis_x"      , $default(attributes.rotation_axis_x,          0)));
		this.rotation_axis_y       = ko.computed(Geometry.CreateFloatObservable(this, "rotation_axis_y"      , $default(attributes.rotation_axis_y,          0)));
		this.rotation_axis_z       = ko.computed(Geometry.CreateFloatObservable(this, "rotation_axis_z"      , $default(attributes.rotation_axis_z,          0)));
	},

	SetPosition: function(x, y, z)
	{
		this.position_x(x);
		this.position_y(y);
		this.position_z(z);
	},

	OffsetPosition: function(x, y, z)
	{
		this.position_x(this.position_x() + x);
		this.position_y(this.position_y() + y);
		this.position_z(this.position_z() + z);
	},

	SetTexture: function(texture, image_path)
	{
		this.groups().each(function(group){ 
			group.texture    = texture;
			group.image_path = image_path;
		});
	},

	ResetTexture: function()
	{	
		this.groups().each(function(group){
			group.texture    = group.initial_texture;
			group.image_path = group.initial_image_path;
		});
	},

	GetShaderRequirements: function()
	{
		var has_color    = true;
		var has_lighting = $chk(this.normals());
		var has_texture  = $chk(this.texture());
		var has_colors   = $chk(this.colors());
		return {"has_color": has_color, "has_lighting": has_lighting, "has_texture": has_texture, "has_colors": has_colors};
	},

	Draw: function(scene, shader)
	{
		if (this.is_visible()) {
			var gl = scene.gl;
			scene.SaveModelviewMatrixState();
			scene.TransformMatricies([this.position_x(), this.position_y(), this.position_z()], this.rotation(), [this.rotation_axis_x(), this.rotation_axis_y(), this.rotation_axis_z()]);
			if(this.want_draw_heads_up()){
				gl.disable(gl.DEPTH_TEST);
				this.DrawGroups(gl, scene, shader);
				gl.enable(gl.DEPTH_TEST);
			}
			else if(this.groups().every(function(group){return !$chk(group.texture)}) || !this.want_translucent_pass()) {
				this.DrawGroups(gl, scene, shader);
			}
			else {
				var capabilities = shader.GetCapabilities();
				this.DrawGroups(gl, scene, scene.GetOpaqueShader(capabilities));
				gl.depthMask(false);
				this.DrawGroups(gl, scene, scene.GetTranslucentShader(capabilities));
				gl.depthMask(true);
			}
			scene.RestoreModelviewMatrixState();
		}
	},

	DrawGroups: function(gl, scene, shader)
	{
		var indices   = this.indices();
		var draw_mode = this.draw_mode();
		var groups    = this.groups();
		for(var i = 0; i < groups.length; i++) {
			var group     = groups[i];
			var offset    = group.offset;
			var num_items = group.num_items;
			var texture   = group.texture;
			this.texture(texture);
			shader.UseShader(gl);
			shader.SetShaderVariables(gl, this, scene);
			if($chk(this.indices())) {
				indices.BindBuffer(gl);
				gl.drawElements(draw_mode, num_items, indices.type, offset*2);
			}
			else {
				gl.drawArrays(draw_mode, offset, num_items);
			}
		}
	}
});

Geometry.CreateFloatObservable = function (owner, variable_name, default_value)
{
	var private_variable_name = "_" + variable_name;
	owner[private_variable_name] = ko.observable(default_value);
	return {
		read: function(){
			return owner[private_variable_name]();
		},
		write: function(value){
			var number = parseFloat(value);
			if (number == number) {
				owner[private_variable_name](number);
			}
		},
		owner: owner
	}
}

