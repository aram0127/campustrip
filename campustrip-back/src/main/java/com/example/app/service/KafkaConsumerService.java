package com.example.app.service;

import com.example.app.dto.ChatMessageDTO;
import com.example.app.dto.LocationMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    // Kafka에서 메시지를 수신하여 WebSocket 구독자들에게 전송
    @KafkaListener(
            topicPattern = "chat-room-.*",  // 모든 채팅방 토픽 구독
            groupId = "chat-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeMessage(ChatMessageDTO message) {
        log.info("Kafka 메시지 수신: {}", message.getMessage());

        // WebSocket으로 해당 채팅방 구독자들에게 브로드캐스트
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + message.getRoomId(),
                message
        );
    }

    @KafkaListener(topicPattern = "location-*", groupId = "campustrip-group")
    public void consumeLocation(LocationMessage locationMessage) {
        try {
            String groupId = locationMessage.getGroupId();
            System.out.println("Kafka 위치 메시지 수신: " + locationMessage);
            // 해당 그룹을 구독한 클라이언트들에게 전송
            messagingTemplate.convertAndSend(
                    "/topic/location/" + groupId,
                    locationMessage
            );
        } catch (Exception e) {
            // 에러 처리
        }
    }
}
