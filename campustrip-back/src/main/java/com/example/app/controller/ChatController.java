package com.example.app.controller;


import com.example.app.dto.ChatMessage;
import com.example.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chats")
public class ChatController {
    ChatService chatService;
    private final KafkaTemplate<String, ChatMessage> kafkaTemplate;

    @Autowired
    public ChatController(ChatService chatService, KafkaTemplate<String, ChatMessage> kafkaTemplate) {
        this.chatService = chatService;
        this.kafkaTemplate = kafkaTemplate;
    }

    @MessageMapping("/chat/message")  // 클라이언트가 /pub/chat/message로 전송
    public void sendMessage(ChatMessage message) {
        System.out.println("메시지 수신: {}" + message);

        // ❌ 기존: SimpMessagingTemplate으로 직접 전송
        // messagingTemplate.convertAndSend("/sub/chat/room/" + roomId, message);

        // ✅ 변경: Kafka Topic으로 발행
        String topic = "chat-room-" + message.getRoomId();
        kafkaTemplate.send(topic, message);

        // MongoDB에 채팅 내역 저장 (선택사항)
        // chatRepository.save(message);
    }

}
