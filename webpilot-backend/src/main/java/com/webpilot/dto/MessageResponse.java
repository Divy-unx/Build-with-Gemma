package com.webpilot.dto;

import java.time.LocalDateTime;

public class MessageResponse {
    private Long id;
    private String role;
    private String content;
    private LocalDateTime createdAt;
    private boolean isError;

    public MessageResponse(Long id, String role, String content, LocalDateTime createdAt, boolean isError) {
        this.id = id;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt;
        this.isError = isError;
    }

    public Long getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean getIsError() {
        return isError;
    }
}
