package com.example.app.controller;


import com.example.app.dto.ChatDTO;
import com.example.app.dto.ChatMessageDTO;
import com.example.app.service.ChatMessageService;
import com.example.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {
    ChatService chatService;
    private final KafkaTemplate<String, ChatMessageDTO> kafkaTemplate;
    private final ChatMessageService chatMessageService;

    @Autowired
    public ChatController(ChatService chatService, ChatMessageService chatMessageService, KafkaTemplate<String, ChatMessageDTO> kafkaTemplate) {
        this.chatService = chatService;
        this.kafkaTemplate = kafkaTemplate;
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/chat/message")  // 클라이언트가 /pub/chat/message로 전송
    public void sendMessage(ChatMessageDTO message) {
        message.setTimestamp(java.time.LocalDateTime.now());
        // ❌ 기존: SimpMessagingTemplate으로 직접 전송
        // messagingTemplate.convertAndSend("/sub/chat/room/" + roomId, message);

        // ✅ 변경: Kafka Topic으로 발행
        String topic = "chat-room-" + message.getRoomId();
        kafkaTemplate.send(topic, message);

        // MongoDB에 채팅 내역 저장 (선택사항)
        chatMessageService.saveMessage(message);
    }

    @GetMapping("/chat/{id}")
    public List<ChatDTO> getMyChatRoom(@PathVariable Integer id) {
        return chatService.getMyChatRoom(id).stream().map(chat -> new ChatDTO(
                chat.getId(),
                chat.getTitle(),
                chat.getCreatedAt()
        )).toList();
    }

    @GetMapping("/chat/{chatId}/messages")
    public List<ChatMessageDTO> getChatMessages(@PathVariable Integer chatId) {
        return chatMessageService.getChatHistory(chatId);
    }
}
