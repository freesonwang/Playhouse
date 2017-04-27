var Dialog = new Class
({
	initialize: function(observable_name, is_open, bg)
	{
		if("string" == typeof(observable)) {
			observable_name = ko.observable(observable_name);
		}
		this.name    = observable_name;
		this.is_open = ko.observable($default(is_open, false));
		this.bg      = ko.observable($default(bg, null));
	}
});
