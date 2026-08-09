package com.webpilot.controller;

import com.webpilot.dto.ConversationDetailResponse;
import com.webpilot.dto.ConversationResponse;
import com.webpilot.service.ConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @GetMapping
    public List<ConversationResponse> getConversations() {
        return conversationService.getConversations();
    }

    @GetMapping("/{id}")
    public ConversationDetailResponse getConversation(@PathVariable Long id) {
        return conversationService.getConversation(id);
    }

    @PostMapping
    public ConversationResponse createConversation(@RequestBody(required = false) Map<String, String> request) {
        String title = request != null ? request.get("title") : null;
        return conversationService.createConversation(title);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }
}
