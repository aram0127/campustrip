package com.example.app.domain;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Follow {
    private Integer membership_id;
    private Integer target_id;
    private LocalDateTime created_at;
}
