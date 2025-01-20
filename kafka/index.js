import { Kafka } from "kafkajs";
import { configDotenv } from "dotenv";
configDotenv();

class KafkaService {
    static instance;

    constructor() {
        if (KafkaService.instance) {
            return KafkaService.instance;
        }

        console.log(process.env.KAFKA_BROKER);

        this.kafka = new Kafka({
            brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
        });
        this.producer = null;
        this.consumer = null;

        KafkaService.instance = this;
    }

    async createProducer() {
        if (this.producer) return this.producer;

        this.producer = this.kafka.producer();
        await this.producer.connect();
        return this.producer;
    }

    async createConsumer() {
        this.consumer = this.kafka.consumer({ groupId: "default" });
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: "order-requests", fromBeginning: true });
        return this.consumer;
    }


    async shutdown() {
        if (this.producer) {
            await this.producer.disconnect();
        }

        if (this.consumer) {
            await this.consumer.disconnect();
        }
    }
}

const kafkaService = new KafkaService();
export default kafkaService;