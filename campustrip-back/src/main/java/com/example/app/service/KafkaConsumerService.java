package com.example.app.service;

import com.example.app.dto.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerService {

    private final SimpMessagingTemplate messagingTemplate;

    // Kafka에서 메시지를 수신하여 WebSocket 구독자들에게 전송
    @KafkaListener(
            topicPattern = "chat-room-.*",  // 모든 채팅방 토픽 구독
            groupId = "chat-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeMessage(ChatMessageDTO message) {
        log.info("Kafka 메시지 수신: {}", message);

        // WebSocket으로 해당 채팅방 구독자들에게 브로드캐스트
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + message.getRoomId(),
                message
        );
    }
}
