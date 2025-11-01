package com.example.app.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name="ChatMember")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ChatMember.ChatMemberId.class)
public class ChatMember {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    @JsonBackReference("chat-chatMembers")  // 역방향 참조 (JSON에서 제외)
    private Chat chat;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", nullable = false)
    @JsonBackReference("user-chatMembers")  // 역방향 참조 (JSON에서 제외)
    private User user;

    // 조인테이블에 추가할 컬럼 예시
    @Column(name = "is_owner", nullable = false)
    private Boolean role;

    // 복합키 클래스
    @EqualsAndHashCode
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMemberId implements Serializable {
        private Integer chat;
        private Integer user;
    }
}
