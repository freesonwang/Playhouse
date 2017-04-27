var ClothAnimator = new Class
({
	Extends: Animator,

	initialize: function(attributes)
	{
		this.parent(attributes);
	},

	AttachGeometry: function(geometry)
	{
		this.parent(geometry);
		geometry.forces            = new Float32Array(geometry.vertices().array.length);
		geometry.velocities        = new Float32Array(geometry.vertices().array.length);
		geometry.previous_position = new Float32Array(geometry.vertices().array);
		geometry.original_position = new Float32Array(geometry.vertices().array);
		//
		// TODO: Move! Hacked as of now
		geometry.cols              = 4;
		geometry.rows              = 100;
		geometry.fixed_indices     = [0, geometry.cols - 1];
		geometry.t                 = 0.3;
		geometry.mass              = 1.2;
		geometry.its               = 15;
		geometry.damping           = 0.000;
		//
		// 
	},

	DetachGeometry: function(geometry) 
	{
		this.parent(geometry);
		delete geometry.forces;
		delete geometry.velocities;
		delete geometry.previous_position;
		delete geometry.original_position;
		delete geometry.rows;
		delete geometry.cols;
		delete geometry.fixed_indices;
		delete geometry.t;
		delete geometry.mass;  
		delete geometry.its; 
		delete geometry.damping;
	},

	Animate: function(gl)
	{
		for(var g = 0; g < this.geometries().length; g++) {
			var geometry = this.geometries()[g];
			this.ModifyGeometry(gl, geometry);
		}
	},

	ModifyGeometry: function(gl, geometry)
	{
		var t        = geometry.t;
		var mass     = geometry.mass;
		var its      = geometry.its;
		var damping  = geometry.damping;
		var vertices = geometry.vertices().array;
		var rows     = geometry.rows;
		var cols     = geometry.cols;

		assert(geometry.forces.length == vertices.length, "Forces array should be same length as vertices array.");
		for(var i = 0; i + 2 < vertices.length; i = i + 3) {
			var index = Math.floor(i / 3);
			if(!geometry.fixed_indices.contains(index)) {
				geometry.forces[i    ] =  0.0;
				geometry.forces[i + 1] = -0.1;
				geometry.forces[i + 2] =  0.0;
			}
		}

		for(var r = 0; r < rows; r++) {
			for(var c = 0; c < cols; c++){
				var index = r * cols + c;
				var one_north     = index - cols;
				var one_northeast = index - cols + 1;
				var one_east      = index + 1;
				var one_southeast = index + 1 + cols;
				var one_south     = index + cols;
				var one_southwest = index + cols - 1;
				var one_west      = index - 1;
				var one_northwest = index - 1 - cols;
				var two_north     = index - (2 * cols);
				var two_northeast = index - (2 * cols) + 2;
				var two_east      = index + 2;
				var two_southeast = index + 2 + (2 * cols);
				var two_south     = index + (2 * cols);
				var two_southwest = index + (2 * cols) - 2;
				var two_west      = index - 2;
				var two_northwest = index - 2 - (2 * cols);
				var is_on_north_edge       = r == 0;
				var is_on_east_edge        = c == cols - 1;
				var is_on_south_edge       = r == rows - 1;
				var is_on_west_edge        = c == 0;
				var is_on_north_inner_edge = r == 1;
				var is_on_east_inner_edge  = c == cols - 2;
				var is_on_south_inner_edge = r == rows - 2;
				var is_on_west_inner_edge  = c == 1;
				// var s = "[" + index + "]: ";
				// s = !is_on_north_edge?                     s + one_north     + "," : s;
				// s = !is_on_north_edge && !is_on_east_edge? s + one_northeast + "," : s;
				// s = !is_on_east_edge?                      s + one_east      + "," : s;
				// s = !is_on_south_edge && !is_on_east_edge? s + one_southeast + "," : s;
				// s = !is_on_south_edge?                     s + one_south     + "," : s;
				// s = !is_on_south_edge && !is_on_west_edge? s + one_southwest + "," : s;
				// s = !is_on_west_edge?                      s + one_west      + "," : s;
				// s = !is_on_north_edge && !is_on_west_edge? s + one_northwest + "," : s;
				// s = s + "\t\n";
				// s = !is_on_north_edge && !is_on_north_inner_edge?                                               s + two_north     + "," : s;
				// s = !is_on_north_edge && !is_on_north_inner_edge && !is_on_east_edge && !is_on_east_inner_edge? s + two_northeast + "," : s;
				// s = !is_on_east_edge  && !is_on_east_inner_edge?                                                s + two_east      + "," : s;
				// s = !is_on_south_edge && !is_on_south_inner_edge && !is_on_east_edge && !is_on_east_inner_edge? s + two_southeast + "," : s;
				// s = !is_on_south_edge && !is_on_south_inner_edge?                                               s + two_south     + "," : s;
				// s = !is_on_south_edge && !is_on_south_inner_edge && !is_on_west_edge && !is_on_west_inner_edge? s + two_southwest + "," : s;
				// s = !is_on_west_edge  && !is_on_west_inner_edge?                                                s + two_west      + "," : s;
				// s = !is_on_north_edge && !is_on_north_inner_edge && !is_on_west_edge && !is_on_west_inner_edge? s + two_northwest + "," : s;
				// alert(s);
				!is_on_north_edge?                                                                          this.ConstrainVertices(geometry, vertices, index, one_north    , its) : null;
				!is_on_north_edge && !is_on_east_edge?                                                      this.ConstrainVertices(geometry, vertices, index, one_northeast, its) : null;
				!is_on_east_edge?                                                                           this.ConstrainVertices(geometry, vertices, index, one_east     , its) : null;
				!is_on_south_edge && !is_on_east_edge?                                                      this.ConstrainVertices(geometry, vertices, index, one_southeast, its) : null;
				!is_on_south_edge?                                                                          this.ConstrainVertices(geometry, vertices, index, one_south    , its) : null;
				!is_on_south_edge && !is_on_west_edge?                                                      this.ConstrainVertices(geometry, vertices, index, one_southwest, its) : null;
				!is_on_west_edge?                                                                           this.ConstrainVertices(geometry, vertices, index, one_west     , its) : null;
				!is_on_north_edge && !is_on_west_edge?                                                      this.ConstrainVertices(geometry, vertices, index, one_northwest, its) : null;
				!is_on_north_edge && !is_on_north_inner_edge?                                               this.ConstrainVertices(geometry, vertices, index, two_north    , its) : null;
				!is_on_north_edge && !is_on_north_inner_edge && !is_on_east_edge && !is_on_east_inner_edge? this.ConstrainVertices(geometry, vertices, index, two_northeast, its) : null;
				!is_on_east_edge  && !is_on_east_inner_edge?                                                this.ConstrainVertices(geometry, vertices, index, two_east     , its) : null;
				!is_on_south_edge && !is_on_south_inner_edge && !is_on_east_edge && !is_on_east_inner_edge? this.ConstrainVertices(geometry, vertices, index, two_southeast, its) : null;
				!is_on_south_edge && !is_on_south_inner_edge?                                               this.ConstrainVertices(geometry, vertices, index, two_south    , its) : null;
				!is_on_south_edge && !is_on_south_inner_edge && !is_on_west_edge && !is_on_west_inner_edge? this.ConstrainVertices(geometry, vertices, index, two_southwest, its) : null;
				!is_on_west_edge  && !is_on_west_inner_edge?                                                this.ConstrainVertices(geometry, vertices, index, two_west     , its) : null;
				!is_on_north_edge && !is_on_north_inner_edge && !is_on_west_edge && !is_on_west_inner_edge? this.ConstrainVertices(geometry, vertices, index, two_northwest, its) : null;
			}
		}

		assert(vertices.length == geometry.velocities.length, "Velocities should be the same length as vertices.");
		for(var i = 0; i < vertices.length; i++) {
			var index = Math.floor(i / 3);
			if(!geometry.fixed_indices.contains(index)) {
				var previous_position         = vertices[i];
				vertices[i]                   = vertices[i] + (vertices[i] - geometry.previous_position[i]) * (1.0 - damping) + t * (geometry.forces[i]/mass);
				geometry.previous_position[i] = previous_position;
				geometry.forces[i] = 0.0;
			}
		}

		//adjust collision
		for(var i = 0; i + 2 < vertices.length; i+=3) {
			if(vertices[i+1] <= -7.5) {
				vertices[i+1] = -7.5;
			}
		}


		geometry.vertices().SetBufferData(gl, vertices);
		var normals = geometry.normals().array;
		CalculateSoftNormals(normals, vertices, geometry.indices().array, 3);
		geometry.normals().SetBufferData(gl, normals);
	},

	ConstrainVertices: function(geometry, vertices, i0, i1, iterations)
	{
		i0 = i0 * 3;
		i1 = i1 * 3;
		if (!(i0 >= 0 && i0+2 <= vertices.length && i1 >= 0 && i1+2 <= vertices.length)) {
			console.log("Indices not within range of length: " + vertices.length + " i0: [" + i0 + "], i1: [" + i1 + "]");
			throw("Indices not within range of length");
		}

		for(var rr = 0; rr < iterations; rr++) {					
			var v0x = vertices[i0  ], 
			    v0y = vertices[i0+1], 
			    v0z = vertices[i0+2];
			var v1x = vertices[i1  ], 
			    v1y = vertices[i1+1], 
			    v1z = vertices[i1+2];
			var dix = v1x - v0x, 
			    diy = v1y - v0y, 
			    diz = v1z - v0z;
			var dist = GetVectorLength(dix, diy, diz);
			var rlx = geometry.original_position[i1    ] - geometry.original_position[i0    ], 
			    rly = geometry.original_position[i1 + 1] - geometry.original_position[i0 + 1], 
			    rlz = geometry.original_position[i1 + 2] - geometry.original_position[i0 + 2];
			var rl  = GetVectorLength(rlx, rly, rlz);
			var factor = (1.0 - (rl/dist))/2.0;
			var cx = factor * dix, cy = factor * diy, cz = factor * diz;

			var index = i0/3;
			if(!geometry.fixed_indices.contains(index)) {
			vertices[i0  ] += cx;
			vertices[i0+1] += cy;
			vertices[i0+2] += cz;
			}
			index = i1/3;
			if(!geometry.fixed_indices.contains(index)) {
			vertices[i1  ] -= cx;
			vertices[i1+1] -= cy;
			vertices[i1+2] -= cz;
			}
		}
	}
});