package com.example.app.util;

import com.example.app.domain.ChatMessage;
import jakarta.annotation.PostConstruct;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

@Component
public class MongoIndexInitializer {

    private final MongoOperations mongoOperations;

    public MongoIndexInitializer(MongoOperations mongoOperations) {
        this.mongoOperations = mongoOperations;
    }

    @PostConstruct
    public void createChatIndexes() {
        var indexOps = mongoOperations.indexOps(ChatMessage.class);

        // 최신 API: createIndex 사용
        indexOps.createIndex(
                new Index()
                        .named("chatId_timestamp")
                        .on("chatId", Sort.Direction.ASC)
                        .on("timestamp", Sort.Direction.DESC)
        );

        indexOps.createIndex(
                new Index()
                        .named("senderId")
                        .on("senderId", Sort.Direction.ASC)
        );
    }
}