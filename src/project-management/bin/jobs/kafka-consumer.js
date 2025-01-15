const { Kafka } = require("kafkajs");
const constants = require("@config/constants");
const log4js = require("log4js");
const logger = log4js.getLogger(
  `${constants.ENVIRONMENT} -- bin/jobs/kafka-consumer script`
);

const { logObject } = require("@utils/shared");

const { stringify } = require("@utils/common");

const placeHolderFunction = async (messageData) => {
  try {
  } catch (error) {
    logger.error(
      `🐛🐛 KAFKA: Internal Server Error -- placeHolderFunction() -- ${stringify(
        error
      )}`
    );
  }
};

const kafkaConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: constants.KAFKA_CLIENT_ID,
      brokers: constants.KAFKA_BOOTSTRAP_SERVERS,
      fetchMaxWaitMs: 500,
      fetchMinBytes: 16384,
    });

    const consumer = kafka.consumer({
      groupId: constants.UNIQUE_CONSUMER_GROUP,
    });

    // Define topic-to-operation function mapping
    const topicOperations = {
      ["place-holder-topic"]: placeHolderFunction,
    };

    await consumer.connect();

    // First, subscribe to all topics
    await Promise.all(
      Object.keys(topicOperations).map((topic) =>
        consumer.subscribe({ topic, fromBeginning: true })
      )
    );

    // Then, start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const operation = topicOperations[topic];
          if (operation) {
            const messageData = message.value.toString();
            await operation(messageData);
          } else {
            logger.error(`🐛🐛 No operation defined for topic: ${topic}`);
          }
        } catch (error) {
          logger.error(
            `🐛🐛 Error processing Kafka message for topic ${topic}: ${stringify(
              error
            )}`
          );
        }
      },
    });
  } catch (error) {
    logObject("📶📶 Error connecting to Kafka", error);
    logger.error(`📶📶 Error connecting to Kafka: ${stringify(error)}`);
  }
};

module.exports = kafkaConsumer;
