import App from './components/App';


var colors = new Array( // ???
    [62,35,255],
    [60,255,60],
    [255,35,98],
    [45,175,230],
    [255,0,255],
    [255,128,0]);

var step = 0;
var colorIndexes = [0,1,2,3]; // [left_current, left_next, right_current, right_next]

//transition speed
var gradientSpeed = 0.002;

function updateGradient() {
    var t;
    if ( $===undefined ) return;

    var c0_0 = colors[colorIndexes[0]];
    var c0_1 = colors[colorIndexes[1]];
    var c1_0 = colors[colorIndexes[2]];
    var c1_1 = colors[colorIndexes[3]];

    var istep = 1 - step;
    var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
    var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
    var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
    var color1 = "rgb("+r1+","+g1+","+b1+")";

    var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
    var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
    var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
    var color2 = "rgb("+r2+","+g2+","+b2+")";

    $('#gradient').css({
        background: "-webkit-gradient(linear, left top, right top, from("+color1+"), to("+color2+"))"}).css({
        background: "-moz-linear-gradient(left, "+color1+" 0%, "+color2+" 100%)"});

    step += gradientSpeed;
    if ( step >= 1 )
    {
        step %= 1;
        colorIndexes[0] = colorIndexes[1];
        colorIndexes[2] = colorIndexes[3];

        //pick two new target color indices
        //do not pick the same as the current one
        colorIndexes[1] = (colorIndexes[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
        colorIndexes[3] = (colorIndexes[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
    }
}

setInterval(updateGradient, 10); 
