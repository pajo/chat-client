var Primus = require('primus'); 

var Socket = Primus.createSocket({ transformer: 'websockets' })
  , client = new Socket('http://localhost:8080');

module.exports = {
  join: join,
  leave: leave,
  sendMessage: sendMessage,
  onmessage: onFactory('message'),
  onjoin: onFactory('join'),
  onleave: onFactory('leave')
}

var users = [],
    messageId = 0,
    promises = {},
    handlers = {};

client.on('data', function (message) {
  switch (message.type) {
    case 'server-info':
      var promise = promises[message.id];
      promise.resolve({
        users: message.users  
      });
      delete promises[message.id];
      break;
    case 'welcome':
      if (handlers.join) { 
        handlers.join({
          name: message.name,
          race: message.group
        });
      }
      break;
    case 'goodbye':
      if (message.id) {
        var promise = promises[message.id];
        promise.resolve();
        delete promises[message.id];
      } else {
        if (handlers.leave) { 
          handlers.leave({
            name: message.name,
            race: message.group
          });
        }
      }
      break;      
    case 'message':
      if (handlers.message) { 
        handlers.message({
          from: {
            name: message.name,
            race: message.group
          },
          message: message    
        });
      }
      break;
    case 'error':
      if (message.id) {
        var promise = promises[message.id];
        promise.reject({
          message: message.message
        });
        delete promises[message.id];
      } else {
        throw message.message;
      } 
      break; 
  }
});

function onFactory(handlerName) {
  return function(handler) {
    handlers[handlerName] = handler;
  };
}

function leave() {
  return new Promise(function (resolve, reject) {
    promises[messageId++] = {
      resolve: resolve,
      reject: reject
    };
    
    client.write({
      id: messageId,
      type: 'leave'
    });
  });
}

function join(user) {
  return new Promise(function (resolve, reject) {
    promises[messageId++] = {
      resolve: resolve,
      reject: reject
    };
    
    client.write({
      id: messageId,
      type: 'join',
      name: user.name,
      group: user.group
    });
  });
}

function sendMessage(message) {
  client.write({
    type: 'message',
    message: message
  });
}
