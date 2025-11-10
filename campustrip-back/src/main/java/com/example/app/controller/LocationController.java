package com.example.app.controller;

import com.example.app.dto.LocationMessage;
import com.example.app.service.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class LocationController {

    private final KafkaProducerService kafkaProducerService;

    @MessageMapping("/location/{groupId}")
    public void sendLocationToGroup(
            @DestinationVariable String groupId, LocationMessage location) {
        location.setGroupId(groupId);
        location.setTimestamp(System.currentTimeMillis());

        // 그룹별 토픽으로 발행
        kafkaProducerService.sendLocation("location-" + groupId, location);
    }
}