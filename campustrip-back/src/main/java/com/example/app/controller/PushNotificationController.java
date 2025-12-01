package com.example.app.controller;

import com.example.app.dto.PushResponseDTO;
import com.example.app.service.PushNotificationService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class PushNotificationController {
    private final PushNotificationService pushNotificationService;

    @Autowired
    public PushNotificationController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    @GetMapping("/user/{receiverId}")
    public List<PushResponseDTO> getUserNotifications(@PathVariable Integer receiverId) {
        return pushNotificationService.getNotificationsForUser(receiverId);
    }

    @DeleteMapping("/{notificationId}")
    public void deleteNotification(@PathVariable String notificationId) {
        pushNotificationService.deleteNotification(notificationId);
    }
}
