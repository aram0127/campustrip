package com.example.app.controller;

import com.example.app.auth.SendEmailRequest;
import com.example.app.auth.VerifyCodeRequest;
import com.example.app.auth.VerifyResponse;
import com.example.app.service.EmailVerificationService;
import com.example.app.service.UniversitiesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/email")
public class EmailVerificationController {

    private final EmailVerificationService service;
    private final UniversitiesService universitiesService;

    public EmailVerificationController(EmailVerificationService service, UniversitiesService universitiesService) {
        this.service = service;
        this.universitiesService = universitiesService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody SendEmailRequest req) {
        if (universitiesService.getUniversityNameByEmail(req.getEmail()) == null) {
            return ResponseEntity.badRequest().body("Invalid university email domain.");
        }
        service.sendCode(req.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyResponse> verify(@RequestBody VerifyCodeRequest req) {
        boolean ok = service.verify(req.getEmail(), req.getCode());
        String universityName = universitiesService.getUniversityNameByEmail(req.getEmail());
        return ResponseEntity.ok(new VerifyResponse(ok, universityName));
    }
}
