package com.example.app.service;

import com.example.app.dto.LocationMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    @Qualifier("locationKafkaTemplate")
    private final KafkaTemplate<String, LocationMessage> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendLocation(String topic, LocationMessage location) {
        try {
            kafkaTemplate.send(topic, location);
        } catch (Exception e) {
            // 에러 처리
        }
    }
}