import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  retry: {
    restartOnFailure: (e: Error): Promise<boolean> => {
      console.log("\n[Err handling]");
      console.error(e);

      return Promise.resolve(false);
    },
  },
});

export const producer = kafka.producer({
  allowAutoTopicCreation: true,
});
