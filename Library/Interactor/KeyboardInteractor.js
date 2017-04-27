//KeyboardInteractor.js
//The InteractionManager contains the UI interaction layer
//and sets up the ability to listen for keyboard strokes
//(both hit and hold keys).

var KeyboardInteractor = new Class
({
    initialize: function(source)
    {
        this.pressed_keys = new Object();
        this.hit_keys     = new Object();
        this.hold_keys    = new Object();
        var my            = this;

        this.OnKeyDown = function(event)
        {
            var char_key = my.SetPressedKey(event.keyCode, true);

            if(char_key in my.hit_keys) {
                my.hit_keys[char_key].call(this);
            }
        };

        this.OnKeyUp = function(event)
        {
            my.SetPressedKey(event.keyCode, false);
        };

        this.HandleKeys = function()
        {
            for(h in  my.hold_keys) {
                if(my.pressed_keys[h] == true) {
                    my.hold_keys[h].call();
                }
            }
        };

        //Add the listeners
        source.onkeydown = this.OnKeyDown;
        source.onkeyup = this.OnKeyUp;
    },

    //Sets the status of a pressed key.
    SetPressedKey: function(key_code, is_down)
    {
        var char_key = String.fromCharCode(key_code);
        this.pressed_keys[char_key] = is_down;
        return char_key;
    },

    //Registers a hit key - a key that is activated discretely.
    //(e.g. firing a laser).
    RegisterHitKeyAction: function(key, action)
    {
        this.hit_keys[key] = action;
    },

    //Registers a hold key - a key that is intended to be held down continuously.
    //(e.g. moving forward)
    RegisterHoldKeyAction: function(key, action)
    {
        this.hold_keys[key] = action;
    }
});
