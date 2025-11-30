package com.example.app.service;

import com.example.app.dto.VerificationInfo;
import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SmsService {

    private final DefaultMessageService messageService;
    // 전화번호 -> 인증정보(코드, 만료시간) 매핑
    private final Map<String, VerificationInfo> verificationCodes = new ConcurrentHashMap<>();

    public SmsService(@Value("${solapi.api.key}") String apiKey,
            @Value("${solapi.api.secret}") String apiSecret,
            @Value("${solapi.api.number}") String from) {
        this.messageService = SolapiClient.INSTANCE.createInstance(apiKey, apiSecret);
    }

    public void sendVerificationCode(String phoneNumber) {
        // 1. 인증번호 생성 (6자리)
        String code = generateVerificationCode();

        // 2. 저장 (메모리) - 유효기간 3분 설정
        verificationCodes.put(phoneNumber, new VerificationInfo(code, LocalDateTime.now().plusMinutes(3)));

        // 3. SMS 발송
        Message message = new Message();
        message.setFrom(from); // 발신번호 (실제 등록된 번호여야 함)
        message.setTo(phoneNumber);
        message.setText("[CampusTrip] 인증번호는 [" + code + "] 입니다. 3분 안에 입력해주세요.");

        try {
            messageService.send(message);
        } catch (Exception e) {
            throw new RuntimeException("SMS 발송 실패", e);
        }
    }

    public boolean verifyCode(String phoneNumber, String code) {
        VerificationInfo info = verificationCodes.get(phoneNumber);

        // 1. 정보가 없거나
        if (info == null) {
            return false;
        }

        // 2. 코드가 일치하지 않거나
        if (!info.getCode().equals(code)) {
            return false;
        }

        // 3. 만료되었으면 실패
        if (info.isExpired()) {
            verificationCodes.remove(phoneNumber); // 만료된 정보 삭제
            return false;
        }

        // 인증 성공 시 정보 삭제 (재사용 방지)
        verificationCodes.remove(phoneNumber);
        return true;
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int number = random.nextInt(999999);
        return String.format("%06d", number);
    }
}
