package com.example.app.auth;

public class VerifyCodeRequest {
    private String email;
    private String code;

    public VerifyCodeRequest() {}
    public VerifyCodeRequest(String email, String code) {
        this.email = email;
        this.code = code;
    }
    public String getEmail() { return email; }
    public String getCode() { return code; }
    public void setEmail(String email) { this.email = email; }
    public void setCode(String code) { this.code = code; }
}
