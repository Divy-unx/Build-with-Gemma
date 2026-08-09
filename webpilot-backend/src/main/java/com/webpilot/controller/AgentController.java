package com.webpilot.controller;

import com.webpilot.client.GemmaClient;
import com.webpilot.service.MessageService;
import com.webpilot.service.ThemeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final GemmaClient gemmaClient;
    private final ThemeService themeService;
    private final MessageService messageService;

    public AgentController(
            GemmaClient gemmaClient,
            ThemeService themeService,
            MessageService messageService
    ) {
        this.gemmaClient = gemmaClient;
        this.themeService = themeService;
        this.messageService = messageService;
    }

    @PostMapping
    public String chat(@RequestBody AgentRequest request) {
        // Save USER message
        messageService.saveMessage(request.conversationId(), "user", request.message());

        // Call Gemini
        String result = gemmaClient.generate(request.message());

        // Save AI message
        messageService.saveMessage(request.conversationId(), "ai", result);

        return result;
    }

    public record AgentRequest(Long conversationId, String message) {
    }
}