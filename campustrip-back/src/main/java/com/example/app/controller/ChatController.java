package com.example.app.controller;


import com.example.app.domain.User;
import com.example.app.dto.ChatDTO;
import com.example.app.dto.ChatMessageDTO;
import com.example.app.dto.PushNotificationRequest;
import com.example.app.enumtype.PushNotificationType;
import com.example.app.service.ChatMessageService;
import com.example.app.service.ChatService;
import com.example.app.service.FCMService;
import com.example.app.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@Slf4j
public class ChatController {
    private final ChatService chatService;
    private final ChatMessageService chatMessageService;
    private final FCMService fcmService;
    private final UserService userService;

    @Autowired
    public ChatController(ChatService chatService, ChatMessageService chatMessageService, FCMService fcmService, UserService userService) {
        this.chatService = chatService;
        this.chatMessageService = chatMessageService;
        this.fcmService = fcmService;
        this.userService = userService;
    }

    // 채팅 메시지 전송
    @MessageMapping("/chat/message")  // 클라이언트가 /pub/chat/message로 전송
    public void sendMessage(ChatMessageDTO message) {
        chatMessageService.sendMessage(message);
        User user = userService.getUserByName(message.getUserName());
        if (user == null) {
            log.error("사용자 정보를 찾을 수 없습니다: {}", message.getUserName());
            return;
        }
        Integer userId = user.getId();
        // 상대방에게 푸시 알림 전송
        chatService.getMembersByRoomId(message.getRoomId()).stream().forEach(m -> {
            try{
                if (m.getUserId().equals(userId)) return; // 본인 제외
                log.info("푸시 알림 전송 대상자 ID: {}", m.getUserId());
                fcmService.sendNotificationToUser(new PushNotificationRequest(
                        m.getUserId(),
                        message.getMembershipId(),
                        PushNotificationType.CHAT_MESSAGE,
                        m.getChatId(),
                        m.getChatTitle(),
                        message.getUserName() + ": " + message.getMessage()
                ));
            } catch (Exception e){
                log.error("푸시 알림 전송 실패: {}", e.getMessage());
            }
        });
    }

    // 채팅방 목록 조회
    @GetMapping("/chat/{id}")
    public List<ChatDTO> getMyChatRoom(@PathVariable Integer id) {
        return chatService.getMyChatRoom(id).stream().map(chat -> {
            ChatDTO chatDTO = new ChatDTO();
            chatDTO.setId(chat.getId());
            chatDTO.setTitle(chat.getTitle());
            chatDTO.setCreatedAt(chat.getCreatedAt());

            // 마지막 메시지와 시간 설정
            ChatMessageDTO lastMessage = chatMessageService.getLastMessage(chat.getId());
            if (lastMessage != null) {
                chatDTO.setLastMessageType(lastMessage.getMessageType());
                chatDTO.setSenderName(lastMessage.getUserName());
                chatDTO.setLastMessage(lastMessage.getMessage());
                chatDTO.setLastMessageTime(lastMessage.getTimestamp());
            }

            return chatDTO;
        }).toList();
    }

    // 채팅방 메시지 조회
    @GetMapping("/chat/{chatId}/messages")
    public List<ChatMessageDTO> getChatMessages(@PathVariable Integer chatId) {
        return chatMessageService.getChatHistory(chatId);
    }
}
