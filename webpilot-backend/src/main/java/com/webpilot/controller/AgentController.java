package com.webpilot.controller;

import com.webpilot.client.GemmaClient;
import com.webpilot.service.ThemeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final GemmaClient gemmaClient;
    private final ThemeService themeService;

    public AgentController(
            GemmaClient gemmaClient,
            ThemeService themeService
    ) {
        this.gemmaClient = gemmaClient;
        this.themeService = themeService;
    }

    @PostMapping
    public String chat(@RequestBody AgentRequest request) {

        String result = gemmaClient.generate(request.message());

        return result;
    }

    public record AgentRequest(String message) {
    }
}