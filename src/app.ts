import http from 'http';
import mqtt from 'mqtt';
import Action from './data/Action';
import {Server, Socket} from 'socket.io';
import {Blob} from './data/types';

/* Influx DB
import {InfluxDB, Point} from '@influxdata/influxdb-client';
const url = 'http://localhost:8086';
const token = '6t7n72CIA-esiVc9aVESpRNc1nszwHT-mEf2UHQm_ZQUxoa1O-l3IIAgxMgV6jcARsNvGvXBYpbvQDk4di-bBg==';
const influxDB = new InfluxDB({url, token})
const org = 'univaq';
const bucket = 'jjodel';
const writeApi = influxDB.getWriteApi(org, bucket);

const point = new Point('my-test')
    .tag('tag_key', 'tag_value')
    .floatField('field_key', 123.456)
    .timestamp(new Date());

writeApi.writePoint(point);
writeApi.close().then(() => console.log('Finished'));
*/

/* Web Socket */
const PORT = 5003;
const server = http.createServer();
const io = new Server(server, {
    cors: {origin: 'http://localhost:3000'},
    path: '/iot'
});
server.listen(PORT);
console.log(`Server Listening on port ${PORT}.`);
// const IDs: string[] = [];


io.on('connection', async(socket: Socket) => {
    const projectID = socket.handshake.query.project as string;
    const brokerUrl = socket.handshake.query.brokerUrl as string;

    await socket.join(projectID);
    // socket.to(projectID).emit('logger', 'Connect (Middleware)');
    console.log(`New User Connected: ${projectID} -> ${brokerUrl}`);

    /*
    const ID = `${projectID}-${brokerUrl}`;
    if(IDs.includes(ID)) {
        socket.to(projectID).emit('logger', 'Connect (Broker)');
        error on disconnection (publish don't work)
        return;
    }
    IDs.push(ID);
    */

    /* MQTT Broker */
    const broker = mqtt.connect(brokerUrl);

    broker.on('connect', () => {
        console.log('Connection to Broker Done');
        // socket.to(projectID).emit('logger', 'Connect (Broker)');
        broker.subscribe('#');
    });
    broker.on('end', () => {
        // socket.to(projectID).emit('logger', 'End (Broker)');
        console.log('Disconnection to Broker Done');
    });
    broker.on('error', (error) => {
        // socket.to(projectID).emit('logger', 'Error (Broker)');
        broker.end();
        console.error('Broker error:', error);
    });

    broker.on('message', (topic, message) => {
        try {
            const value = JSON.parse(message.toString());
            const action = Action.SET_ROOT_FIELD(`topics.${topic}`, '=', value, false);
            socket.to(projectID).emit('pull-action', action);
            console.log(`Sending ${action.id}`);
        } catch (e) {
            console.log(topic, e);
        }
    });

    socket.on('push-action', async(blob: Blob) => {
        console.log('Action pushed', blob);
        broker.publish(blob.topic, blob.value);
        const action = Action.SET_ROOT_FIELD(`topics.${blob.topic}`, '=', blob.value, false);
        socket.to(projectID).emit('pull-action', action);
    });

    socket.on('disconnect', async () => {
        socket.to(projectID).emit('logger', 'Disconnect (Middleware)');
        await socket.leave(projectID);
        console.log(`${socket.id} Disconnection`);
    });

});

