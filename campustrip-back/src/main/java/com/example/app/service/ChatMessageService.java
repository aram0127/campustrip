package com.example.app.service;

import com.example.app.domain.Chat;
import com.example.app.domain.ChatMessage;
import com.example.app.domain.Post;
import com.example.app.domain.User;
import com.example.app.dto.ChatMessageDTO;
import com.example.app.dto.MessageType;
import com.example.app.repository.ChatMessageRepository;
import com.example.app.repository.PostRepository;
import com.example.app.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.ZoneId;
import java.util.List;

@Service
@Slf4j
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final KafkaTemplate<String, ChatMessageDTO> kafkaTemplate;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    @Autowired
    public ChatMessageService(ChatMessageRepository chatMessageRepository, KafkaTemplate<String, ChatMessageDTO> kafkaTemplate, PostRepository postRepository, UserRepository userRepository, S3Service s3Service) {
        this.chatMessageRepository = chatMessageRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.s3Service = s3Service;
    }

    public void sendMessage(ChatMessageDTO message) {
        // 타임스탬프 kst로 변환해서 설정
        message.setTimestamp(java.time.LocalDateTime.now().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime());
        // ❌ 기존: SimpMessagingTemplate으로 직접 전송
        // messagingTemplate.convertAndSend("/sub/chat/room/" + roomId, message);
        log.info("Kafka로 메시지 발행: roomId={}, message={}", message.getRoomId(), message.getMessage());
        // ✅ 변경: Kafka Topic으로 발행
        String topic = "chat-room-" + message.getRoomId();
        ChatMessageDTO savedMessage = saveMessage(message);
        kafkaTemplate.send(topic, savedMessage);
        log.info("메시지 발행 완료: topic={}, message={}", topic, savedMessage.getMessage());
    }

    public void sendJoinMessage(Chat chat, Integer membershipId) {
        User user = userRepository.findById(membershipId).orElseThrow();
        ChatMessageDTO joinMessage = new ChatMessageDTO(
                MessageType.JOIN,
                chat.getId(),
                user.getId(),
                user.getName(),
                user.getName() + "님이 채팅방에 입장했습니다.",
                java.time.LocalDateTime.now().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime()
        );
        log.info("Kafka로 입장 메시지 발행: roomId={}, message={}", joinMessage.getRoomId(), joinMessage.getMessage());
        String topic = "chat-room-" + joinMessage.getRoomId();
        ChatMessageDTO savedMessage = saveMessage(joinMessage);
        kafkaTemplate.send(topic, savedMessage);
        log.info("입장 메시지 발행 완료: topic={}, message={}", topic, savedMessage.getMessage());
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
        ChatMessageDTO savedMessage = saveMessage(leaveMessage);
        kafkaTemplate.send(topic, savedMessage);
        log.info("퇴장 메시지 발행 완료: topic={}, message={}", topic, savedMessage.getMessage());
    }

    public ChatMessageDTO saveMessage(ChatMessageDTO chatMessage) {
        ChatMessage chatMessageEntity = new ChatMessage();
        chatMessageEntity.setMessageType(chatMessage.getMessageType());
        chatMessageEntity.setChatId(chatMessage.getRoomId());
        chatMessageEntity.setSenderId(chatMessage.getMembershipId());
        chatMessageEntity.setSenderName(chatMessage.getUserName());
        chatMessageEntity.setTimestamp(chatMessage.getTimestamp());
        if(chatMessage.getMessageType() == MessageType.IMAGE) {
            try {
                String url = s3Service.uploadFile(chatMessage.getImage());
                chatMessageEntity.setImageUrl(url);
            } catch (IOException e) {
                log.error("이미지 업로드 실패", e);
                throw new RuntimeException("이미지 업로드 실패", e);
            }
        }else {
            chatMessageEntity.setContent(chatMessage.getMessage());
        }
        ChatMessage savedMsg = chatMessageRepository.save(chatMessageEntity);
        return new ChatMessageDTO(
                savedMsg.getMessageType(),
                savedMsg.getChatId(),
                savedMsg.getSenderId(),
                savedMsg.getSenderName(),
                savedMsg.getContent(),
                savedMsg.getImageUrl(),
                savedMsg.getTimestamp()
        );
    }

    public List<ChatMessageDTO> getChatHistory(Integer id) {
        return chatMessageRepository.findByChatIdOrderByTimestampAsc(id).stream().map(msg -> new ChatMessageDTO(
                msg.getMessageType(),
                msg.getChatId(),
                msg.getSenderId(),
                msg.getSenderName(),
                msg.getContent(),
                msg.getTimestamp()
        )).toList();
    }
}
