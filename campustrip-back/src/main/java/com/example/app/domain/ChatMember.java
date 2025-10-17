package com.example.app.domain;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name="ChatMember")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMember {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", nullable = false)
    private User user;

    // 조인테이블에 추가할 컬럼 예시
    @Column(name = "is_owner", nullable = false)
    private Boolean role;

    // 복합키 클래스
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMemberId implements Serializable {
        private Integer chat;
        private Integer user;
    }
}
