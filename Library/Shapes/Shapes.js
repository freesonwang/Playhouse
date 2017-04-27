function CreateRectangularPrismData(gl, x, y, z)
{
	var vertices   = [ ];
	var indices    = [ ];
	var normals    = [ ];
	var texcoords  = [ ];
	var dimensions = [x, y, z];

	for (var d = 0, dlen = 3, v = 0; d < dlen; d++) {
		var index0  = d;
		var index1  = (d+1)%dlen;
		var index2  = (d+2)%dlen;
		var field0  = dimensions[index0];
		var field1  = dimensions[index1];
		var field2  = dimensions[index2];

		for(var i = 0, factor = 1; i < 2; i = i + 1, factor = factor * -1, field0 = field0 * factor) {
			var begin_index = v ;

			//0
			vertices[v + index0] =  field0;
			vertices[v + index1] =  field1;
			vertices[v + index2] =  field2;
			normals [v + index0] =  1 * factor;
			normals [v + index1] =  0;
			normals [v + index2] =  0;
			texcoords.push(1);
			texcoords.push(1);
			v = v + 3;

			//1
			vertices[v + index0] =  field0;
			vertices[v + index1] = -field1;
			vertices[v + index2] =  field2;
			normals [v + index0] =  1 * factor;
			normals [v + index1] =  0;
			normals [v + index2] =  0;
			texcoords.push(0);
			texcoords.push(1);
			v = v + 3;

			//2
			vertices[v + index0] =  field0;
			vertices[v + index1] =  field1;
			vertices[v + index2] = -field2;
			normals [v + index0] =  1 * factor;
			normals [v + index1] =  0;
			normals [v + index2] =  0;
			texcoords.push(1);
			texcoords.push(0);
			v = v + 3;

			//3
			vertices[v + index0] =  field0;
			vertices[v + index1] = -field1;
			vertices[v + index2] = -field2;
			normals [v + index0] =  1 * factor;
			normals [v + index1] =  0;
			normals [v + index2] =  0;
			texcoords.push(0);
			texcoords.push(0);
			v = v + 3;

			// 0 1 3
			indices.push((begin_index + 0 * 3)/3);
			indices.push((begin_index + 1 * 3)/3);
			indices.push((begin_index + 3 * 3)/3);

			// 0 3 2
			indices.push((begin_index + 0 * 3)/3);
			indices.push((begin_index + 3 * 3)/3);
			indices.push((begin_index + 2 * 3)/3);
		}
	}

	assert(indices.length == 36, "Invalid number of indices.");
	assert(vertices.length == normals.length, "Invalid number of vertices or normals.");

	var to_return = { 
		draw_mode: gl.TRIANGLES,
		vertices: vertices,
		indices: indices,
		normals: normals,
		texcoords: texcoords,
		groups: Group.CreateDefaultGroup("RectangularPrism", vertices, indices)
	};

	return to_return;
}

function CreateSphereData(gl, radius, latitude_resolution, longitude_resolution)
{
	var vertices   = [];
	var normals    = [];
	var texcoords  = [];
	var indices    = [];
	var theta_unit = Math.PI / latitude_resolution;
	var phi_unit   = 2  * Math.PI / longitude_resolution;
	for (var n = 0; n <= latitude_resolution; n++) {
		var theta     = n * theta_unit;
		var sin_theta = Math.sin(theta);
		var y         = Math.cos(theta);
		for (var m = 0; m <= longitude_resolution; m++) {
			var phi = m * phi_unit;
			var sin_phi   = Math.sin(phi);
			var cos_phi   = Math.cos(phi)
			var x = cos_phi * sin_theta;
			var z = sin_phi * sin_theta;
			normals.push(x);
			normals.push(y);
			normals.push(z);
			vertices.push(radius * x);
			vertices.push(radius * y);
			vertices.push(radius * z);
			var u = 1 - (m / longitude_resolution);
			var v = 1 - (n / latitude_resolution);
			texcoords.push(u);
			texcoords.push(v);
		}
	}
	for (var la = 0; la < latitude_resolution; la++) {
		for (var lo = 0; lo < longitude_resolution; lo++) {
			var i0 = la * (longitude_resolution + 1) + lo;
			var i1 = i0 + (longitude_resolution + 1);
			var i2 = i0 + 1;
			var i3 = i1 + 1;
			indices.push(i0);
			indices.push(i1);
			indices.push(i2);
			indices.push(i1);
			indices.push(i3);
			indices.push(i2);
		}
	}
	var to_return = {
		draw_mode: gl.TRIANGLES,
		vertices: vertices,
		normals: normals,
		texcoords: texcoords,
		indices: indices,
		groups: Group.CreateDefaultGroup("Sphere", vertices, indices)
	}
	return to_return;
}

function CreatePlaneData(gl, h_length, v_length, cols, rows, axis, axis_value)
{
	var vertices = [];
	var h_spacing  = h_length/(cols - 1);
	var v_spacing  = v_length/(rows - 1);
	var r_index    = axis.indexOf(0);
	var c_index    = axis.lastIndexOf(0);
	var a_index    = axis.indexOf(1);
	var half_v_length = v_length / 2.0;
	var half_h_length = h_length / 2.0;

	for(var r = 0; r < rows; r++) {
		for(var c = 0; c < cols; c++) {
			var count = vertices.length;
			vertices[count + r_index] = r * v_spacing - half_v_length;
			vertices[count + c_index] = c * h_spacing - half_h_length;
			vertices[count + a_index] = axis_value;
		}
	}

	var indices = [];
	for(var r = 0; r < rows - 1; r++) {
		for(var c = 0; c < cols; c++) {
			if(c % cols != cols - 1) {
				var i0 = r * cols + c;
				var i1 = i0 + 1;
				var i2 = i0 + cols;
				indices.push(i0)
				indices.push(i1)
				indices.push(i2)
				var i3 = i1;
				var i4 = i1 + cols;
				var i5 = i2;
				indices.push(i3)
				indices.push(i4)
				indices.push(i5)
			}
		}
	}

	var texcoords = [];
	var texcoord_u_spacing = 1.0 / cols;
	var texcoord_v_spacing = 1.0 / rows;
	for(var r = 0; r < rows; r++) {
		for(var c = 0; c < cols; c++) {
			texcoords.push(1 - c * texcoord_v_spacing);
			texcoords.push(1 - r * texcoord_u_spacing);
		}
	}

	var to_return = {
		draw_mode: gl.TRIANGLES,
		vertices: vertices,
		normals: CalculateSoftNormals([], vertices, indices, 3),
		texcoords: texcoords,
		indices: indices,
		groups: Group.CreateDefaultGroup("Plane", vertices, indices)
	}
	return to_return;
}

function CreateConeData(gl, radius, segments, height, axis)
{
	var vertices   = [];
	var normals    = [];
	var texcoords  = [];
	var indices    = [];
	var b_offset = axis.indexOf(1);
	var a_offset = axis.indexOf(0);
	var c_offset = axis.lastIndexOf(0);

	for(var t = 0, full_circle = 2 * Math.PI, increment = full_circle / segments; t < full_circle; t += increment) {
		var a = radius * Math.cos(t);
		var b = 0;
		var c = radius * Math.sin(t);
		var count = vertices.length;
		vertices[count + a_offset] = a;
		vertices[count + b_offset] = b;
		vertices[count + c_offset] = c;			
	}
	vertices.push(vertices[0]);
	vertices.push(vertices[1]);
	vertices.push(vertices[2]);

	var count = vertices.length;
	vertices[count + a_offset] = 0;
	vertices[count + b_offset] = height;
	vertices[count + c_offset] = 0;
	for(var v = 0, i = 0; v + 6 < vertices.length; i++, v+=3) {
		indices.push(i);
		indices.push(vertices.length / 3 - 1);
		indices.push(i + 1);
	}

	vertices.push(0);
	vertices.push(0);
	vertices.push(0);
	for(var v = 0, i = 0; v + 9 < vertices.length; i++, v+=3) {
		indices.push(i);
		indices.push(i + 1);
		indices.push(vertices.length / 3 - 1);
	}

	CalculateSoftNormals(normals, vertices, indices, 3);

	var to_return = {
		draw_mode: gl.TRIANGLES,
		vertices: vertices,
		normals: normals,
		//texcoords: texcoords,
		indices: indices,
		groups: Group.CreateDefaultGroup("Cone", vertices, indices)
	}
	return to_return;	
}

//Draws a grid given a range.
function CreateGridVertices(gl, x_range, y_range)
{
	var vertices = [ ];
	for (var i = -x_range; i <= x_range; i++) {
		vertices.push(i);
		vertices.push(0);
		vertices.push(-y_range);

		vertices.push(i);
		vertices.push(0);
		vertices.push(y_range);
	}

	for (var i = -y_range; i <= y_range; i++) {
		vertices.push(x_range);
		vertices.push(0);
		vertices.push(i);

		vertices.push(-x_range);
		vertices.push(0);
		vertices.push(i);
	}
	
	var data     = {
		draw_mode: gl.LINES,
		vertices: vertices,
		groups: Group.CreateDefaultGroup("Grid", vertices)
	};

	return data;
}

//
// OBJ Loading
//

function ParseOBJModelText(gl, path, text)
{
	// Parses the text of a loaded OBJ file for model data.
	//
	// Args:
	// gl - the gl context
	// path - the path of the OBJ file
	// text - the text of the OBJ file
	//
	// Returns:
	// data - a dictionary of key-value pairs with the names of
	// the data prefixed by 'raw' (e.g. vertices).
	//
	// Begins by spliting the lines of the file and then reading each 
	// word. Switches on the different supported tags.
	var lines                 = text.split("\n");
	var draw_mode             = null;
	var vertices          = new Array();
	var indices           = new Array();
	var texcoords         = new Array();
	var texcoords_indices = new Array();
	var normals           = new Array();
	var normals_indices   = new Array();
	var materials             = null;
	var groups                = new Array();
	var group                 = new Group("Model", 0, 0);
	for (var l = 0, llen = lines.length; l < llen; l++) {
		var line  = lines[l].clean();
		var words = line.split(" ");
		var tag   = words[0];
		switch (tag) {
		case "mtllib":
			var mtllib_filename = words[1];
			var dirname         = GetDirname(path);
			var mtllib_path     = dirname + mtllib_filename;
			LoadFile(mtllib_path, false, function(response_text){
				materials = ParseMTLLib(gl, dirname, response_text);
			});
			break;
		case "usemtl":
			var name   = words[1];
			var offset = indices.length;
			group      = new Group(name, offset, 0, materials[name]);
			groups.push(group);
			break;
		case "v":
			AddWordsToArray(vertices, words);
			break;
		case "vt":
			AddWordsToArray(texcoords, words);
			break;
		case "vn":
			AddWordsToArray(normals, words);
			break;
		case "f":
			assert(words.length == 4, "Only triangle meshes support right now: " + line);
			for (var w = 1; w < words.length; w++) {
				var word = words[w];
				var matches = word.match(/^(\d*)\/?(\d*)\/*(\d*)$/);
				assert($chk(matches), "Incorrect syntax in OBJ file.");
				var v_index = parseFloat(matches[1]) - 1;
				var t_index = parseFloat(matches[2]) - 1;
				var n_index = parseFloat(matches[3]) - 1;
				assert($chk(v_index), "Index must be specified.");
				indices.push(v_index)
				group.num_items++;
				if($chk(t_index)) {
					texcoords_indices.push(t_index);
				}
				if($chk(n_index)) {
					normals_indices.push(n_index);
				}
			}
			break;
		default:
			break;
		}
	}
	if (0 == groups.length) {
		groups.push(group);
	}
	assert(vertices.length > 0, "OBJ did not specify vertices.");
	var data = {};
	if(indices.length > 0) {
		 data["vertices"] = UnwrapIndices(vertices, indices, 3);
	}
	else {
		data["vertices"] = vertices;
	}
	if(normals.length > 0) {
		if(normals_indices.length > 0) {
			data["normals"] = UnwrapIndices(normals, normals_indices, 3);
		}
		else if(indices.length > 0){
			data["normals"] = UnwrapIndices(normals, indices, 3);
		}
		else {
			//Already flat because no indices exist.
			data["normals"] = normals;
		}
		NormalizeArray(data["normals"]);
	}
	else {
		if (indices.length > 0) {
			//Because indices exist, we can use soft normals.
			normals = CalculateSoftNormals([], vertices, indices, 3);
			data["normals"] = UnwrapIndices(normals, indices, 3);
		}
		else {
			data["normals"] = CalculateNormals([], vertices);
		}
	}
	if(texcoords.length > 0) {
		if(texcoords_indices.length > 0) {
			data["texcoords"] = UnwrapIndices(texcoords, texcoords_indices, 2);
		}
		else if(indices.length > 0){
			data["texcoords"] = UnwrapIndices(texcoords, indices, 2);
		}
		else {
			// Already flat because no indices exist.
			data["texcoords"] = texcoords;
		}
	}
	else {
		//Do nothing because there are no default texcoords.
	}
	data["draw_mode"] = gl.TRIANGLES;
	if($chk(groups) && groups.length > 0) {
		data["groups"] = groups;
  	}
 	return data;
}

function UnwrapIndices(data, indices, data_size)
{
	var flattened = [];
	for(var i = 0; i < indices.length; i++) {
		var index = indices[i] * data_size;
		for(var k = 0; k < data_size; k++) {
			flattened.push(data[index + k])
		}
	}
	return flattened;
}

function ParseMTLLib(gl, dirname, text)
{
	var lines = text.split("\n");
	var textures = null;
	var material_name = "";
	for(var l = 0; l < lines.length; l++) {
		var line  = lines[l].clean();
		var words = line.split(" ");
		var tag   = words[0];
		switch (tag)
		{
		case "newmtl":
			material_name = words[1].clean();
			break;
		case "map_Ka":
		case "map_Kd":
			textures = $chk(textures) ? textures : {};
			var texture_filename = words[words.length - 1]
			var texture_path = dirname + texture_filename;
			var texture = CreateTexture(gl, texture_path);
			assert("" != material_name, "Associated material was not found for a texture image.");
			textures[material_name] = texture;
			break;
		default:
			break;
		}
	}
	return textures;
}

function AddWordsToArray(array, words)
{
	for (var w = 1; w < words.length; w++) {
		var word  = words[w];
		var value = parseFloat(word);
		assert($chk(value), "Invalid value in file " + word);
		array.push(value);
	}
}
