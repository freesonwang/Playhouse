var Shader = new Class
({	
	initialize: function(gl, attributes)
	{
		this.options          = {
			has_color        : $default(attributes.has_color,        false),
			has_lighting     : $default(attributes.has_lighting,     false),
			has_texture      : $default(attributes.has_texture,      false),
			has_colors       : $default(attributes.has_colors,       false),
			draw_opaque      : $default(attributes.draw_opaque,      false),
			draw_translucent : $default(attributes.draw_translucent, false),
			is_selected      : $default(attributes.is_selected,      false),
			want_id_color    : $default(attributes.want_id_color,    false)
		};
		this.vs_code          = null;
		this.fs_code          = null;
		this.program          = null;
		this.Build(gl);
	},

	Build: function(gl)
	{
		this.vs_code = new ShaderCode("");
		this.fs_code = new ShaderCode("#ifdef GL_ES\nprecision highp float;\n#endif\n");
		var vs_code  = this.vs_code;
		var fs_code  = this.fs_code;

		vs_code.AddAttributeVariable("vec3", "a_vertex_pos", Shader.GetAsObservable, "vertices");
		vs_code.AddUniformVariable("mat4", "p_mat", Shader.GetAsSceneKeyValue, "p_mat");
		vs_code.AddUniformVariable("mat4", "m_mat", Shader.GetAsSceneKeyValue, "m_mat");
		vs_code.AddCommand("vec4 mv_pos = m_mat * vec4(a_vertex_pos, 1.0);");
		vs_code.AddCommand("gl_Position = p_mat * mv_pos;");
		fs_code.AddCommand("gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");

		if (this.options.has_color) { 
			fs_code.AddUniformVariable("vec4", "single_color", Shader.GetAsObservable, "color_r", "color_g", "color_b", "color_a");
			fs_code.AddCommand("gl_FragColor = gl_FragColor * single_color;");
		}

		if (this.options.has_lighting) { 
			vs_code.AddAttributeVariable("vec3", "a_vertex_norm", Shader.GetAsObservable, "normals");
			vs_code.AddUniformVariable("mat3", "norm_mat", Shader.GetAsSceneKeyValue, "norm_mat");
			vs_code.AddUniformVariable("vec3", "dirlight_direction", Shader.GetAsSceneObservable, "dirlight_direction");
			vs_code.AddUniformVariable("vec3", "dirlight_ambient_color", Shader.GetAsSceneObservable, "dirlight_ambient_color");
			vs_code.AddUniformVariable("vec3", "dirlight_diffuse_color", Shader.GetAsSceneObservable, "dirlight_diffuse_color");
			vs_code.AddVaryingVariable("vec3", "var_light_factor");
			fs_code.AddVaryingVariable("vec3", "var_light_factor");
			vs_code.AddCommand("vec3 norm_normal = norm_mat * a_vertex_norm;")
			vs_code.AddCommand("var_light_factor = dirlight_ambient_color + dirlight_diffuse_color * max(dot(norm_normal, dirlight_direction), 0.0);");
			//
			// vs_code.AddUniformVariable("vec3", "ptlight_pos", Shader.GetAsSceneObservable, "ptlight_pos");
			// vs_code.AddUniformVariable("vec3", "ptlight_ambient_color", Shader.GetAsSceneObservable, "ptlight_ambient_color");
			// vs_code.AddCommand("vec3 ptlight_dir = normalize(ptlight_pos - mv_pos.xyz);")
			// vs_code.AddCommand("float ptlight_weight = max(dot(norm_normal, ptlight_dir), 0.0);")
			// vs_code.AddCommand("vec3 ptlight_factor = ptlight_ambient_color * ptlight_weight;")
			// vs_code.AddCommand("var_light_factor = var_light_factor + ptlight_factor;")
			//
			fs_code.AddCommand("gl_FragColor = vec4(gl_FragColor.rgb * var_light_factor, gl_FragColor.a);");
		}

		if (this.options.has_texture) {
			vs_code.AddAttributeVariable("vec2", "a_vertex_texcoord", Shader.GetAsObservable, "texcoords");
			vs_code.AddVaryingVariable("vec2", "var_texcoord");
			vs_code.AddCommand("var_texcoord = a_vertex_texcoord;");
			fs_code.AddVaryingVariable("vec2", "var_texcoord");
			fs_code.AddUniformVariable("sampler2D", "sampler", Shader.GetAsObservable, "texture");
			fs_code.AddCommand("gl_FragColor = gl_FragColor * texture2D(sampler, vec2(var_texcoord.s, var_texcoord.t));");
		}

		if (this.options.has_colors) { 
			vs_code.AddAttributeVariable("vec4", "a_vertex_col", Shader.GetAsObservable, "colors");
			vs_code.AddVaryingVariable("vec4", "var_col");
			fs_code.AddVaryingVariable("vec4", "var_col");
			vs_code.AddCommand("var_col = a_vertex_col;");
			fs_code.AddCommand("gl_FragColor = gl_FragColor * var_col;");
		}

		if(this.options.draw_opaque) {
			fs_code.AddCommand("if(gl_FragColor.a < 0.9){discard;}");
		}
		
		if(this.options.draw_translucent) {
			fs_code.AddCommand("if(gl_FragColor.a >= 0.9){discard;}");
		}

		if(this.options.is_selected) {
			fs_code.AddCommand("gl_FragColor = mix(gl_FragColor, vec4(1.0, 1.0, 1.0, 1.0), 0.1);");
		}

		if(this.options.want_id_color) {
			fs_code.AddUniformVariable("float", "id", Shader.GetAsObservable, "id");
			fs_code.AddCommand("gl_FragColor = vec4(id/255.0, 0.0, 0.0, 1.0);");
		}
		
		var vs_src            = vs_code.GetSourceCode();
		var fs_src            = fs_code.GetSourceCode();
		var vs                = CreateShader(gl, vs_src, gl.VERTEX_SHADER);
		var fs                = CreateShader(gl, fs_src, gl.FRAGMENT_SHADER);
		this.program          = CreateShaderProgram(gl, vs, fs);
		vs_code.SetVariableLocations(gl, this.program);
		fs_code.SetVariableLocations(gl, this.program);
	},

	SetShaderVariables: function(gl, geometry, scene)
	{
		geometry.scene = scene;
		this.vs_code.SetVariables(gl, geometry);
		this.fs_code.SetVariables(gl, geometry);
	},
	
	UseShader: function(gl)
	{
		gl.useProgram(this.program);
	},
	
	GetCapabilities: function()
	{
		return this.options;
	}
});

Shader.GetAsObservable = function(object, field_name)
{
	return ko.utils.unwrapObservable(object[field_name])
};

Shader.GetAsSceneKeyValue = function(object, field_name) 
{
	return object.scene[field_name];
};

Shader.GetAsSceneObservable = function(object, field_name)
{
	return ko.utils.unwrapObservable(object.scene[field_name]);
};

