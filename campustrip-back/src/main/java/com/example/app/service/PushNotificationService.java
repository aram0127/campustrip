package com.example.app.service;

import com.example.app.domain.PushNotification;
import com.example.app.dto.PushResponseDTO;
import com.example.app.repository.PushNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PushNotificationService {
    private final PushNotificationRepository pushNotificationRepository;

    @Autowired
    public PushNotificationService(PushNotificationRepository pushNotificationRepository) {
        this.pushNotificationRepository = pushNotificationRepository;
    }

    public List<PushResponseDTO> getNotificationsForUser(Integer receiverId) {
        return pushNotificationRepository.findByReceiverId(receiverId)
                .stream()
                .map(notification -> new PushResponseDTO(
                        notification.getReceiverId(),
                        notification.getSenderId(),
                        notification.getType(),
                        notification.getReferenceId(),
                        notification.getTitle(),
                        notification.getBody(),
                        notification.getCreatedAt()
                ))
                .toList();
    }
}
