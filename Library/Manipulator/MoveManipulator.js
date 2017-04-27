var MoveManipulator = new Class
({
	Extends: Manipulator,

	initialize: function(gl, attributes)
	{
		attributes   = attributes || {};
		var radius   = $default(attributes.radius, 0.25);
		var segments = $default(attributes.segments, 25);
		var height   = $default(attributes.height, 0.5);
		attributes.controls = [
			{
				name: "x",
				geometries: [
					MoveManipulator.CreateArrowHead(gl, radius, segments, height, 1, 0, 0),
					MoveManipulator.CreateArrowTail(gl,                           1, 0, 0),
				],
			},

			{
				name: "y",
				geometries: [
					MoveManipulator.CreateArrowHead(gl, radius, segments, height, 0, 1, 0),
					MoveManipulator.CreateArrowTail(gl,                           0, 1, 0),
				],
			},

			{
				name: "z",
				geometries: [
					MoveManipulator.CreateArrowHead(gl, radius, segments, height, 0, 0, 1),
					MoveManipulator.CreateArrowTail(gl,                           0, 0, 1)
				],
			}
		];
		this.parent(attributes);
	},

	RespondToDrag: function(event)
	{
		this.parent(event);
		this.Move(this.current_control.name);
	},

	Move: function(axis)
	{
		var self = this;
		this.attached_geometries().each(function(geometry){
			var factor  = 0.025;
			var sum = factor * (self.diff_x + self.diff_y);
			switch(axis)
			{
			case "x":
				geometry.position_x(parseFloat(geometry.position_x()) + sum);
				break;
			case "y":
				geometry.position_y(parseFloat(geometry.position_y()) - sum);
				break;
			case "z":
				geometry.position_z(parseFloat(geometry.position_z()) - sum);
				break;
			default:
				break;
			}
		});
	}
})

MoveManipulator.CreateArrowHead = function(gl, radius, segments, height, x, y, z)
{
	var cone = Object.merge(CreateConeData(gl, radius, segments, height, [x, y, z]), {
		color_r    : x,
		color_g    : y,
		color_b    : z,
		position_x : x,
		position_y : y,
		position_z : z,
		is_visible : false,
		normals: null,
		want_draw_heads_up: true
	});
	for(var i = 0; i + 2 < cone.vertices.length; i+=3) {
		cone.vertices[i    ] += x;
		cone.vertices[i + 1] += y;
		cone.vertices[i + 2] += z;
	}
	return new Geometry(gl, cone);
};

MoveManipulator.CreateArrowTail = function(gl, x, y, z)
{
	var line_vertices =  [0, 0, 0, x, y, z];
	var line = {
		draw_mode  : gl.LINES,
		vertices   : line_vertices,
		color_r    : x,
		color_g    : y,
		color_b    : z,
		is_visible : false,
		want_draw_heads_up: true
	};
	return new Geometry(gl, line);
};

