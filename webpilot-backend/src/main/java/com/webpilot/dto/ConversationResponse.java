package com.webpilot.dto;

import java.time.LocalDateTime;

public class ConversationResponse {
    private Long id;
    private String title;
    private LocalDateTime updatedAt;

    public ConversationResponse(Long id, String title, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
