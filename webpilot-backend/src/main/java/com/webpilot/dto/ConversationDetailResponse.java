package com.webpilot.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ConversationDetailResponse {
    private Long id;
    private String title;
    private LocalDateTime updatedAt;
    private List<MessageResponse> messages;

    public ConversationDetailResponse(Long id, String title, LocalDateTime updatedAt, List<MessageResponse> messages) {
        this.id = id;
        this.title = title;
        this.updatedAt = updatedAt;
        this.messages = messages;
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

    public List<MessageResponse> getMessages() {
        return messages;
    }
}
