function Main()
{
	Class.refactor(Drag, {
		start: function(event) {
			this.fireEvent('start', [this.element, event]);
			this.previous(event);
		},
		attach: function() {
			this.previous();
			this.fireEvent('attach');
		},
		detach: function() {
			this.fireEvent('detach');
			this.previous();
		}
	});

	EnableStylesheetForGroup("BlackBase", "Base");
	EnableStylesheetForGroup("BlueAccent", "Accent");
	ko.bindingHandlers.SlideInHorizontalOnVisible = CreateSlider("max-width", 800, 75);
	var canvas_id = "ApplicationCanvas";
	var canvas    = $(canvas_id);
	var camera    = new Camera(this.canvas, {
		position                : [3.14, 0, 0],
		rot_x                   : 3.14/4,
		rot_y                   : -3.14/4,
		zoom                    : 20,
		can_spin                : true,
		can_roll                : true,
		can_pan                 : true,
		can_zoom                : true,
		zoom_factor             : 0.200,
		pan_factor              : 0.050,
		track_factor            : 0.025,
	});

	var app = new Application({
		canvas_id               : canvas_id,
		canvas                  : canvas,
		camera                  : camera,
		dirlight_ambient_color  : [0.5, 0.5, 0.5],
		dirlight_diffuse_color  : [0.5, 0.5, 0.5],
		dirlight_direction      : AdjustDirection([-0.25, -0.25, -1.0]),
		animators               : [
			new InterpolatedAnimator({
				duration: 1.0,
				interpolates: [{ key: "position_y", initial_offset: 10, target_offset:  0 }, { key: "color_a", initial: 0.0, target: 1.0 }],
				constants: {"want_translucent_pass" : false},
				properties_to_restore: ["want_translucent_pass", "position_y", "color_a"],
				easing: Easing.EaseOutBounce,
				callback: function(geometry) {
					
				}
			}),
			new InterpolatedAnimator({
				duration: 1.0,
				interpolates: [{ key: "position_y", initial_offset: 0, target_offset: -1 }, { key: "color_a", initial_offset: 0.0, target: 0.0 }], 
				constants: {"want_translucent_pass" : false},
				easing: Easing.LinearTween,
				callback: function(geometry) {
					app.DeleteGeometry(geometry);
				}
			})
		],
		page :  { name: "Home" },
		pages: [
			{ name: "Stage", add_a_model_dialog : new Dialog("Add a model..."), add_a_ptlight_dialog: new Dialog("Add a point light...")}, 
			{ name: "Preferences"  }, 
			{ name: "Help"         }, 
			{ name: "About"        },
		],
		theme_bases : [
			{ name: "WhiteBase", color: "white" },
			{ name: "BlackBase", color: "black" }
		],
		theme_accents : [
			{ name: "GreenAccent",   color: "yellowgreen" },
			{ name: "BlueAccent",    color: "deepskyblue" },
			{ name: "PinkAccent",    color: "hotpink" },
			{ name: "OrangeAccent",  color: "darkorange" }
		],
		texture_list            : TextureList,
		model_catalog           : ModelCatalog,
		is_sidepanel_open       : true,
		is_conductor_open       : false,
	});
	app.AddModel(Object.merge(CreateGridVertices(app.gl, 10, 10), {
		name           : "Grid",
		dialog_bg      : "../../Resources/Models/Primitives/Grid/GridBG.png",
		dialog_is_open : true,
		can_show_data  : false,
		can_delete     : false,
		is_selectable  : false
	}));
	app.move_manipulator = new MoveManipulator(app.gl);
	app.move_manipulator.controls().each(function(control){
		control.geometries.each(function(geometry){
			app.AddGeometry(geometry);
		});
	});
	app.mode_switchers([
		new ModeSwitcher({
			name: "Camera",
			default_mode: "Standard camera",
			modes: [
				{
					name : "Locked",
					description: "Camera is locked. You will not be able to be manipulate the view of the scene.",
					responder: null,
				},
				{
					name : "Standard camera",
					description: "Drag + CMMD/CTRL to track. SHIFT to pan. ALT to zoom.",
					responder: new Drag(canvas_id, {
						style: false,
						onDrag: function(element, event) {
							if(event.shift) {
								camera.Pan(event);
							}
							else if (event.alt) {
								camera.Zoom(event);
							}
							else if (event.meta || event.control) {
								camera.Track(event);
							}
						},
						onComplete: function(element, event) {
							camera.ClearXYDifference();
						}
					})
				}
			]
		}),
		new ModeSwitcher({
			name: "Selection",
			default_mode: "One at a time",
			modes: [
				{
					name: "Locked",
					description: "Selection is locked. You will not be able to manipulate the selection of the scene with the mouse.",
					responder: null
				},
				{
					name: "One at a time",
					description: "Select one object at a time.",
					responder: new Drag(canvas_id, {
						style: false,
						snap: 0,
						onStart: function(element, event) {
							if(!event.shift && !event.alt && !event.meta && !event.control) {
								var coord = GetInnerCanvasXYOnClick(event);
								var id = app.GetPickedGeometryID(coord.x, coord.y);
								var model = app.GetModelFromID(id);
								if(model) {
									var model_is_selected = model.is_selected();
									app.DeselectAllModels();
									model.is_selected(!model_is_selected);
								}
								else if(!id) {
									app.DeselectAllModels();
								}
							}
						}
					})
				}
			]
		}),
		new ModeSwitcher({
			name: "Manipulation",
			default_mode: "Move",
			modes: [
				{
					name: "Locked",
					description: "Manipulation is locked. You will not be able to manipulate objects in the scene.",
					responder: null
				},
				{
					name: "Move",
					description: "Move objects on the stage.",
					responder: new Drag(canvas_id, {
						style: false,
						snap: 0,
						onStart: function(element, event) {
							if(!event.shift && !event.alt && !event.meta && !event.control) {
								var coord = GetInnerCanvasXYOnClick(event);
								var id = app.GetPickedGeometryID(coord.x, coord.y);
								var geometry = app.GetGeometryFromID(id);
								if(geometry && app.move_manipulator.HasClickedControlGeometry(geometry)){
									app.move_manipulator.SetCurrentControl(geometry);
								}
							}
						},
						onDrag: function(element, event) {
							if(!event.shift && !event.alt && !event.meta && !event.control) {
								app.move_manipulator.RespondToDrag(event);
							}
						},
						onComplete: function(element, event) {
							app.move_manipulator.ClearXYDifference();
							app.move_manipulator.ClearCurrentControl();
						},
						onAttach: function() {
							function UpdateAttachedGeometriesAndToggleVisibility(new_value) {
								app.move_manipulator.attached_geometries(new_value);
								app.move_manipulator.ToggleControlsVisibility(app.move_manipulator.attached_geometries().length > 0);
							};
							app.move_manipulator._selected_models_subscription = app.selected_models.subscribe(UpdateAttachedGeometriesAndToggleVisibility);
							UpdateAttachedGeometriesAndToggleVisibility(app.selected_models());

							function UpdatePositionForControls(new_value) {
								app.move_manipulator.SetPositionForControls.apply(app.move_manipulator, new_value);
							};
							app.move_manipulator._average_position_subscription = app.average_position.subscribe(UpdatePositionForControls);
							UpdatePositionForControls(app.average_position());
						},
						onDetach: function() {
							app.move_manipulator.HideControls();
							app.move_manipulator._selected_models_subscription.dispose();
							app.move_manipulator._average_position_subscription.dispose();
						}
					})
				}
			]
		})
	]);
	ko.applyBindings(app);
	app.Run();
}

/*
To Do
=====

## Must Have ##
- Texture preview image
- Geometry scene needs to expose vectors as separate vars to show more options
- Experimental page
	- Render to texture
- Selection
    - Selecting an item should make the SidePanel scroll to that item
 
## New Features ##
- Keyboard shortcuts
- Top console
- Reset camera to home position
- Add spin animator to object
- Rotation as XYZ, get rid of rotation axis
- Beautiful UI:
	- color controls
	- opacity controls
	- visibility toggle

## Big Features ## 
- Outline shader for selected items
- Focus camera on object
- Screenshot
*/
