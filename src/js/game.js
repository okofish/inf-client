// Create prototype
var Game = function(opts) {
  var self = this;

  self.mode = opts.mode || 'normal';
  self.pano = opts.pano;
  self.reply = opts.replyFunction || function() {};
  self.displayLoading = opts.displayLoadingStatus || function() {};
  self.identificationProvider = opts.identificationProvider || 'clarifai';

  self.apiURL = document.location.hostname === 'localhost' ? 'localhost:8000' : 'api.inf.jesse.ws';
  self.svVisible = self.mode !== 'blind';
  self.terminal = $('#game-terminal');
  self.quadrants = {};
  self.lookCache = {};
  self.placeTitle = 'Mysterious Location';
  self.placeTitleCache = {};
  self.directionHeadings = {
    north: 0,
    east: 90,
    south: 180,
    west: 270
  };

  self.pano.addListener('links_changed', function() {
    self.getQuadrants();
    self.describeScene();
  });

  self.pano.addListener('position_changed', function() {
    self.placeTitle = 'Mysterious Location';

    var position = self.pano.getPosition();

    if (self.placeTitleCache.hasOwnProperty(position.toUrlValue())) {
      self.placeTitle = self.placeTitleCache[position.toUrlValue()];
    } else {
      var geocoder = new google.maps.Geocoder;
      geocoder.geocode({
        location: position.toJSON()
      }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          self.placeTitle = results.find(function(result) {
            return result.formatted_address
          }).formatted_address;
          self.placeTitleCache[position.toUrlValue()] = self.placeTitle;
        }
      });
    }
  })
};

Game.prototype.input = function(command) {
  var self = this;

  handleGameCommand(self, command);
}

Game.prototype.goDirection = function(direction) {
  var self = this;

  if (self.quadrants.hasOwnProperty(direction)) {
    self.pano.setPano(self.quadrants[direction].pano);
    self.pano.setPov({
      heading: self.directionHeadings[direction],
      pitch: 0
    });
  } else {
    self.reply('You can\'t go in that direction.')
  }
}

Game.prototype.describeScene = function() {
  var self = this;

  var panoID = self.pano.getPano();

  var loc = self.pano.getLocation();
  var coords = loc.latLng;

  self.displayLoading(true);

  if (self.lookCache.hasOwnProperty(panoID)) {
    self.replyLook(self.lookCache[panoID]);
  } else {
    $.ajax({
      dataType: 'json',
      url: 'http://' + self.apiURL + '/identify/' + self.identificationProvider + '/' + self.pano.getPano(),
      data: coords.toJSON(),
      timeout: 30000
    }).done(function(res) {
      self.replyLook(res, self.pano.getPano());
    }).fail(function(xhr, status, err) {
      if (xhr.responseJSON) {
        if (self.mode === 'debug') {
          self.reply('API ERROR: ' + xhr.responseJSON.error.message);
        }

        console.error(xhr.responseJSON);
        self.replyLook(xhr.responseJSON);
      } else {
        if (err) {
          console.error(err);
          if (self.mode === 'debug') {
            self.reply('AJAX ERROR: ' + err);
          }
        } else {
          if (self.mode === 'debug') {
            self.reply('AJAX ERROR: No error message provided, check the console.');
          }
        }

        self.replyLook({
          error: {
            message: 'Whoops! We had an error classifying the objects in this scene. Try typing "look", or reloading the game and selecting a different classification service.'
          }
        });
      }
    })
  }
}

Game.prototype.replyLook = function(res, panoID) {
  var self = this;

  self.displayLoading(false);
  self.reply(self.placeTitle, true, true);

  if (res.hasOwnProperty('detections')) {
    if (panoID) {
      self.lookCache[panoID] = res;
    }
    if (res.detections.length > 0) {
      self.reply('You see: ' + self.sentenceify(res.detections));
    }
  } else {
    self.reply(res.error.message);
  }
  self.replyExits();

}

Game.prototype.replyExits = function() {
  var self = this;

  var directions = Object.keys(self.quadrants);
  if (self.mode === 'debug') {
    self.reply('Current pano: ' + game.pano.getPano(), true)
    self.reply(JSON.stringify(self.quadrants));
  }

  if (directions.length === 0) {
    self.reply('There are no exits.')
  } else {
    self.reply('There ' + (directions.length >= 2 ? 'are exits' : 'is an exit') + ' to the ' + self.sentenceify(directions) + '.');
  }
}

Game.prototype.invalidCommand = function(command) {
  var self = this;

  self.reply('I don\'t understand the command "' + command + '". If you\'re stuck, say "help" for a list of commands.');
}

Game.prototype.replyHelp = function() {
  var self = this;

  self.reply('Commands:', true);
  self.reply('north/south/east/west/n/s/e/w - travel in the specified direction', true);
  self.reply('look/l - describe the current scene', true);
  self.reply('restart/exit/quit - return to the start screen');
  self.reply('help - display this help');
}

Game.prototype.sentenceify = function(arr) {
  var arr = arr.slice(0);

  if (arr.length === 1) {
    return arr[0]
  }

  var last = arr.pop();
  if (arr.length === 1) {
    return arr.join(', ') + ' and ' + last
  } else {
    return arr.join(', ') + ', and ' + last
  }
}

// here be dragons.
// very large, smelly dragons.
Game.prototype.getQuadrants = function() {
  var self = this;

  /*
    What we're trying to do here is get the available directions for travel (the Street View API calls them links)
    and "round" each one to the nearest cardinal direction. Seems simple enough, but there are a couple gotchas.
  */

  var links = self.pano.getLinks();

  // weird behavior in the Street View API: headings are sometimes not 0-360 as indicated in the docs, but actually -160-200
  // we're scaling them back up
  var links = links.map(function(link) {
    var newLink = link;
    if (newLink.heading < 0) {
      newLink.heading = 360 + newLink.heading;
    }

    return newLink
  });

  var directionClosests = {};

  for (var direction in self.directionHeadings) {
    function linkCloseness(link) {
      var heading = link.heading;
      var directionHeading = self.directionHeadings[direction];
      return Math.min(Math.abs(directionHeading - heading), Math.abs((360 - heading) + directionHeading));
    }

    function headingWithinDirectionRange(heading, direction) {
      switch (direction) {
        case 'north':
          return heading > 315 || heading <= 45
          break;
        case 'east':
          return heading > 45 && heading <= 135
          break;
        case 'south':
          return heading > 135 && heading <= 225
          break;
        case 'west':
          return heading > 225 && heading <= 315
          break;
        default:
          console.error('headingWithinDirectionRange: something is terribly wrong')
      }
    }
    var closest = links.sort(function(link1, link2) {
      var link1rank = linkCloseness(link1);
      var link2rank = linkCloseness(link2);

      if (link1rank < link2rank) {
        return -1;
      } else if (link1rank > link2rank) {
        return 1;
      } else {
        return 0;
      }
    })[0];

    if (headingWithinDirectionRange(closest.heading, direction)) {
      directionClosests[direction] = closest;
    }
  }

  self.quadrants = directionClosests;
}
