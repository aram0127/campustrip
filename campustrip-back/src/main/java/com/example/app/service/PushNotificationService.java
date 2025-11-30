package com.example.app.service;

import com.example.app.domain.PushNotification;
import com.example.app.dto.PushResponseDTO;
import com.example.app.repository.PushNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Comparator;

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
                // 최신순 정렬 (createdAt 내림차순)
                .sorted(Comparator.comparing(PushNotification::getCreatedAt).reversed())
                // 엔티티의 toDTO() 사용
                .map(PushNotification::toDTO)
                .toList();
    }
}
