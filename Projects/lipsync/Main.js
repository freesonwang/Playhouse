//Application.js
var Model = new Class
({
	initialize: function(display_id)
	{
		var imgs_config = {
			rest      : "../../Resources/Graphics/Phonemes/phoneme_rest.jpg",
			ai        : "../../Resources/Graphics/Phonemes/phoneme_a_i.jpg",
			wq        : "../../Resources/Graphics/Phonemes/phoneme_w_q.jpg",
			mbp       : "../../Resources/Graphics/Phonemes/phoneme_m_b_p.jpg",
			l         : "../../Resources/Graphics/Phonemes/phoneme_l.jpg",
			th        : "../../Resources/Graphics/Phonemes/phoneme_th.jpg",
			fv        : "../../Resources/Graphics/Phonemes/phoneme_f_v.jpg",
			cdgknrsyz : "../../Resources/Graphics/Phonemes/phoneme_c_d_g_j_k_n_r_s_y_z.jpg",
			cdgknrsyz : "../../Resources/Graphics/Phonemes/phoneme_c_d_g_k_n_r_s_y_z.jpg",
			u         : "../../Resources/Graphics/Phonemes/phoneme_u.jpg",
			o         : "../../Resources/Graphics/Phonemes/phoneme_o.jpg",
			e         : "../../Resources/Graphics/Phonemes/phoneme_e.jpg",
		};
		var default_img = imgs_config.rest;
		this.display_id  = display_id;
		this.default_img = default_img;
		this.imgs_config = imgs_config;
		this.current_img = ko.observable(default_img);
		this.pressed_keys = {};
	},

	respondToPhoneme: function(event)
	{
		var key = event.key;
		key = key.toLowerCase();
		this.pressed_keys[key] = true;
		switch(key) {
			case "space":
				this.current_img(this.imgs_config["rest"]);
				break;
			case "a": case "i":
				this.current_img(this.imgs_config["ai"]); break;
			case "w": case "q":
				this.current_img(this.imgs_config["wq"]); break;
			case "m": case "b": case "p":
				this.current_img(this.imgs_config["mbp"]); break;
			case "l":
				this.current_img(this.imgs_config["l"]); break;
			case "t": case "h":
				this.current_img(this.imgs_config["th"]); break;
			case "f": case "v":
				this.current_img(this.imgs_config["fv"]); break;
			case "u":
				this.current_img(this.imgs_config["u"]); break;
			case "o":
				this.current_img(this.imgs_config["o"]); break;
			case "e":
				this.current_img(this.imgs_config["e"]); break;
			default:
				delete this.pressed_keys[key];
			//case cdgknrsyz : 
				//break;
			//case cdgknrsyz :
				//break;
		}
	},

	setDefault: function(event)
	{	
		var key = event.key;
		key = key.toLowerCase();
		delete this.pressed_keys[key];
		console.log(this.pressed_keys);
		if(Object.getLength(this.pressed_keys) == 0) {
			this.current_img(this.default_img);
		}
	}	
})

function Main()
{
	var display_id = "lips_display";
	var app = new Model(display_id);
	ko.applyBindings(app);
	document.addEvent("keyup", app.setDefault.bind(app));
	document.addEvent("keydown", app.respondToPhoneme.bind(app));
}



