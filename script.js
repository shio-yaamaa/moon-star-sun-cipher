// common
var SIZE = 1000;
var CIRCLE_HANDLE_RATIO = 0.55;
// char body
var MOON_DIAMETER = 760;
var STAR_DIAMETER = 800;
var SUN_DIAMETER  = 530;
var SUN_MARGIN    = 50;
var RADIATION_LENGTH = 110;
// attachment (濁点, 半濁点, 右下の丸)
var ATTACHED_CIRCLE_DISTANCE_FROM_CENTER = 380;
var ATTACHED_CIRCLE_DIAMETER = 150;

// rule
var HALF_MOON_INDEX_LIST     = {k: 0, g: 0, s: 1, z: 1, t: 2, d: 2, n: 3};
var CRESCENT_MOON_INDEX_LIST = {h: 0, b: 0, p: 0, m: 1, y: 2, r: 3};
var STAR_INCOMPLETE_INDEX_LIST
  = {a: null, k: 0, g: 0, s: 1, z: 1, t: 2, d: 2, n: 3, h: 4, b: 4, p: 4, m: 5, r: null};
var RADIATION_SKIP_INDEX_LIST
  = {a: null, k: 0, g: 0, s: 1, z: 1, t: 2, d: 2, n: 3, h: 4, b: 4, p: 4, m: 5, y: 6, r: 7, w: null};

// main
var char    = window.location.search.match(/char=(.*?)(&|$)/)[1];
var isSmall = window.location.search.match(/small=(.*?)(&|$)/)[1] == 'true';

var d;
var consonant = char.length == 1 ? 'a' : char.substr(0, 1);
switch (char.substr(char.length - 1, 1)) {
  case 'a':
    d = vowelAorN(consonant, isSmall);
    break;
  case 'i':
  case 'e':
    d = vowelIorE(consonant, isSmall);
    break;
  case 'u':
  case 'o':
    d = vowelUorO(consonant, isSmall);
    break;
  case 'n':
    d = vowelAorN(null, isSmall);
}
outputD(d);
showPath(d);

function addCircle(d, center, radius) {
  var handleLength = radius * CIRCLE_HANDLE_RATIO;
  return d + " M " +  center[0]                 + "," + (center[1] -       radius)
           + " C " + (center[0] - handleLength) + "," + (center[1] -       radius)
           + " "   + (center[0] -       radius) + "," + (center[1] - handleLength)
           + " "   + (center[0] -       radius) + "," +  center[1]
           + " "   + (center[0] -       radius) + "," + (center[1] + handleLength)
           + " "   + (center[0] - handleLength) + "," + (center[1] +       radius)
           + " "   +  center[0]                 + "," + (center[1] +       radius)
           + " "   + (center[0] + handleLength) + "," + (center[1] +       radius)
           + " "   + (center[0] +       radius) + "," + (center[1] + handleLength)
           + " "   + (center[0] +       radius) + "," +  center[1]
           + " "   + (center[0] +       radius) + "," + (center[1] - handleLength)
           + " "   + (center[0] + handleLength) + "," + (center[1] -       radius)
           + " "   +  center[0]                 + "," + (center[1] -       radius)
           + " Z";
}

function addHalfCircle(d, center, radius, angle) {
  var handleLength  = radius * CIRCLE_HANDLE_RATIO;
  var leftPos       = rotate([center[0] -       radius, center[1]               ], [SIZE / 2, SIZE / 2], angle);
  var leftHandle    = rotate([center[0] -       radius, center[1] + handleLength], [SIZE / 2, SIZE / 2], angle);
  var bottomHandle1 = rotate([center[0] - handleLength, center[1] +       radius], [SIZE / 2, SIZE / 2], angle);
  var bottomPos     = rotate([center[0]               , center[1] +       radius], [SIZE / 2, SIZE / 2], angle);
  var bottomHandle2 = rotate([center[0] + handleLength, center[1] +       radius], [SIZE / 2, SIZE / 2], angle);
  var rightHandle   = rotate([center[0] +       radius, center[1] + handleLength], [SIZE / 2, SIZE / 2], angle);
  var rightPos      = rotate([center[0] +       radius, center[1]               ], [SIZE / 2, SIZE / 2], angle);
  return d + " M " +       leftPos[0] + "," +       leftPos[1]
           + " C " +    leftHandle[0] + "," +    leftHandle[1]
           + " "   + bottomHandle1[0] + "," + bottomHandle1[1]
           + " "   +     bottomPos[0] + "," +     bottomPos[1]
           + " "   + bottomHandle2[0] + "," + bottomHandle2[1]
           + " "   +   rightHandle[0] + "," +   rightHandle[1]
           + " "   +      rightPos[0] + "," +      rightPos[1]
           + " Z";
}

function addCrescentCircle(d, center, radius, angle) {
  var handleLength  = radius * CIRCLE_HANDLE_RATIO;
  d = addHalfCircle(d, center, radius, angle);
  // remove " Z"
  d = d.substr(0, d.length - 2);
  var rightHandle = rotate([center[0] + radius - handleLength, center[1] + handleLength], [SIZE / 2, SIZE / 2], angle);
  var leftHandle  = rotate([center[0] - radius + handleLength, center[1] + handleLength], [SIZE / 2, SIZE / 2], angle);
  var leftPos     = rotate([center[0] - radius               , center[1]               ], [SIZE / 2, SIZE / 2], angle);
  return d + " " + rightHandle[0] + "," + rightHandle[1]
    + " " + leftHandle[0] + "," + leftHandle[1]
    + " " + leftPos[0] + "," + leftPos[1] + " Z";
}

function addTriangle(d, center, radius, angle) {
  var upperPos = rotate([center[0], center[1] - radius], [SIZE / 2, SIZE / 2], angle);
  var lowerLeftPos  = rotate([center[0] - radius * Math.sqrt(3) / 2, center[1] + radius / 2], [SIZE / 2, SIZE / 2], angle);
  var lowerRightPos = rotate([center[0] + radius * Math.sqrt(3) / 2, center[1] + radius / 2], [SIZE / 2, SIZE / 2], angle);
  return d + " M " + upperPos[0] + "," + upperPos[1]
    + " L " + lowerLeftPos[0] + "," + lowerLeftPos[1]
    + " " + lowerRightPos[0] + "," + lowerRightPos[1] + " Z";
}

function addIncompleteTriangle(d, center, radius, angle) {
  var upperLeftPos  = rotate([center[0] - radius / Math.sqrt(3) / 2, center[1] - radius / 2], [SIZE / 2, SIZE / 2], angle);
  var lowerLeftPos  = rotate([center[0] - radius * Math.sqrt(3) / 2, center[1] + radius / 2], [SIZE / 2, SIZE / 2], angle);
  var lowerRightPos = rotate([center[0] + radius * Math.sqrt(3) / 2, center[1] + radius / 2], [SIZE / 2, SIZE / 2], angle);
  var upperRightPos = rotate([center[0] + radius / Math.sqrt(3) / 2, center[1] - radius / 2], [SIZE / 2, SIZE / 2], angle);
  return d + " M " + upperLeftPos[0] + "," + upperLeftPos[1]
    + " L " + lowerLeftPos[0]  + "," +  lowerLeftPos[1]
    + " "   + lowerRightPos[0] + "," + lowerRightPos[1]
    + " "   + upperRightPos[0] + "," + upperRightPos[1] + " Z";
}

function addLine(d, startPos, endPos) {
  return d + " M " + startPos[0] + "," + startPos[1] + " L " + endPos[0] + "," + endPos[1];
}

function attachLowerRight(d) {
  return addCircle(
    d,
    [SIZE / 2 + ATTACHED_CIRCLE_DISTANCE_FROM_CENTER, SIZE / 2 + ATTACHED_CIRCLE_DISTANCE_FROM_CENTER],
    ATTACHED_CIRCLE_DIAMETER / 2
  );
}

function attachUpperRight(d) {
  return addCircle(
    d,
    [SIZE / 2 + ATTACHED_CIRCLE_DISTANCE_FROM_CENTER, SIZE / 2 - ATTACHED_CIRCLE_DISTANCE_FROM_CENTER],
    ATTACHED_CIRCLE_DIAMETER / 2
  );
}

// CCWじゃないかも
function rotate(pos, center, degree) {
  var precision = 5;
  var radian = degree2radian(degree);
  var x = center[0] + (pos[0] - center[0]) * Math.cos(radian) - (pos[1] - center[1]) * Math.sin(radian);
  var y = center[1] + (pos[0] - center[0]) * Math.sin(radian) + (pos[1] - center[1]) * Math.cos(radian);
  return [roundWithPrecision(x, precision), roundWithPrecision(y, precision)];
}

function roundWithPrecision(num, precision) {
  var digit = Math.pow(10, precision);
  num *= Math.pow(10, precision);
  return Math.round(num) / digit;
}

function degree2radian(degree) {
  return degree * (Math.PI / 180);
}

function outputD(d) {
  document.getElementById('d_output').textContent = d;
}

function showPath(d) {
  document.getElementById('path').setAttribute('d', d);
  console.log(document.getElementById('path').parentElement.outerHTML.replace(/(\s){2}/g, ''));
}

// if N, set consonant null
function vowelAorN(consonant, isSmall) {
  var radiationSkipIndex = consonant == null ? null : RADIATION_SKIP_INDEX_LIST[consonant];
  var d = addCircle('', [SIZE / 2, SIZE / 2], SUN_DIAMETER / 2);
  for (var i = 0; i < 8; i++) {
    if (i != radiationSkipIndex) {
      var rotateDegree = 360 / 8 * i;
      d = addLine(
        d,
        rotate([SIZE / 2, (SIZE - SUN_DIAMETER) / 2 - SUN_MARGIN], [SIZE / 2, SIZE / 2], rotateDegree),
        rotate([SIZE / 2, (SIZE - SUN_DIAMETER) / 2 - SUN_MARGIN - RADIATION_LENGTH], [SIZE / 2, SIZE / 2], rotateDegree)
      );
    }
  }
  if (consonant == 'w') {
    d = attachLowerRight(d);
  }
  if (consonant == 'g' || consonant == 'z' || consonant == 'd' || consonant == 'b' || consonant == 'p' || isSmall) {
    d = attachUpperRight(d);
  }
  return d;
}

function vowelIorE(consonant, isSmall) {
  var d = '';
  if (consonant == 'a' || consonant == 'r') {
    d = addTriangle(d, [SIZE / 2, SIZE / 2], STAR_DIAMETER / 2, 0);
    d = addTriangle(d, [SIZE / 2, SIZE / 2], STAR_DIAMETER / 2, 180);
    if (consonant == 'r') {
      d = attachLowerRight(d);
    }
  } else {
    var rotateDegree = 60 * STAR_INCOMPLETE_INDEX_LIST[consonant];
    // rotate complete triangle 180 degrees by default
    d = addTriangle(d, [SIZE / 2, SIZE / 2], STAR_DIAMETER / 2, 180 + rotateDegree);
    d = addIncompleteTriangle(d, [SIZE / 2, SIZE / 2], STAR_DIAMETER / 2, rotateDegree);
  }
  if (consonant == 'g' || consonant == 'z' || consonant == 'd' || consonant == 'b' || consonant == 'p' || isSmall) {
    d = attachUpperRight(d);
  }
  return d;
}

function vowelUorO(consonant, isSmall) {
  var d = '';
  if (consonant == 'a' || consonant == 'w') {
    d = addCircle(d, [SIZE / 2, SIZE / 2], MOON_DIAMETER / 2);
    if (consonant == 'w') {
      d = attachLowerRight(d);
    }
  }
  if (consonant in HALF_MOON_INDEX_LIST) {
    d = addHalfCircle(d, [SIZE / 2, SIZE / 2], MOON_DIAMETER / 2, 90 * HALF_MOON_INDEX_LIST[consonant]);
  }
  if (consonant in CRESCENT_MOON_INDEX_LIST) {
    d = addCrescentCircle(d, [SIZE / 2, SIZE / 2], MOON_DIAMETER / 2, 90 * CRESCENT_MOON_INDEX_LIST[consonant]);
  }
  if (consonant == 'g' || consonant == 'z' || consonant == 'd' || consonant == 'b' || consonant == 'p' || isSmall) {
    d = attachUpperRight(d);
  }
  return d;
}