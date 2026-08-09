package com.webpilot.service;

import com.webpilot.entity.User;
import com.webpilot.entity.UserSettings;
import com.webpilot.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ThemeService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserService userService;

    public ThemeService(UserSettingsRepository userSettingsRepository, UserService userService) {
        this.userSettingsRepository = userSettingsRepository;
        this.userService = userService;
    }

    @Transactional
    public String setTheme(String theme) {
        if (!theme.equals("light") && !theme.equals("dark")) {
            throw new IllegalArgumentException("Unsupported theme: " + theme);
        }

        User user = userService.getDefaultUser();
        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserSettings newSettings = new UserSettings();
                    newSettings.setUser(user);
                    return newSettings;
                });

        settings.setTheme(theme);
        userSettingsRepository.save(settings);

        System.out.println(">>> THEME CHANGED TO: " + theme);
        return theme;
    }

    @Transactional(readOnly = true)
    public String getCurrentTheme() {
        User user = userService.getDefaultUser();
        return userSettingsRepository.findByUserId(user.getId())
                .map(UserSettings::getTheme)
                .orElse("dark");
    }
}