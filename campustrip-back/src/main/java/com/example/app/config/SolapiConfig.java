package com.example.app.config;

import com.solapi.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SolapiConfig {

    @Value("${solapi.api.key:PLACEHOLDER_KEY}")
    private String apiKey;

    @Value("${solapi.api.secret:PLACEHOLDER_SECRET}")
    private String apiSecret;

    @Bean
    public DefaultMessageService messageService() {
        // API Key와 Secret Key로 Solapi 서비스를 초기화합니다.
        // application.properties에 solapi.api.key와 solapi.api.secret을 설정해야 합니다.
        return new DefaultMessageService(apiKey, apiSecret, "https://api.solapi.com");
    }
}
