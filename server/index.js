const { WebSocketServer } = require("ws");

var porta = 3000;
const channels = {};
const server = new WebSocketServer({ port: porta });
server.on("listening", () => {console.log("Servidor rodando na porta "+porta+"...");});
server.on("connection", handleConnection); //Usado no back-end(node.js) no lugar do addEventListenner...

function handleConnection(ws) {
  console.log('New connection');
  ws.send( JSON.stringify({ type: 'connection-established' }) );
  
  let id;
  let channel = "";
  ws.on("error", () => console.log('websocket error'));
  ws.on('message', message => {
    const object = JSON.parse(message);
    
    if (object.type === "join-channel") {
      channel = object.channel;
      if (channels[channel] === undefined) channels[channel] = [];
      id = channels[channel].length || 0;
      channels[channel].push(ws);
      ws.send(JSON.stringify({type: 'joined-channel', channel}));
    } else {
      // forward the message to other channel memebers
      channels[channel]?.filter((_, i) => i !== id).forEach((member) => {
        member.send(message.toString());
      });
    }
  });
  
  ws.on('close', () => {
    console.log('Client has disconnected!');
    if (channel !== "") {
      channels[channel] = channels[channel].filter((_, i) => i !== id);
    }
  });
}