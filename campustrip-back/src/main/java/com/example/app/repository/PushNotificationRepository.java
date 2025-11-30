package com.example.app.repository;

import com.example.app.domain.PushNotification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PushNotificationRepository extends MongoRepository<PushNotification, String> {
    List<PushNotification> findByReceiverId(Integer receiverId);
}
