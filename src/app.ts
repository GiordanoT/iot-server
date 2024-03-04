import mqtt from 'mqtt';

const brokerUrl = 'mqtt://localhost:1883';
const client = mqtt.connect(brokerUrl);


client.on('connect', () => {
    console.log('Connection Done');
    client.subscribe('sensors/#');
    client.publish('sensors/1', 'Hello I am 1');
    client.publish('sensors/2', 'Hello I am 2');
    client.end();
});

client.on('end', () => {
    console.log('Disconnection Done');
});

client.on('error', (error) => {
    console.error('MQTT client error:', error);
});

client.on('message', (topic, message) => {
    console.log(`Received message on topic "${topic}": ${message.toString()}`);
});
