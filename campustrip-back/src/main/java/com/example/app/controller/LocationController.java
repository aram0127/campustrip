package com.example.app.controller;

import com.example.app.dto.LocationMessage;
import com.example.app.service.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class LocationController {

    private final KafkaProducerService kafkaProducerService;

    @MessageMapping("/location/{groupId}")
    public void sendLocationToGroup(
            @DestinationVariable String groupId, LocationMessage location) {
        location.setGroupId(groupId);
        location.setTimestamp(System.currentTimeMillis());

        log.info("📍 위치 메시지 수신: groupId={}, userId={}, lat={}, lng={}",
                groupId, location.getUserId(),
                location.getLatitude(), location.getLongitude());

        // 그룹별 토픽으로 발행
        kafkaProducerService.sendLocation("location-" + groupId, location);
    }
}