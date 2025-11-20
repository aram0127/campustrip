package com.example.app.controller;

import com.example.app.auth.SendEmailRequest;
import com.example.app.auth.VerifyCodeRequest;
import com.example.app.auth.VerifyResponse;
import com.example.app.domain.Universities;
import com.example.app.repository.UniversitiesRepository;
import com.example.app.service.EmailVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/email")
public class EmailVerificationController {

    private final EmailVerificationService service;
    private final UniversitiesRepository universitiesRepository;

    public EmailVerificationController(EmailVerificationService service, UniversitiesRepository universitiesRepository) {
        this.service = service;
        this.universitiesRepository = universitiesRepository;
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody SendEmailRequest req) {
        service.sendCode(req.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyResponse> verify(@RequestBody VerifyCodeRequest req) {
        boolean ok = service.verify(req.getEmail(), req.getCode());
        Universities universities = universitiesRepository.findByDomain(req.getEmail().split("@")[1]);
        return ResponseEntity.ok(new VerifyResponse(ok, universities != null ? universities.getName() : null));
    }
}
