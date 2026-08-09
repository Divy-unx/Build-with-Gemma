package com.webpilot.controller;

import com.webpilot.service.ThemeService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/theme")
public class ThemeController {

    private final ThemeService themeService;

    public ThemeController(ThemeService themeService) {
        this.themeService = themeService;
    }

    @GetMapping
    public Map<String, String> getTheme() {
        return Map.of(
                "theme",
                themeService.getCurrentTheme()
        );
    }

    @PostMapping
    public Map<String, String> setTheme(
            @RequestBody ThemeRequest request
    ) {

        String theme = themeService.setTheme(request.theme());

        return Map.of(
                "theme",
                theme
        );
    }

    public record ThemeRequest(String theme) {
    }
}