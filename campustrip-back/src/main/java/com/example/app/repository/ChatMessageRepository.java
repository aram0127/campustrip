package com.example.app.repository;

import com.example.app.domain.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, Integer> {
    // 필요시 사용자 정의 쿼리 메서드 추가 가능 (예: 보낸사람으로 찾기)
    List<ChatMessage> findBySenderId(Integer senderId);
    List<ChatMessage> findByChatIdOrderByTimestampAsc(Integer chatId);

    ChatMessage findTopByChatIdOrderByTimestampDesc(Integer chatId);
}
