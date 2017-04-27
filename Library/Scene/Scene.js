//Scene.js
//The Scene class is the base class for implementing a graphical scene.
//It contains the items needed (the gl context, projection and modelview matrices) for
//graphical rendering.
var Scene = new Class
({
    initialize: function(canvas)
    {
        this.canvas                     = canvas;
        this.gl                         = CreateGLContext(canvas);
        this.p_mat                      = mat4.create();
        this.m_mat                      = mat4.create();
        this.norm_mat                   = mat3.create();
        this.m_mat_stack                = [ ];
        SetupGLEnvironment(this.gl);
    },

    //Setup the graphical environment with some nice default parameters.
    PrepareToDraw: function()
    {
        var fov          = 45;
        var near_clip    = .1;
        var far_clip     = 1000;
        SetupDrawingEnvironment(this.gl, this.canvas.getSize().x, this.canvas.getSize().y, fov, near_clip, far_clip, this.p_mat, this.m_mat);
    },

    //Saves the state of the modelview matrix by pushing it onto the stack.
    SaveModelviewMatrixState: function()
    {
        PushMatrix(this.m_mat, this.m_mat_stack);
    },

    //Restores the state of the modelview matrix by popping it off the stack.
    RestoreModelviewMatrixState: function()
    {
        this.m_mat = PopMatrix(this.m_mat_stack);
    },

    TransformMatricies: function(position, rotation, rotation_axis)
    {
        var gl = this.gl;
        this.m_mat       = TransformModelviewMatrix(gl, position, rotation, rotation_axis, this.m_mat);
        this.norm_mat    = TransformNormalMatrix(gl, this.m_mat);
    }
});


