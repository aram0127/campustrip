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
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendLocation(String topic, LocationMessage location) {
        try {
            String message = objectMapper.writeValueAsString(location);
            kafkaTemplate.send(topic, message);
        } catch (JsonProcessingException e) {
            // 에러 처리
        }
    }
}