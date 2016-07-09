function surpriseLocation(){var e=[[-26.938312,-68.74491499999999],[60.534114,-149.55007899999998],[60.070409,6.542388999999957],[30.184983,-84.72466199999997],[36.252972,136.90053699999999],[48.865937,2.312376],[27.814125,86.713193],[36.2381539,137.9683151],[64.0444798,-16.1711884],[42.658402,11.633269],[30.3248983,35.4471292],[47.51075,10.390309],[53.043081,57.064946],[-8.4226166,115.3124971],[35.659607,139.700378],[50.087586,14.421231],[-13.165713,-72.545542],[41.403286,2.174673],[-14.251967,-170.689851],[33.461503,126.939297],[-64.731988,-62.594564],[27.17557,78.041462],[68.19649,13.53183],[53.2783229,107.3506844],[59.9387245,30.3163621],[40.4900264,-75.0729199],[14.5841104,120.9799109],[17.5707683,120.3886023],[10.6422373,122.2358045],[18.0619395,120.5205914],[17.5713349,120.3887765],[.5738293,37.5750599],[-1.3766622,36.7743556]];return e[Math.floor(Math.random()*e.length)]}function handleGameCommand(e,t){var a=[{name:"north",pattern:directionPattern("north","n"),handler:directionHandler(e,"north")},{name:"south",pattern:directionPattern("south","s"),handler:directionHandler(e,"south")},{name:"east",pattern:directionPattern("east","e"),handler:directionHandler(e,"east")},{name:"west",pattern:directionPattern("west","w"),handler:directionHandler(e,"west")},{name:"look",pattern:new RegExp("^(?:look|examine|l)$","gi"),handler:e.describeScene},{name:"restart",pattern:new RegExp("^(?:restart|exit|quit)$","gi"),handler:exitGame},{name:"help",pattern:new RegExp("^help$","gi"),handler:e.replyHelp}],n=a.find(function(e){return e.pattern.test(t)});n?n.handler.call(e,n.pattern.exec(t)):e.invalidCommand(t)}function directionPattern(e,t){return new RegExp("^(?:go|travel|walk|run|hurry)? ?(?:"+e+"|"+t+")$","gi")}function directionHandler(e,t){return function(){e.goDirection(t)}}function showGame(e,t){var a=getPickerCoords(),t=$("#mode-select").val(),n="blind"!==t;getClosestPano(a,function(e){$("#start-screen").hide(),$("#game-screen").show(),$("#terminal-input").focus(),n?$("#game-terminal").addClass("squished"):$("#game-terminal").removeClass("squished"),game=new Game({mode:t,pano:initPano(e,n),replyFunction:logMessage,displayLoadingStatus:displayLoadingStatus,identificationProvider:$("#service-select").val()})})}function exitGame(){showStart(),$("#game-sv-container").empty(),$("#terminal-history").empty(),$("#terminal-input").val("")}function getClosestPano(e,t){var a=new google.maps.StreetViewService;a.getPanorama({location:{lat:e[0],lng:e[1]},radius:1e3,preference:google.maps.StreetViewPreference.NEAREST,source:google.maps.StreetViewSource.OUTDOOR},function(e,a){a===google.maps.StreetViewStatus.ZERO_RESULTS?$("#nopano-alert").show():($("#nopano-alert").hide(),a===google.maps.StreetViewStatus.OK?t(e.location.latLng):logMessage("Whoops! We had some trouble loading that Street View location. Try reloading the page and starting the game again."))})}function initPano(e,t){$("#game-sv-container").append('<div id="game-sv-window"></div>');var a=new google.maps.StreetViewPanorama(document.getElementById("game-sv-window"),{position:e,disableDefaultUI:!0,enableCloseButton:!1});return t&&($("#game-sv-window").show(),google.maps.event.trigger(a,"resize")),a}function displayLoadingStatus(e){if(e===!0){$("#terminal-input").prop("disabled",!0);var t=["--","\\","|","/"];$("#terminal-input").val(t[0]);var a=setInterval(function(){var e=$("#terminal-input").val();"/"===e?$("#terminal-input").val("--"):$("#terminal-input").val(t[t.indexOf(e)+1])},100);$("#terminal-input").prop("interval-id",a)}else{var a=parseInt($("#terminal-input").prop("interval-id"));clearInterval(a),$("#terminal-input").prop("disabled",!1).removeProp("interval-id").val("").focus()}}function logMessage(e,t,a){var n=$("<span/>").addClass("terminal-history-message").text(e);">"===e.charAt(0)||t||n.addClass("response-message"),a&&n.addClass("bold-message"),$("#terminal-history").append(n),$("#terminal-history").scrollTop($("#terminal-history")[0].scrollHeight)}function showStart(){$("#game-screen").hide(),$("#start-screen").show(),$("#location-presets").change()}function showPicker(){$("#location-picker").show();var e=getPickerCoords()[0],t=getPickerCoords()[1];$("#location-lat").val(e),$("#location-lon").val(t),$("#location-map-container").append('<div id="location-map"></div>'),$("#location-map").locationpicker({location:{latitude:e,longitude:t},radius:0,inputBinding:{latitudeInput:$("#location-lat"),longitudeInput:$("#location-lon"),locationNameInput:$("#location-address")},enableAutocomplete:!0}),svCoverageLayer.setMap($("#location-map").locationpicker("map").map)}function removePicker(){$("#location-picker").hide(),$("#location-map-container").empty(),svCoverageLayer.setMap(null)}function getPickerCoords(){return[parseFloat($("#location-lat").val()),parseFloat($("#location-lon").val())]}$(document).foundation(),$(document).ready(function(){showStart(),console.log("Hello, adventurous console explorer!"),console.log("Try starting the game, then check out the properties of the `game` object.")});var game;$("#terminal-input").keyup(function(e){if(13==e.keyCode){var t=$(this).val();$(this).val(""),game&&""!==t&&(logMessage("> "+t),game.input(t))}});var Game=function(e){var t=this;t.mode=e.mode||"normal",t.pano=e.pano,t.reply=e.replyFunction||function(){},t.displayLoading=e.displayLoadingStatus||function(){},t.identificationProvider=e.identificationProvider||"clarifai",t.apiURL="localhost"===document.location.hostname?"localhost:8000":"api.inf.jesse.ws",t.svVisible="blind"!==t.mode,t.terminal=$("#game-terminal"),t.quadrants={},t.lookCache={},t.placeTitle="Mysterious Location",t.placeTitleCache={},t.directionHeadings={north:0,east:90,south:180,west:270},t.pano.addListener("links_changed",function(){t.getQuadrants(),t.describeScene()}),t.pano.addListener("position_changed",function(){t.placeTitle="Mysterious Location";var e=t.pano.getPosition();if(t.placeTitleCache.hasOwnProperty(e.toUrlValue()))t.placeTitle=t.placeTitleCache[e.toUrlValue()];else{var a=new google.maps.Geocoder;a.geocode({location:e.toJSON()},function(a,n){n===google.maps.GeocoderStatus.OK&&(t.placeTitle=a.find(function(e){return e.formatted_address}).formatted_address,t.placeTitleCache[e.toUrlValue()]=t.placeTitle)})}t.pano.setZoom(0)})};Game.prototype.input=function(e){var t=this;handleGameCommand(t,e)},Game.prototype.goDirection=function(e){var t=this;t.quadrants.hasOwnProperty(e)?(t.pano.setPano(t.quadrants[e].pano),t.pano.setPov({heading:t.directionHeadings[e],pitch:0})):t.reply("You can't go in that direction.")},Game.prototype.describeScene=function(){var e=this,t=e.pano.getPano(),a=e.pano.getLocation(),n=a.latLng;e.displayLoading(!0),e.lookCache.hasOwnProperty(t)?e.replyLook(e.lookCache[t]):$.ajax({dataType:"json",url:"http://"+e.apiURL+"/identify/"+e.identificationProvider+"/"+e.pano.getPano(),data:n.toJSON(),timeout:3e4}).done(function(t){e.replyLook(t,e.pano.getPano())}).fail(function(t,a,n){t.responseJSON?("debug"===e.mode&&e.reply("API ERROR: "+t.responseJSON.error.message),console.error(t.responseJSON),e.replyLook(t.responseJSON)):(n?(console.error(n),"debug"===e.mode&&e.reply("AJAX ERROR: "+n)):"debug"===e.mode&&e.reply("AJAX ERROR: No error message provided, check the console."),e.replyLook({error:{message:'Whoops! We had an error classifying the objects in this scene. Try typing "look", or reloading the game and selecting a different classification service.'}}))})},Game.prototype.replyLook=function(e,t){var a=this;a.displayLoading(!1),a.reply(a.placeTitle,!0,!0),e.hasOwnProperty("detections")?(t&&(a.lookCache[t]=e),e.detections.length>0&&a.reply("You see: "+a.sentenceify(e.detections))):a.reply(e.error.message),a.replyExits()},Game.prototype.replyExits=function(){var e=this,t=Object.keys(e.quadrants);"debug"===e.mode&&(e.reply("Current pano: "+game.pano.getPano(),!0),e.reply(JSON.stringify(e.quadrants))),0===t.length?e.reply("There are no exits."):e.reply("There "+(t.length>=2?"are exits":"is an exit")+" to the "+e.sentenceify(t)+".")},Game.prototype.invalidCommand=function(e){var t=this;t.reply("I don't understand the command \""+e+'". If you\'re stuck, say "help" for a list of commands.')},Game.prototype.replyHelp=function(){var e=this;e.reply("Commands:",!0),e.reply("north/south/east/west/n/s/e/w - travel in the specified direction",!0),e.reply("look/l - describe the current scene",!0),e.reply("restart/exit/quit - return to the start screen"),e.reply("help - display this help")},Game.prototype.sentenceify=function(e){var e=e.slice(0);if(1===e.length)return e[0];var t=e.pop();return 1===e.length?e.join(", ")+" and "+t:e.join(", ")+", and "+t},Game.prototype.getQuadrants=function(){function e(e){var t=e.heading,n=a.directionHeadings[r];return Math.min(Math.abs(n-t),Math.abs(360-t+n))}function t(e,t){switch(t){case"north":return e>315||e<=45;case"east":return e>45&&e<=135;case"south":return e>135&&e<=225;case"west":return e>225&&e<=315;default:console.error("headingWithinDirectionRange: something is terribly wrong")}}var a=this,n=a.pano.getLinks(),n=n.map(function(e){var t=e;return t.heading<0&&(t.heading=360+t.heading),t}),o={};for(var r in a.directionHeadings){var i=n.sort(function(t,a){var n=e(t),o=e(a);return n<o?-1:n>o?1:0})[0];t(i.heading,r)&&(o[r]=i)}a.quadrants=o};var presets={eiffel:[48.85915,2.29312],tonic:[39.959218,-75.147031],indonesia:[-8.4226166,115.3124971]},defaultPreset="eiffel",svCoverageLayer=new google.maps.StreetViewCoverageLayer;$("#location-presets").change(function(){var e=$(this).val();switch(e){case"custom":showPicker();break;case"surprise":var t=surpriseLocation();$("#location-lat").val(t[0]),$("#location-lon").val(t[1]);break;default:var a=presets[e];"object"==typeof a?($("#location-lat").val(a[0]),$("#location-lon").val(a[1])):$("#location-picker").val(defaultPreset)}"custom"!==e&&removePicker()}),$("#start-button").click(function(){removePicker(),showGame()});