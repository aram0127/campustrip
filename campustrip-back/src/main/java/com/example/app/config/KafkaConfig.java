package com.example.app.config;

import com.example.app.dto.ChatMessageDTO;
import com.example.app.dto.LocationMessage;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConfig {

    @Value("${kafka.bootstrap-servers}")
    private String bootstrapServers;


    // Producer 설정 (메시지 발행)
    @Bean
    public DefaultKafkaProducerFactory<String, ChatMessageDTO> chatProducerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                org.springframework.kafka.support.serializer.JsonSerializer.class);

        // 안정화 옵션
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
        config.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 120_000);
        config.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30_000);
        // 메타데이터 갱신 빈도(필요 시)
        config.put(ProducerConfig.METADATA_MAX_AGE_CONFIG, 5_000);

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, ChatMessageDTO> kafkaTemplate() {
        return new KafkaTemplate<>(chatProducerFactory());
    }

    // 위치 정보용 추가 (String)
    @Bean
    public ProducerFactory<String, LocationMessage> locationProducerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, LocationMessage> locationKafkaTemplate() {
        return new KafkaTemplate<>(locationProducerFactory());
    }

    // Consumer 설정 (메시지 수신)
    @Bean
    public ConsumerFactory<String, ChatMessageDTO> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "chat-group");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        config.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        config.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        config.put(JsonDeserializer.VALUE_DEFAULT_TYPE, ChatMessageDTO.class);
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");

        // 리밸런싱 방지 설정 추가
        config.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);  // 30초
        config.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 3000);  // 3초
        config.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000);  // 5분
        config.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 100);

        // 메타데이터 갱신 설정
        config.put(ConsumerConfig.METADATA_MAX_AGE_CONFIG, "30000");  // 30초로 증가
        config.put(ConsumerConfig.ALLOW_AUTO_CREATE_TOPICS_CONFIG, true);

        return new DefaultKafkaConsumerFactory<>(config);
    }
    // Consumer 설정 (위치 정보용)
    @Bean
    public ConsumerFactory<String, LocationMessage> locationConsumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "campustrip-group");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        config.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        config.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        config.put(JsonDeserializer.VALUE_DEFAULT_TYPE, LocationMessage.class);
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");  // latest
        config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
        config.put(ConsumerConfig.ALLOW_AUTO_CREATE_TOPICS_CONFIG, true);  // 토픽 자동 생성 허용

        // 동적 토픽 감지를 위한 설정
        config.put(ConsumerConfig.METADATA_MAX_AGE_CONFIG, "5000");

        return new DefaultKafkaConsumerFactory<>(config);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, LocationMessage>
    locationKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, LocationMessage> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(locationConsumerFactory());
        factory.getContainerProperties().setPollTimeout(3000);
        factory.getContainerProperties().setIdlePartitionEventInterval(5000L);

        return factory;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, ChatMessageDTO>
    kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, ChatMessageDTO> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());

        // 안정성 향상 설정
        factory.setConcurrency(1);  // 동시성 제한
        factory.getContainerProperties().setPollTimeout(5000);
        factory.getContainerProperties().setIdleBetweenPolls(100);
        factory.getContainerProperties().setSyncCommits(true);  // 동기 커밋

        return factory;
    }

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }
}
