package com.example.app.service;

import com.example.app.domain.ChatMessage;
import com.example.app.domain.Post;
import com.example.app.domain.User;
import com.example.app.dto.ChatMessageDTO;
import com.example.app.dto.MessageType;
import com.example.app.repository.ChatMessageRepository;
import com.example.app.repository.PostRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;

@Service
@Slf4j
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final KafkaTemplate<String, ChatMessageDTO> kafkaTemplate;
    private final PostRepository postRepository;

    @Autowired
    public ChatMessageService(ChatMessageRepository chatMessageRepository, KafkaTemplate<String, ChatMessageDTO> kafkaTemplate, PostRepository postRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.postRepository = postRepository;
    }

    public void sendMessage(ChatMessageDTO message) {
        // 타임스탬프 kst로 변환해서 설정
        message.setTimestamp(java.time.LocalDateTime.now().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime());
        // ❌ 기존: SimpMessagingTemplate으로 직접 전송
        // messagingTemplate.convertAndSend("/sub/chat/room/" + roomId, message);
        log.info("Kafka로 메시지 발행: roomId={}, message={}", message.getRoomId(), message.getMessage());
        // ✅ 변경: Kafka Topic으로 발행
        String topic = "chat-room-" + message.getRoomId();
        kafkaTemplate.send(topic, message);
        saveMessage(message);
    }

    public void sendLeaveMessage(Integer postId, User user) {
        Post post = postRepository.findById(postId).orElseThrow();
        ChatMessageDTO leaveMessage = new ChatMessageDTO(
                MessageType.LEAVE,
                post.getChat().getId(),
                user.getId(),
                user.getName(),
                user.getName() + "님이 채팅방을 나갔습니다.",
                java.time.LocalDateTime.now().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime()
        );
        log.info("Kafka로 퇴장 메시지 발행: roomId={}, message={}", leaveMessage.getRoomId(), leaveMessage.getMessage());
        String topic = "chat-room-" + leaveMessage.getRoomId();
        kafkaTemplate.send(topic, leaveMessage);
        saveMessage(leaveMessage);
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

    public List<ChatMessageDTO> getChatHistory(Integer id) {
        return chatMessageRepository.findByChatIdOrderByTimestampAsc(id).stream().map(msg -> new ChatMessageDTO(
                MessageType.CHAT,
                msg.getChatId(),
                msg.getSenderId(),
                msg.getSenderName(),
                msg.getContent(),
                msg.getTimestamp()
        )).toList();
    }
}
