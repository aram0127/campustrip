package com.example.app.service;

import com.example.app.auth.EmailVerification;
import com.example.app.repository.EmailVerificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class EmailVerificationService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailVerificationRepository repository;
    private final SecureRandom random = new SecureRandom();

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailVerificationService(JavaMailSender mailSender,
                                    SpringTemplateEngine templateEngine,
                                    EmailVerificationRepository repository) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.repository = repository;
    }

    @Transactional
    public void sendCode(String email) {
        repository.findTopByEmailOrderByIdDesc(email).ifPresent(latest -> {
            if (latest.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
                throw new IllegalStateException("재전송은 60초 후 가능합니다.");
            }
        });

        String code = generateCode(6);
        EmailVerification ev = new EmailVerification(email, code, LocalDateTime.now().plusMinutes(5));
        repository.save(ev);

        String html = renderTemplate(code);
        sendHtmlMail(email, "캠퍼스트립 인증 코드", html);
    }

    @Transactional
    public boolean verify(String email, String code) {
        EmailVerification latest = repository.findTopByEmailOrderByIdDesc(email)
                .orElse(null);
        if (latest == null) return false;
        if (latest.isVerified()) return true;
        if (LocalDateTime.now().isAfter(latest.getExpiresAt())) return false;
        if (!latest.getCode().equals(code)) return false;

        latest.markVerified();
        return true;
    }

    private String generateCode(int length) {
        String digits = "0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(digits.charAt(random.nextInt(digits.length())));
        }
        return sb.toString();
    }

    private String renderTemplate(String code) {
        Context ctx = new Context();
        ctx.setVariable("code", code);
        // templates/mail.html 사용
        return templateEngine.process("mail", ctx);
    }

    private void sendHtmlMail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("메일 전송에 실패했습니다.", e);
        }
    }
}
