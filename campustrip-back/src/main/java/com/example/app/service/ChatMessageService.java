package com.example.app.service;

import com.example.app.domain.ChatMessage;
import com.example.app.dto.ChatMessageDTO;
import com.example.app.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;

    @Autowired
    public ChatMessageService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public ChatMessage saveMessage(ChatMessageDTO chatMessage) {
        ChatMessage chatMessageEntity = new ChatMessage();
        chatMessageEntity.setChatId(chatMessage.getRoomId());
        chatMessageEntity.setSenderId(chatMessage.getMembershipId());
        chatMessageEntity.setSenderName(chatMessage.getUserName());
        chatMessageEntity.setContent(chatMessage.getMessage());
        chatMessageEntity.setTimestamp(chatMessage.getTimestamp());
        return chatMessageRepository.save(chatMessageEntity);
    }
}
