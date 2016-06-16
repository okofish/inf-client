function handleGameCommand(self, message) {
  var commands = [{
    name: 'north',
    pattern: directionPattern('north', 'n'),
    handler: directionHandler(self, 'north')
  }, {
    name: 'south',
    pattern: directionPattern('south', 's'),
    handler: directionHandler(self, 'south')
  }, {
    name: 'east',
    pattern: directionPattern('east', 'e'),
    handler: directionHandler(self, 'east')
  }, {
    name: 'west',
    pattern: directionPattern('west', 'w'),
    handler: directionHandler(self, 'west')
  }, {
    name: 'look',
    pattern: new RegExp('^(?:look|examine|l)$', 'gi'),
    handler: self.describeScene
  }, {
    name: 'restart',
    pattern: new RegExp('^(?:restart|exit|quit)$', 'gi'),
    handler: exitGame
  }, {
    name: 'help',
    pattern: new RegExp('^help$', 'gi'),
    handler: self.replyHelp
  }];

  var command = commands.find(function(command) {
    return command.pattern.test(message)
  });

  if (command) {
    command.handler.call(self, command.pattern.exec(message));
  } else {
    self.invalidCommand(message);
  }
}

function directionPattern(direction, abbreviated) {
  return new RegExp('^(?:go|travel|walk|run|hurry)? ?(?:' + direction + '|' + abbreviated + ')$', 'gi');
}

function directionHandler(self, direction) {
  return function() {
    self.goDirection(direction)
  }
}
