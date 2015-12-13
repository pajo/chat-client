var Primus = require('primus'), 
    _ = require('lodash-node'),
    wnd = require('./window');

var Socket = Primus.createSocket({ transformer: 'websockets' })
  , client = new Socket('http://localhost:8080');

var messagesWnd = wnd.createWindow({
  width: 55,
  height: 60,
  title: 'Poruke'
});

var participantsWnd = wnd.createWindow({
  width: 25,
  height: 60,
  left: 55,
  title: 'Ekipa'
});

var infoWnd = wnd.createWindow({
  width: 80,
  height: 2,
  top: 61,
  title: 'Info'
});

var newMessage = wnd.createWindow({
  width: 80,
  height: 4,
  top: 63,
  title: 'Nova poruka',
  input: function (message) {
    client.write({
      type: 'message',
      message: message
    });
  }
});

client.write({
  type: 'join',
  name: 'pajo',
  group: 'borg'
});

var users = [];
var colors = {
  'borg': 'red'
};

client.on('data', function (message) {
  switch (message.type) {
    case 'server-info':
      users = message.users;
      renderParticipants();
      
      client.write({
        type: 'message',
        message: 'jea'
      });
      break;
    case 'welcome':
      users.push({
        name: message.name,
        group: message.group
      });
      
      renderParticipants();
      break;
    case 'message':
      var options = {};
      
      var color = colors[message.group];
      if (color) {
        options.color = color;
      }
      
      messagesWnd.write(message.name + ':', options);
      messagesWnd.write(message.message, options);
      break;
    case 'error':
      throw message.message;  
  }
});

function renderParticipants() {
  participantsWnd.write(_.map(users, function (user) { return `${ user.name }(${ user.group })`; }).join('\n'), { clear: true });
}

messagesWnd.write(
`Darth Vader:
Luke the force is weak with you. And I'm your father!
`);

messagesWnd.write(
`Luke Skywalker:
I'm gonna boba fet your mother and shit on ya face madafucker!!!
`);



