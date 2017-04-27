//Library.js
//Library functions for initializing a scene.

function CreateGLContext(canvas)
{
	//Given a canvas, we will now try to setup
	//the WebGL context. We then store the viewport
	//height and width. If we run into an exception,
	//we catch and alert the user.
	var gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
	gl.viewport_width = canvas.width;
	gl.viewport_height = canvas.height;
	return gl;
}

function CreateShader(gl, source, type)
{
	//Get the shader script from the document by the given id.
	//Then process the script into a string. Create a shader
	//based on the type of the script. Then source the shader with the
	//string. Compile the shader, check for errors and return.
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}
	else {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
}

function CreateShaderProgram(gl, vertex_shader, fragment_shader)
{
	//Create the shader program and get the two shaders -
	//the vertex shader and the fragment shader. Attach
	//the two shaders and then link the program to the
	//context. If the program could not be linked, alert
	//the user. Once the program is linked, use the shader
	//program.
	//Next, setup the variables in the vertex shader. The
	//attribute variable for a vertex position, and the uniform
	//variables for the model-view and projection matricies.
	var shader_program = gl.createProgram();
	gl.attachShader(shader_program, vertex_shader);
	gl.attachShader(shader_program, fragment_shader);
	gl.linkProgram(shader_program);

	if (gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
		//gl.useProgram(shader_program);
		return shader_program;
	}
	else {
		alert("Shader program was unable to be setup.");
		return null;
	}
}

function CreateBuffer(gl, array, target, usage)
{
	//Creates a buffer by binding the buffer to the context and then
	//filling it with data from an array.
	var buffer = gl.createBuffer();
	gl.bindBuffer(target, buffer);
	gl.bufferData(target, array, usage);
	return buffer;
}

function SetupTextureWithImage(gl, texture, image)
{
	//Bind the texture to the current working state. Then
	//set the pixel store of the texture. Fill the
	//texture with information with texImage2D. Set some
	//parameters on the texture.
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function SetTextureParameters(gl, texture, mag_filter_mode, min_filter_mode)
{
	//Set the texture parameters (the min and mag filters) to the arguments.
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag_filter_mode);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filter_mode);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function CreateTexture(gl, path, mag_filter_mode, min_filter_mode)
{
	//Create a texture from a given image path, which will fire off a setup function when
	//when it finishees loading asynchronously.
	mag_filter_mode = $chk(mag_filter_mode) ? mag_filter_mode : gl.LINEAR;
	min_filter_mode = $chk(min_filter_mode) ? min_filter_mode : gl.LINEAR_MIPMAP_NEAREST;
	var texture = gl.createTexture();
	var image = new Image();
	image.onload = function () {
		SetupTextureWithImage(gl, texture, image);
		SetTextureParameters(gl, texture, mag_filter_mode, min_filter_mode);
	};
	image.src = path;
	return texture;
}

function CreateFramebuffer(gl, width, height)
{
	var framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	
	var texture     = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.bindTexture(gl.TEXTURE_2D, null);

	var renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	return [framebuffer, texture, renderbuffer];
}

function SetupGLEnvironment(gl, clear_color_r, clear_color_g, clear_color_b, clear_color_a)
{
	clear_color_r = $chk(clear_color_r) ? clear_color_r : 0.8;
	clear_color_g = $chk(clear_color_g) ? clear_color_g : 0.8;
	clear_color_b = $chk(clear_color_b) ? clear_color_b : 0.8;
	clear_color_a = $chk(clear_color_a) ? clear_color_a : 1.0;
	//Sets up the environment with nice parameters.
	gl.clearColor(clear_color_r, clear_color_g, clear_color_b, clear_color_a);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function SetupDrawingEnvironment(gl, viewport_width, viewport_height, fov, near_clip, far_clip, p_mat, m_mat)
{
	//Specify the viewport. Clear the color buffer bit and the depth
	//buffer bit. Setup the projection matrix and the modelview matrix.
	gl.viewport(0, 0, viewport_width, viewport_height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.identity(m_mat);
	mat4.identity(p_mat);
	mat4.perspective(fov, viewport_width/viewport_height, near_clip, far_clip, p_mat);
}

function GetHashColor(n)
{
	var quotient  = Math.floor(n / 255);
	if (quotient > 2) {
		throw("Can't hash a large n: " + n);
	}
	var hash      = [0, 0, 0];
	var remainder =  n % 255;
	var q = 0
	for(q; q < quotient; q++) {
		hash[q] = (255);
	}
	hash[q] = remainder;
	for(var h = 0; h < hash.length; h++) {
		hash[h] = hash[h]/255;
	}
	hash[3] = 1.0;
	return hash;
}

function GetIDFromHashColor(color)
{
	var id = 0;
	for(var c = 0; c < 3; c++) {
		id += color[c];
	}
	return id;
}

function GetInnerCanvasXYOnClick(event) 
{
	var element = event.target;
	var offset_x = element.offsetLeft;
	var offset_y = element.offsetTop;
	var x = event.client.x - offset_x;
	var y = event.client.y - offset_y;
	y = element.clientHeight - y;
	return {"x": x, "y": y};
}

function ReadPixel(gl, x, y)
{
	var pixel_rgba = new Uint8Array(4);
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel_rgba);
	return pixel_rgba;
}

function TransformModelviewMatrix(gl, translation, radians, rotation_axis, m_mat)
{
	//Transform the modelview matrix accordingly, given the translation and rotation.
	mat4.translate(m_mat, translation);
	mat4.rotate(m_mat, radians, rotation_axis);
	return m_mat;
}

function TransformNormalMatrix(gl, m_mat)
{
	var normal_matrix = mat3.create();
	mat4.toInverseMat3(m_mat, normal_matrix);
	mat3.transpose(normal_matrix);
	return normal_matrix;
}

function PushMatrix(m_mat, m_mat_stack)
{
	//Push the matrix onto the stack.
	var copy = mat4.create();
	mat4.set(m_mat, copy);
	m_mat_stack.push(copy);
}

function PopMatrix(m_mat_stack)
{
	//Pop the matrix from the stack.
	assert(m_mat_stack.length > 0, "Cannot pop matrix. Modelview matrix stack is empty.");
	return m_mat_stack.pop();
}

function SetUniformVariable (gl, type, location, num_values, is_float, is_vector, v0, v1, v2, v3)
{
	assert(num_values >= 1 && num_values <= 4, "Number of values in uniform variable invalid.");
	assert($chk(location), "Uniform variable location is invalid.");

	switch(num_values)
	{
	case 1:
		if ("sampler2D" == type) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, v0);
			gl.uniform1i(location, 0);
		}
		else {
			if (is_vector) {
				var _ =  is_float ? gl.uniform1fv(location, v0) : gl.uniform1iv(location, v0);
			}
			else {
				var _ =  is_float ? gl.uniform1f(location, v0) : gl.uniform1i(location, v0);
			}
		}
		break;
	case 2:
		if ("vec2" == type) {
			if (is_vector) {
				var _ =  is_float ? gl.uniform2fv(location, v0) : gl.uniform2iv(location, v0);
			}
			else {
				var _ =  is_float ? gl.uniform2f(location, v0, v1) : gl.uniform2i(location, v0, v1);
			}
		}
		else {
			assert ("mat2" == type, "Invalid uniform variable type.");
			gl.uniformMatrix2fv (location, false, v0);
		}
		break;
	case 3:
		if ("vec3" == type) {
			if (is_vector) {
				var _ =  is_float ? gl.uniform3fv(location, v0) : gl.uniform3iv(location, v0);
			}
			else {
				var _ =  is_float ? gl.uniform3f(location, v0, v1, v2) : gl.uniform3i(location, v0, v1, v2);
			}
		}
		else {
			assert ("mat3" == type, "Invalid uniform variable type.");
			gl.uniformMatrix3fv (location, false, v0);
		}
		break;
	case 4:
		if ("vec4" == type) {
			if (is_vector) {
				var _ =  is_float ? gl.uniform4fv(location, v0) : gl.uniform4iv(location, v0);
			}
			else {
				var _ =  is_float ? gl.uniform4f(location, v0, v1, v2, v3) : gl.uniform4i(location, v0, v1, v2, v3);
			}
		}
		else {
			assert ("mat4" == type, "Invalid uniform variable type.");
			gl.uniformMatrix4fv (location, false, v0);
		}
		break;
	default:
		throw("Number of values in uniform variable invalid.");
	}
}

//
// Normals functions
//

function CalculateNormals(normals, vertices, indices, face_size)
{
	if($chk(indices)) {
		CalculateSoftNormals(normals, vertices, indices, face_size);
	}
	else {
		CalculateHardNormals(normals, vertices);
	}
}

function CalculateHardNormals(normals, vertices)
{
	for (var v = 0, n = 0; v + 8 < vertices.length; v += 9, n += 9) {
		var v0x = vertices[v    ];
		var v0y = vertices[v + 1];
		var v0z = vertices[v + 2];
		var v1x = vertices[v + 3];
		var v1y = vertices[v + 4];
		var v1z = vertices[v + 5];
		var v2x = vertices[v + 6];
		var v2y = vertices[v + 7];
		var v2z = vertices[v + 8];
		var ux = v1x - v0x;
		var uy = v1y - v0y;
		var uz = v1z - v0z;
		var vx = v2x - v1x;
		var vy = v2y - v1y;
		var vz = v2z - v1z;
		var nx = uy * vz - uz * vy;
		var ny = uz * vx - ux * vz;
		var nz = ux * vy - uy * vx;
		var len = Math.sqrt(nx * nx + ny * ny + nz * nz);
		nx /= len;
		ny /= len;
		nz /= len;
		normals[n    ] = nx;
		normals[n + 1] = ny;
		normals[n + 2] = nz;
		normals[n + 3] = nx;
		normals[n + 4] = ny;
		normals[n + 5] = nz;
		normals[n + 6] = nx;
		normals[n + 7] = ny;
		normals[n + 8] = nz;
	}
	return normals;
}

function CalculateSoftNormals(normals, vertices, indices, face_size)
{
	assert(3 == face_size, "Can only handle triangle meshes right now.");
	for (var i = 0, n = 0; i + 2 < indices.length; i += 3, n += 9) {
		var i0 = indices[i    ] * 3;
		var i1 = indices[i + 1] * 3;
		var i2 = indices[i + 2] * 3;
		var v0x = vertices[i0    ];
		var v0y = vertices[i0 + 1];
		var v0z = vertices[i0 + 2];
		var v1x = vertices[i1    ];
		var v1y = vertices[i1 + 1];
		var v1z = vertices[i1 + 2];
		var v2x = vertices[i2    ];
		var v2y = vertices[i2 + 1];
		var v2z = vertices[i2 + 2];
		var ux = v1x - v0x;
		var uy = v1y - v0y;
		var uz = v1z - v0z;
		var vx = v2x - v1x;
		var vy = v2y - v1y;
		var vz = v2z - v1z;
		var nx = uy * vz - uz * vy;
		var ny = uz * vx - ux * vz;
		var nz = ux * vy - uy * vx;
		normals[i0    ] = $chk(normals[i0    ]) ? normals[i0    ] + nx : nx;
		normals[i0 + 1] = $chk(normals[i0 + 1]) ? normals[i0 + 1] + ny : ny;
		normals[i0 + 2] = $chk(normals[i0 + 2]) ? normals[i0 + 2] + nz : nz;
		normals[i1    ] = $chk(normals[i1    ]) ? normals[i1    ] + nx : nx;
		normals[i1 + 1] = $chk(normals[i1 + 1]) ? normals[i1 + 1] + ny : ny;
		normals[i1 + 2] = $chk(normals[i1 + 2]) ? normals[i1 + 2] + nz : nz;
		normals[i2    ] = $chk(normals[i2    ]) ? normals[i2    ] + nx : nx;
		normals[i2 + 1] = $chk(normals[i2 + 1]) ? normals[i2 + 1] + ny : ny;
		normals[i2 + 2] = $chk(normals[i2 + 2]) ? normals[i2 + 2] + nz : nz;
	}
	for(var n = 0;  n + 2 < normals.length; n += 3) {
		var nx = normals[n    ];
		var ny = normals[n + 1];
		var nz = normals[n + 2];
		var len = Math.sqrt(nx * nx + ny * ny + nz * nz);
		normals[n    ] /= len;
		normals[n + 1] /= len;
		normals[n + 2] /= len;
	}
	return normals;
}

//
// Utilities
//
var $chk = function(obj) {
    return !!(obj || obj === 0);
};

var $defined = function(obj) {
    return !(obj === undefined)
};

var $default = function(obj, def, msg) {
	if(!(obj === undefined)) {
		return obj;
	}
	else if (def === undefined) {
		throw (msg) ? msg : "Required value was unsdefined."
	}
	else {
		return def;
	}
}

function LoadFile(path, want_async, OnReadyFunction)
{
	var request = new Request({
		url: path,
		method: "get",
		async: want_async,
		onSuccess: OnReadyFunction,
		onFailure: function(xhr) {
			if($chk(xhr.responseText)) {
				OnReadyFunction(xhr.responseText);
			}
		}
	});
	request.send();
}

function GetBasename(path)
{
	var basename = path.match(/\w*\.\w*$/);
	return basename;
}

function GetDirname(path)
{
	var basename = GetBasename(path);
	var dirname = path.replace(basename, "")
	return dirname;
}

//
// Vector Helper Functions
//
//Adjust the direction to the mathematically correct one.
//(i,e, normalize it and then flip it).
function NormalizeArray(array)
{
	for (var i = 0, ilen = array.length; ilen < array.length; i++) {
		var x = array[i    ];
		var y = array[i + 1];
		var z = array[i + 2];
		var length = Math.sqrt(x*x + y*y + z*z);
		array[i    ] = x / length;
		array[i + 1] = y / length;
		array[i + 2] = z / length;
	}
	return array;
}

function AdjustDirection(direction)
{
	NormalizeArray(direction);
	direction[0] *= -1;
	direction[1] *= -1;
	direction[2] *= -1;
	return direction;
}

function GetVectorLength(x, y, z)
{
	var length = Math.sqrt(x*x + y*y + z*z);
	return length;
}

function ToArray(object_array)
{
	var array = [];
	for(var oa = 0, oalen = object_array.length; oa < oalen; oa++) {
		array[oa] = object_array[oa];
	}
	return array;
}

function IsNumber(value)
{
	var v = parseFloat(value);
	return $chk(v);
}

function IsNumberArray(array)
{
	for(var i = 0; i < array.length; i++) {
		var value = parseFloat(array[i]);
		if (!IsNumber(value)) {
			return false;
		}
	}
	return true;
}

function ToNumberArray(array)
{
	for(var i = 0; i < array.length; i++) {
		array[i] = parseFloat(array[i]);
	}
}

function Add (arr0, arr1)
{
	var arr = [ ];
	for(var i = 0, ilen = arr0.length; i < ilen; i++) {
		arr = arr0[i] + arr1[i]; 
	}
	return arr;
}

function Multiply (arr0, arr1)
{
	var arr = [ ];
	for(var i = 0, ilen = arr0.length; i < ilen; i++) {
		arr = arr0[i] * arr1[i]; 
	}
	return arr;
}

function NearestSuperiorPowerOf2(n)
{
	var nearest = Math.pow(2, Math.ceil(Math.log(n) / Math.log(2)));
	return nearest;
}
