const amqp = require('amqplib');
const {RABBITMQ_SERVICE_URL} = require('../../configs/server-config');

class Producer {
    static #channel = null;
    static #connection = null;

    constructor() {
    }

    async #connect(retryCount = 0) {
        if (Producer.#connection) {
            return Producer.#connection;
        }
        try {
            Producer.#connection = await amqp.connect(RABBITMQ_SERVICE_URL);
            console.log('RabbitMQ connected');
            Producer.#connection.on('error', () => {
                console.log('RabbitMQ connection error');

            });
            Producer.#connection.on('close', () => {
                console.log('RabbitMQ connection closed');

            });
            return Producer.#connection;
        } catch (error) {
            console.log('RabbitMQ connection error: ', error);
            retryCount++;
            if (retryCount < 5) {
                return await this.#connect(retryCount);
            } else {
                console.log('RabbitMQ connection failed');
                return null;
            }
        }
    }

    async #createChannel() {
        if (Producer.#channel) {
            return Producer.#channel;
        }
        try {
            const connection = await this.#connect();
            if (connection) {
                Producer.#channel = await connection.createChannel();
                console.log('RabbitMQ channel created');
                return Producer.#channel;
            }
        } catch (error) {
            console.log('Error creating RabbitMQ channel: ', error);
            return null;
        }
    }

    async sendToQueue(queueName, {email, type, data = null}) {
        try {
            const channel = await this.#createChannel();
            if (channel) {
                await channel.assertQueue(queueName, {durable: true});
                await channel.sendToQueue(queueName, Buffer.from(JSON.stringify({
                    email,
                    type,
                    data
                })), {persistent: true});
                console.log('Message sent to RabbitMQ');
            }
        } catch (error) {
            console.log('Error sending message to RabbitMQ: ', error);

        }
    }

    async closeConnection() {
        try {
            if (Producer.#channel) {
                await Producer.#channel.close();
                Producer.#channel = null;
                console.log('RabbitMQ channel closed');
            }
            if (Producer.#connection) {
                await Producer.#connection.close();
                Producer.#connection = null;
                console.log('RabbitMQ connection closed');
            }
        } catch (error) {
            console.log('Error closing RabbitMQ connection: ', error);
        }
    }
}

const gracefulShutdown = async () => {
    console.log('Gracefully shutting down');
    const producer = new Producer();
    await producer.closeConnection();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('exit', gracefulShutdown);
module.exports = Producer;