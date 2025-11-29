package com.example.app.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;

@Entity
@Table(name = "FCMToken")
@IdClass(FCMTokenId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FCMToken {

    @Id
    @Column(name = "membership_id", nullable = false)
    private Integer membershipId;

    @Id
    @Column(name = "token", nullable = false, length = 255)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", insertable = false, updatable = false)
    private User user;
}
