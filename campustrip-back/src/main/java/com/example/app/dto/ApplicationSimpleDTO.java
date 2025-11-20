package com.example.app.dto;

import com.example.app.domain.Application;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class ApplicationSimpleDTO {

    private String userId;
    private Boolean applicationStatus;
    private LocalDateTime applicationDate;

    public ApplicationSimpleDTO(Application app) {
        this.userId = app.getUser().getUserId();
        this.applicationStatus = app.getApplicationStatus();
        this.applicationDate = app.getApplicationDate();
    }
}