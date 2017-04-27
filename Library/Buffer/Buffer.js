// Buffer.js
// The Buffer class models an arbitrary buffer. It conveniently keeps
// a set of metadata about the buffer for future use.

var Buffer = new Class
({
    initialize: function(gl, array, item_size, num_items, target, usage, type)
    {
        this.array          = array;
        this.item_size      = item_size;
        this.num_items      = num_items;
        this.target         = target;
        this.usage          = usage;
        this.type           = type;
        this.buffer         = CreateBuffer(gl, array, target, usage);
    },

    BindBuffer: function(gl)
    {
        gl.bindBuffer(this.target, this.buffer);
    },

    SetBufferData: function(gl, array)
    {
        this.array = array;
        this.BindBuffer(gl);
        gl.bufferData(this.target, this.array, this.usage);
    }
});

Buffer.ToBuffer = function(gl, kind, array, usage)
{
    assert($chk(array), "Invalid array for buffer creation.");
    assert(array instanceof Array, "ToBuffer converts arrays to WebGL buffers.")
    switch(kind)
    {
    case "vertices":
        var type_array = new Float32Array(array);
        var item_size  = 3;
        var num_items  = array.length / item_size;
        var target     = gl.ARRAY_BUFFER;
        var usage      = $default(usage, gl.STATIC_DRAW);
        var type       = gl.FLOAT;
        return new Buffer(gl, type_array, item_size, num_items, target, usage, type);
        break;
    case "indices":
        var type_array = new Uint16Array(array);
        var item_size  = 1;
        var num_items  = array.length / item_size;
        var target     = gl.ELEMENT_ARRAY_BUFFER;
        var usage      = $default(usage, gl.STATIC_DRAW);
        var type       = gl.UNSIGNED_SHORT;
        return new Buffer(gl, type_array, item_size, num_items, target, usage, type);
        break;
    case "normals":
        var type_array = new Float32Array(array);
        var item_size  = 3;
        var num_items  = array.length / item_size;
        var target     = gl.ARRAY_BUFFER;
        var usage      = $default(usage, gl.STATIC_DRAW);
        var type       = gl.FLOAT;
        return new Buffer(gl, type_array, item_size, num_items, target, usage, type);
        break;
    case "texcoords":
        var type_array = new Float32Array(array);
        var item_size  = 2;
        var num_items  = array.length / item_size;
        var target     = gl.ARRAY_BUFFER;
        var usage      = $default(usage, gl.STATIC_DRAW);
        var type       = gl.FLOAT;
        return new Buffer(gl, type_array, item_size, num_items, target, usage, type);
        break;
    case "colors":
        var type_array = new Float32Array(array);
        var item_size  = 4;
        var num_items  = array.length / item_size;
        var target     = gl.ARRAY_BUFFER;
        var usage      = $default(usage, gl.STATIC_DRAW);
        var type       = gl.FLOAT;
        return new Buffer(gl, type_array, item_size, num_items, target, usage, type);
    default:
        assert(false, "Unsupported kind '" + kind +  "' given to ToBuffer");
        break;
    }
};
