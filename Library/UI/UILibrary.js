// UILibrary.js

function FadeInElement(element)
{
	element.setStyle('opacity', '0');
	element.fade("in");
}

ko.bindingHandlers.RevealOnVisible = {
	init: function(element, valueAccessor) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		value ? element.show() : element.hide();
	},

	update: function(element, valueAccessor) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		if(value) {
			element.reveal();
		}
		else {
			element.dissolve();
		}
	}
}

ko.bindingHandlers.FadeInOnVisible = {
	init: function(element, valueAccessor) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		value ? elmeent.show() : element.hide();
	},

	update: function(element, valueAccessor) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		element.show();
		if(value) {
			element.fade("in");
		}
		else {
			element.fade("out");
		}
	}
};

function CreateSlider(field, max, min)
{
	return {
		init: function(element, valueAccessor) {
			element.setStyle(field, 0);
		},

		update: function(element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if(value) {
				element.tween(field, max);
			}
			else {
				element.tween(field, min);
			}
		}
	};
}

function DisableStylesheets(group_name)
{
	var links = document.getElementsByTagName("link");
	for(var l = 0, llen = links.length; l < llen; l++) {
		var link = links[l];
		if ("alternate stylesheet" == link.getAttribute("rel")) {
			if (link.getAttribute("title").indexOf(group_name) >= 0) {
				link.disabled = true;
			}
		}
	}
}

function EnableStylesheet(title) 
{
	var links = document.getElementsByTagName("link");
	for(var l = 0, llen = links.length; l < llen; l++) {
		var link = links[l];
		if ("alternate stylesheet" == link.getAttribute("rel")) {
			if (title == link.getAttribute("title")) {
				link.disabled = false;
			}
		}
	}
}

function EnableStylesheetForGroup(title, group_name)
{
	DisableStylesheets(group_name);
	EnableStylesheet(title);
}
