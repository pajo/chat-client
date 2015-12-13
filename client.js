var Primus = require('primus'),
    wnd = require('./window');

var Socket = Primus.createSocket({ transformer: 'websockets' })
  , client = new Socket('http://localhost:8080');

client.write('jea');

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

messagesWnd.write(
`Darth Vader:
Luke the force is weak with you. And I'm your father!
`);

messagesWnd.write(
`Luke Skywalker:
I'm gonna boba fet your mother and shit on ya face madafucker!!!
`);



