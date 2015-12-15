
var Primus = require('primus'); 

var Socket = Primus.createSocket({ transformer: 'websockets' }),
    client;

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

function onFactory(handlerName) {
  return function(handler) {
    handlers[handlerName] = handler;
  };
}

function leave() {
  return new Promise(function (resolve, reject) {
    promises[messageId] = {
      resolve: resolve,
      reject: reject
    };
    
    client.write({
      id: messageId,
      type: 'leave'
    });
    
    messageId++;
  });
}

function join(serverAddress, user) {
  client = new Socket(serverAddress);
  
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
            group: message.group
          });
        }
        break;
      case 'goodbye':
        if (message.id !== undefined) {
          var promise = promises[message.id];
          promise.resolve();
          delete promises[message.id];
        } else {
          if (handlers.leave) { 
            handlers.leave({
              name: message.name,
              group: message.group
            });
          }
        }
        break;      
      case 'message':
        if (handlers.message) { 
          handlers.message({
            from: {
              name: message.name,
              group: message.group
            },
            message: message    
          });
        }
        break;
      case 'error':
        if (message.id !== undefined) {
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
  
  return new Promise(function (resolve, reject) {
    promises[messageId] = {
      resolve: resolve,
      reject: reject
    };
    
    client.write({
      id: messageId,
      type: 'join',
      name: user.name,
      group: user.group
    });
    
    messageId++;
  });
}

function sendMessage(message) {
  client.write({
    type: 'message',
    message: message
  });
}
