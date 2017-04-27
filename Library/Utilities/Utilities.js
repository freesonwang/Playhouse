//Utilities.js
//Helpful functions for general-purpose programming. Functions
//that don't really have anything to do with WebGL.

var radians_in_degrees = Math.PI / 180;
var degrees_in_radians = 180 / Math.PI;

function DegreesToRadians(degrees)
{
    return degrees * radians_in_degrees;
}

function RadiansToDegrees(radians)
{
    return radians * degrees_in_radians;
}

function ClipRotationalDegrees(degrees)
{
    return degrees % 360;
}

function MillisecondsToSeconds(milliseconds)
{
    return milliseconds / 1000.0;
}

function PrintVertices(vertices)
{
	for (var v = 0, vlen = vertices.length; v < vlen; v = v + 3) {
		console.log(vertices[v + 0] + "," + vertices[v + 1] + "," + vertices[v + 2]);
	}
}