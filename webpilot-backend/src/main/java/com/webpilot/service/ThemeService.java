package com.webpilot.service;

import org.springframework.stereotype.Service;

@Service
public class ThemeService {

    private String currentTheme = "light";

    public String setTheme(String theme) {

        if (!theme.equals("light") && !theme.equals("dark")) {
            throw new IllegalArgumentException(
                    "Unsupported theme: " + theme
            );
        }

        currentTheme = theme;

        System.out.println(
                ">>> THEME CHANGED TO: " + currentTheme
        );

        return currentTheme;
    }

    public String getCurrentTheme() {
        return currentTheme;
    }
}