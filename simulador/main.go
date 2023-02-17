package main

import (
	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/joho/godotenv"
	kafka2 "github.com/nuclearigor/coordinates-simulator/application/kafka"
	"github.com/nuclearigor/coordinates-simulator/infra/kafka"
	"log"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("error loading env")
	}
}

func main() {
	msgChan := make(chan *ckafka.Message)
	consumer := kafka.NewKafkaConsumer(msgChan)

	go consumer.Consume()

	for msg := range msgChan {
		//fmt.Println(string(msg.Value))
		go kafka2.Produce(msg)
	}
}
