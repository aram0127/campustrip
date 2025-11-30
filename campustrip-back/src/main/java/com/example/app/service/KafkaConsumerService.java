package com.example.app.service;

import com.example.app.dto.ChatMessageDTO;
import com.example.app.dto.LocationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory",
            autoStartup = "true"
    )
    public void consumeMessage(ChatMessageDTO message) {
        try{
            log.info("Kafka 메시지 수신: {}", message.getMessage());

            // WebSocket으로 해당 채팅방 구독자들에게 브로드캐스트
            messagingTemplate.convertAndSend(
                    "/topic/chat/room/" + message.getRoomId(),
                    message
            );
            log.info("WebSocket으로 메시지 전송 완료: /topic/chat/room/{}", message.getRoomId());

        } catch (Exception e) {
            log.error("메시지 처리 중 오류 발생", e);
        }
    }

    @KafkaListener(topicPattern = "location-.*", groupId = "${LOCATION_GROUP_ID:campustrip-group}", containerFactory = "locationKafkaListenerContainerFactory")
    public void consumeLocation(LocationMessage locationMessage) {
        try {
            String groupId = locationMessage.getGroupId();
            log.info("✅ 위치 정보 수신: groupId={}, userId={}, location=({}, {})",
                    groupId, locationMessage.getUserId(),
                    locationMessage.getLatitude(), locationMessage.getLongitude());

            String destination = "/topic/location/" + groupId;

            // 해당 그룹을 구독한 클라이언트들에게 전송
            messagingTemplate.convertAndSend(destination, locationMessage);

            log.info("✅ WebSocket 전송 완료: {}", destination);
        } catch (Exception e) {
            log.error("❌ 위치 정보 처리 중 오류 발생", e);
        }
    }
}
