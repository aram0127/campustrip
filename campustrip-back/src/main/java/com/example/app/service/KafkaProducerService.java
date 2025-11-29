package com.example.app.service;

import com.example.app.dto.LocationMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, LocationMessage> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final KafkaAdmin kafkaAdmin;

    public KafkaProducerService(
            @Qualifier("locationKafkaTemplate") KafkaTemplate<String, LocationMessage> kafkaTemplate,
            ObjectMapper objectMapper,
            KafkaAdmin kafkaAdmin) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.kafkaAdmin = kafkaAdmin;
    }

    public void sendLocation(String topic, LocationMessage location) {
        try {
            // 토픽 존재 확인 (필요시 생성)
            createTopicIfNotExists(topic);

            log.info("Kafka 위치 메시지 전송: {}, topic: {}",
                    objectMapper.writeValueAsString(location), topic);

            kafkaTemplate.send(topic, location)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("메시지 전송 실패: topic={}", topic, ex);
                    } else {
                        log.info("메시지 전송 성공: topic={}, partition={}, offset={}",
                                topic,
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());
                    }
                });
        } catch (Exception e) {
            log.error("위치 메시지 전송 중 오류", e);
        }
    }

    private void createTopicIfNotExists(String topicName) {
        AdminClient adminClient = null;
        try {
            adminClient = AdminClient.create(kafkaAdmin.getConfigurationProperties());

            ListTopicsResult topics = adminClient.listTopics();
            Set<String> topicNames = topics.names().get(30, TimeUnit.SECONDS);

            if (!topicNames.contains(topicName)) {
                NewTopic newTopic = new NewTopic(topicName, 1, (short) 1);
                adminClient.createTopics(Collections.singleton(newTopic)).all().get(30, TimeUnit.SECONDS);
                log.info("✅ 토픽 생성 완료: {}", topicName);

                // 토픽 메타데이터 갱신 대기 (중요!)
                Thread.sleep(2000);

                // 토픽 생성 확인
                Set<String> updatedTopics = adminClient.listTopics().names().get(10, TimeUnit.SECONDS);
                if (updatedTopics.contains(topicName)) {
                    log.info("✅ 토픽 메타데이터 갱신 확인: {}", topicName);
                } else {
                    log.warn("⚠️ 토픽이 생성되었으나 메타데이터에서 확인되지 않음: {}", topicName);
                }
            } else {
                log.debug("토픽 이미 존재: {}", topicName);
            }
        } catch (Exception e) {
            log.error("❌ 토픽 생성/확인 실패: {}", topicName, e);
            throw new RuntimeException("토픽 생성 실패: " + topicName, e);
        } finally {
            if (adminClient != null) {
                adminClient.close();
            }
        }
    }
}


