// Animator.js

var Animator = new Class
({
    Implements: Events,

    initialize: function(attributes)
    {
        this.geometries            = ko.observableArray();
        this.properties_to_restore = ko.observableArray($default(attributes.properties_to_restore, []));
    },

    AttachGeometry: function(geometry)
    {
        this.geometries.push(geometry);
        geometry._Animator_restore = {};
        for(var i = 0; i < this.properties_to_restore().length; i++) {
            var property = this.properties_to_restore()[i];
            var value    = geometry[property]();
            geometry._Animator_restore[property] = value;
        }
        return geometry;
    },

	DetachGeometry: function(geometry)
	{
		this.geometries.remove(geometry);
        for(var property in geometry._Animator_restore) {
            geometry[property](geometry._Animator_restore[property]);
        }
		return geometry;
	}
});

