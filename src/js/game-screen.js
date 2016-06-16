var game;

function showGame(location, mode) {
  var coords = getPickerCoords();
  var mode = $('#mode-select').val();
  var showSV = mode !== 'blind';

  getClosestPano(coords, function(panolocation) {
    $('#start-screen').hide();
    $('#game-screen').show();

    $('#terminal-input').focus();

    if (showSV) {
      $('#game-terminal').addClass('squished');
    }

    game = new Game({
      mode: mode,
      pano: initPano(panolocation, showSV),
      replyFunction: logMessage,
      displayLoadingStatus: displayLoadingStatus,
      identificationProvider: $('#service-select').val()
    });
  })
}

function exitGame() {
  showStart();
  $('#game-sv-container').empty();
  $('#terminal-history').empty();
  $('#terminal-input').val('');
}

function getClosestPano(location, cb) {
  var sv = new google.maps.StreetViewService();

  sv.getPanorama({
    location: {
      lat: location[0],
      lng: location[1]
    },
    radius: 1000,
    preference: google.maps.StreetViewPreference.NEAREST,
    source: google.maps.StreetViewSource.OUTDOOR
  }, function(data, status) {
    if (status === 'ZERO_RESULTS') {
      $('#nopano-alert').show();
    } else {
      $('#nopano-alert').hide();
      if (status === 'OK') {
        cb(data.location.latLng);
      } else {
        logMessage('Whoops! We had some trouble loading that Street View location. Try reloading the page and starting the game again.');
      }
    }
  });
}

function initPano(location, show) {
  $('#game-sv-container').append('<div id="game-sv-window"></div>');
  var panorama = new google.maps.StreetViewPanorama(
    document.getElementById('game-sv-window'), {
      position: location,
      disableDefaultUI: true,
      enableCloseButton: false
    }
  );

  if (show) {
    $('#game-sv-window').show();

    google.maps.event.trigger(panorama,'resize');
  }

  return panorama
}

function displayLoadingStatus(status) {
  if (status === true) {
    $('#terminal-input').prop('disabled', true);

    var spinner = ['--', '\\', '|', '/']
    $('#terminal-input').val(spinner[0]);
    var intervalID = setInterval(function() {
      var currentVal = $('#terminal-input').val();
      if (currentVal === '/') {
        $('#terminal-input').val('--');
      } else {
        $('#terminal-input').val(spinner[spinner.indexOf(currentVal) + 1]);
      }
    }, 100);

    $('#terminal-input').prop('interval-id', intervalID)

  } else {
    var intervalID = parseInt($('#terminal-input').prop('interval-id'));
    clearInterval(intervalID);

    $('#terminal-input')
      .prop('disabled', false)
      .removeProp('interval-id')
      .val('')
      .focus()
  }
}

function logMessage(message, noResponseClass, bold) {
  var messageContainer = $('<span/>')
    .addClass('terminal-history-message')
    .text(message);
  if (message.charAt(0) !== '>' && !noResponseClass) {
    messageContainer.addClass('response-message');
  }
  if (bold) {
    messageContainer.addClass('bold-message');
  }
  $('#terminal-history').append(messageContainer);
  $('#terminal-history').scrollTop($('#terminal-history')[0].scrollHeight)
}

$('#terminal-input').keyup(function(e) {
  if (e.keyCode == 13) // on enter
  {
    var command = $(this).val();
    $(this).val('');

    if (game && command !== '') {
      logMessage('> ' + command);
      game.input(command);
    }
  }
});
