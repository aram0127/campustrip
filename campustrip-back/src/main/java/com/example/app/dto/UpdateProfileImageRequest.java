package com.example.app.dto;

import org.springframework.web.multipart.MultipartFile;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileImageRequest {
    private MultipartFile profileImage;
}
