package com.example.app.controller;


import com.example.app.dto.ChatDTO;
import com.example.app.dto.ChatMessageDTO;
import com.example.app.service.ChatMessageService;
import com.example.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {
    ChatService chatService;
    private final ChatMessageService chatMessageService;

    @Autowired
    public ChatController(ChatService chatService, ChatMessageService chatMessageService) {
        this.chatService = chatService;
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/chat/message")  // 클라이언트가 /pub/chat/message로 전송
    public void sendMessage(ChatMessageDTO message) {
        chatMessageService.sendMessage(message);
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
