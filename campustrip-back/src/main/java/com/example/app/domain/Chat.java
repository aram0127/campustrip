package com.example.app.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="Chat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="chat_id")
    private Integer id;

    @Column(name="created_at", nullable=false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name="title", nullable = false, length = 100)
    private String title;

    @JsonManagedReference("chat-chatMembers")  // 정방향 참조 (JSON에 포함)
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ChatMember> chatMembers = new java.util.ArrayList<>();
}
