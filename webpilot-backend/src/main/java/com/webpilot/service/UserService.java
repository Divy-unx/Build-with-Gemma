package com.webpilot.service;

import com.webpilot.entity.User;
import com.webpilot.repository.UserRepository;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // For the MVP, we just create and return a default local user.
    public User getDefaultUser() {
        return userRepository.findByUsername("local_user")
                .orElseGet(() -> {
                    User user = new User();
                    user.setUsername("local_user");
                    user.setDisplayName("Local User");
                    return userRepository.save(user);
                });
    }

    @PostConstruct
    public void initDefaultUser() {
        getDefaultUser();
    }
}
