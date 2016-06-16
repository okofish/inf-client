// Preset settings

var presets = {
  'eiffel': [48.859150, 2.293120],
  'tonic': [39.959218, -75.147031],
  'indonesia': [-8.4226166, 115.3124971]
},
  defaultPreset = 'eiffel';

var svCoverageLayer = new google.maps.StreetViewCoverageLayer();

// Show start screen

function showStart() {
  $('#game-screen').hide();
  $('#start-screen').show();
  $('#location-presets').change(); // manually triggering a change event on #location-presets so lat and lon fields are set
}

// Show custom location picker

function showPicker() {
  $('#location-picker').show();
  var newLat = getPickerCoords()[0];
  var newLon = getPickerCoords()[1];
  $('#location-lat').val(newLat);
  $('#location-lon').val(newLon);

  $('#location-map-container').append('<div id="location-map"></div>')
  $('#location-map').locationpicker({
    location: {
      latitude: newLat,
      longitude: newLon
    },
    radius: 0,
    inputBinding: {
      latitudeInput: $('#location-lat'),
      longitudeInput: $('#location-lon'),
      locationNameInput: $('#location-address')
    },
    enableAutocomplete: true
  });

  svCoverageLayer.setMap($('#location-map').locationpicker('map').map);
}

function removePicker() {
  $('#location-picker').hide();
  $('#location-map-container').empty();
  svCoverageLayer.setMap(null);
}

function getPickerCoords() {
  return [parseFloat($('#location-lat').val()), parseFloat($('#location-lon').val())]
}

// Listen for location preset selector change

$('#location-presets').change(function() {
  var value = $(this).val();
  switch (value) {
    case 'custom':
      showPicker();
      break;
    case 'surprise':
      var surprise = surpriseLocation();
      $('#location-lat').val(surprise[0]);
      $('#location-lon').val(surprise[1]);
      break;
    default:
      var preset = presets[value];
      if (typeof preset === 'object') {
        $('#location-lat').val(preset[0]);
        $('#location-lon').val(preset[1]);
      } else {
        $('#location-picker').val(defaultPreset);
      }
  }

  if (value !== 'custom') {
    removePicker()
  }
});

// Listen for the start button to be clicked
$('#start-button').click(function() {
  showGame();
});
