// from https://www.npmjs.com/package/awesome-streetview

function surpriseLocation() {
  var locations = [
    [-26.938312, -68.74491499999999],
    [60.534114, -149.55007899999998],
    [60.070409, 6.542388999999957],
    [30.184983, -84.72466199999997],
    [36.252972, 136.90053699999999],
    [48.865937, 2.312376],
    [27.814125, 86.713193],
    [36.2381539, 137.9683151],
    [64.0444798, -16.1711884],
    [42.658402, 11.633269],
    [30.3248983, 35.4471292],
    [47.51075, 10.390309],
    [53.043081, 57.064946],
    [-8.4226166, 115.3124971],
    [35.659607, 139.700378],
    [50.087586, 14.421231],
    [-13.165713, -72.545542],
    [41.403286, 2.174673],
    [-14.251967, -170.689851],
    [33.461503, 126.939297],
    [-64.731988, -62.594564],
    [27.17557, 78.041462],
    [68.19649, 13.53183],
    [53.2783229, 107.3506844],
    [59.9387245, 30.3163621],
    [40.4900264, -75.0729199],
    [14.5841104, 120.9799109],
    [17.5707683, 120.3886023],
    [10.6422373, 122.2358045],
    [18.0619395, 120.5205914],
    [17.5713349, 120.3887765],
    [0.5738293, 37.5750599],
    [-1.3766622, 36.7743556]
  ];
  return locations[Math.floor(Math.random() * locations.length)]
}