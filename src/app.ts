import http from 'http';
import mqtt from 'mqtt';
import Action from './data/Action';
import {Server, Socket} from 'socket.io';

/* MQTT Broker */
const brokerUrl = 'mqtt://localhost:1883';
const broker = mqtt.connect(brokerUrl);

broker.on('connect', () => {
    console.log('Connection to Broker Done');
    broker.subscribe('#');
});
broker.on('end', () => {
    console.log('Disconnection to Broker Done');
});
broker.on('error', (error) => {
    console.error('Broker error:', error);
});

/* Web Socket */
const PORT = 5003;
const server = http.createServer();
const io = new Server(server, {
    cors: {origin: 'http://localhost:3000'},
    path: '/iot'
});
server.listen(PORT);
console.log(`Server Listening on port ${PORT}.`);


io.on('connection', async(socket: Socket) => {
    const projectID = socket.handshake.query.project as string;
    socket.join(projectID);
    console.log(`New User Connected to Project: ${projectID}`);
    broker.on('message', (topic, message) => {
        try {
            const value = JSON.parse(message.toString());
            const action = Action.SET_ROOT_FIELD(`topics.${topic}`, '+=', value, false);
            socket.broadcast.to(projectID).emit('pull-action', action);
            console.log(action);
        } catch (e) {
            console.log(topic, e)
        }
    });

    socket.on('disconnect', () => {
        socket.leave(projectID);
        console.log(`${socket.id} Disconnection`);
    });

});

