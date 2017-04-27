var Group = new Class
({
	initialize: function(name, offset, num_items, texture, image_path)
	{
		this.name               = name;
		this.offset             = offset;
		this.num_items          = num_items;
		this.texture            = $default(texture, null);
		this.initial_texture    = texture;
		this.image_path         = $default(image_path, null);
		this.initial_image_path = image_path;
	}
});

Group.CreateDefaultGroup = function(name, raw_vertices, raw_indices)
{
	return $chk(raw_indices) ? [new Group(name, 0, raw_indices.length)] : [new Group(name, 0, raw_vertices.length / 3)];
}