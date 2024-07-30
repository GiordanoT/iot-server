import http from 'http';
import mqtt from 'mqtt';
import Action from './data/Action';
import {Server, Socket} from 'socket.io';

/* Web Socket */
const PORT = 5003;
const server = http.createServer();
const io = new Server(server, {
    cors: {origin: 'http://localhost:3000'},
    path: '/iot'
});
server.listen(PORT);
console.log(`Server Listening on port ${PORT}.`);
const IDs: string[] = [];


io.on('connection', async(socket: Socket) => {
    const projectID = socket.handshake.query.project as string;
    const brokerUrl = socket.handshake.query.brokerUrl as string;

    await socket.join(projectID);
    // Send connection to middleware OK
    console.log(`New User Connected to Project: ${projectID}`);

    const ID = `${projectID}-${brokerUrl}`;
    if(IDs.includes(ID)) return;
    IDs.push(ID);

    /* MQTT Broker */
    const broker = mqtt.connect(brokerUrl);

    broker.on('connect', () => {
        console.log('Connection to Broker Done');
        // send connection to broker OK
        broker.subscribe('#');
    });
    broker.on('end', () => {
        // send disconnection to Broker OK
        console.log('Disconnection to Broker Done');
    });
    broker.on('error', (error) => {
        // Send error with Broker
        console.error('Broker error:', error);
    });

    broker.on('message', (topic, message) => {
        try {
            const value = JSON.parse(message.toString());
            const action = Action.SET_ROOT_FIELD(`topics.${topic}`, '+=', value, false);
            socket.to(projectID).emit('pull-action', action);
            console.log(`Sending ${action.id}`);
        } catch (e) {
            console.log(topic, e);
        }
    });

    socket.on('disconnect', async () => {
        await socket.leave(projectID);
        // Send disconnection to middleware OK
        console.log(`${socket.id} Disconnection`);
    });

});

