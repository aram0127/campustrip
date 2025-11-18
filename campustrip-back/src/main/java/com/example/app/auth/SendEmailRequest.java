package com.example.app.auth;

public class SendEmailRequest {
    private String email;

    public SendEmailRequest() {}
    public SendEmailRequest(String email) { this.email = email; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
