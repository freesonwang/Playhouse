//
// ShaderCode
//
var ShaderCode = new Class
({
	initialize: function(header, footer)
	{
		this.attrib_vars    = { };
		this.varying_vars   = { };
		this.uni_vars       = { };
		this.header         = $chk(header) ? header : "";
		this.footer         = $chk(footer) ? footer : "";
		this.commands       = "";
	},

	AddAttributeVariable: function(type, variable_name, AccessFunction, field_name)
	{
		var variable = {
			code: "attribute " + type + " " + variable_name + ";\n",
			type: type,
			variable_name: variable_name,
			field_name: field_name,
			location: null,
			Access: AccessFunction
		};
		this.attrib_vars[variable_name] = variable;
	},

	AddUniformVariable: function(type, variable_name, AccessFunction, field_name0, field_name1, field_name2, field_name3)
	{
		var num_values =  type.indexOf("vec") >= 0 || type.indexOf("mat") >= 0 ?  parseFloat(type[type.length - 1]) : 1;
		assert($chk(num_values), "Number of values in uniform variable is invalid.");
		var is_float = true;
		var num_args = [field_name0, field_name1, field_name2, field_name3].clean().length;
		var is_vector = num_args < num_values;
		var variable = {
			code:  "uniform " + type + " " + variable_name + ";\n",
			type: type,
			variable_name: variable_name,
			num_values: num_values,
			is_float: is_float,
			is_vector: is_vector,
			field_name0: field_name0,
			field_name1: field_name1,
			field_name2: field_name2,
			field_name3: field_name3,
			location: null,
			Access: AccessFunction
		};
		this.uni_vars[variable_name] = variable;
	},

	AddVaryingVariable: function(type, variable_name)
	{
		var variable = {
			code: "varying " + type + " " + variable_name + ";\n",
			type: type,
			variable_name: variable_name
		};
		this.varying_vars[variable_name] = variable;
	},

	AddCommand: function(command)
	{
		this.commands = this.commands + command + "\n";
	},

	GetSourceCode: function()
	{
		var code = this.header;
		for(a in this.attrib_vars) {
			code = code + this.attrib_vars[a].code;
		}
		for(u in this.uni_vars) {
			code = code + this.uni_vars[u].code;
		}
		for(v in this.varying_vars) {
			code = code + this.varying_vars[v].code;
		}
		code = code + "void main() {\n" + this.commands + "}\n";
		return code;
	},
	
	SetVariableLocations: function(gl, program) {
		for(a in this.attrib_vars) {
			var variable      = this.attrib_vars[a];
			variable.location = gl.getAttribLocation(program, a); 
		}

		for(u in this.uni_vars) {
			var variable      = this.uni_vars[u];
			variable.location = gl.getUniformLocation(program, u);
		}
	},

	SetVariables: function(gl, geometry)
	{
		for(u in this.uni_vars) {
			assert($chk(this.uni_vars[u].location), "Location for variable '" + u + "' is invalid.");
			var variable   = this.uni_vars[u];
			var location   = variable.location;
			var type       = variable.type;
			var num_values = variable.num_values;
			var is_float   = variable.is_float;
			var is_vector  = variable.is_vector;
			var v0         = variable.Access(geometry, variable.field_name0);
			var v1         = $chk(variable.field_name1) ? variable.Access(geometry, variable.field_name1) : undefined;
			var v2         = $chk(variable.field_name2) ? variable.Access(geometry, variable.field_name2) : undefined;
			var v3         = $chk(variable.field_name3) ? variable.Access(geometry, variable.field_name3) : undefined;
			SetUniformVariable(gl, type, location, num_values, is_float, is_vector, v0, v1, v2, v3);
		}
		for (a in this.attrib_vars) {
			assert($chk(this.attrib_vars[a].location), "Location for variable '" + a + "' is invalid.");
			var variable = this.attrib_vars[a];
			var location = variable.location;
			gl.enableVertexAttribArray(location);
			var buffer   = variable.Access(geometry, variable.field_name);
			buffer.BindBuffer(gl);
			gl.vertexAttribPointer(location, buffer.item_size, buffer.type, false, 0, 0);
		}
	}
});

