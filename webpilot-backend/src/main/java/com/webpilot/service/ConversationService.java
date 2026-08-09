package com.webpilot.service;

import com.webpilot.dto.ConversationDetailResponse;
import com.webpilot.dto.ConversationResponse;
import com.webpilot.dto.MessageResponse;
import com.webpilot.entity.Conversation;
import com.webpilot.entity.User;
import com.webpilot.repository.ConversationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserService userService;

    public ConversationService(ConversationRepository conversationRepository, UserService userService) {
        this.conversationRepository = conversationRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations() {
        User user = userService.getDefaultUser();
        List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
        return conversations.stream()
                .map(c -> new ConversationResponse(c.getId(), c.getTitle(), c.getUpdatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationDetailResponse getConversation(Long id) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        List<MessageResponse> messageResponses = conversation.getMessages().stream()
                .map(m -> new MessageResponse(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt(), false))
                .collect(Collectors.toList());

        return new ConversationDetailResponse(
                conversation.getId(),
                conversation.getTitle(),
                conversation.getUpdatedAt(),
                messageResponses
        );
    }

    @Transactional
    public ConversationResponse createConversation(String title) {
        User user = userService.getDefaultUser();
        Conversation conversation = new Conversation();
        conversation.setUser(user);
        conversation.setTitle(title != null && !title.isBlank() ? title : "New Conversation");
        conversation = conversationRepository.save(conversation);
        return new ConversationResponse(conversation.getId(), conversation.getTitle(), conversation.getUpdatedAt());
    }

    @Transactional
    public void deleteConversation(Long id) {
        conversationRepository.deleteById(id);
    }
}
