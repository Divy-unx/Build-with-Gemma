package com.webpilot.service;

import com.webpilot.entity.Conversation;
import com.webpilot.entity.Message;
import com.webpilot.repository.ConversationRepository;
import com.webpilot.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;

    public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
    }

    @Transactional
    public Message saveMessage(Long conversationId, String role, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // Generate title from first user message if it's currently "New Conversation"
        if ("user".equalsIgnoreCase(role) && "New Conversation".equals(conversation.getTitle())) {
            String newTitle = content.trim();
            if (newTitle.length() > 50) {
                newTitle = newTitle.substring(0, 50) + "...";
            }
            conversation.setTitle(newTitle);
            conversationRepository.save(conversation);
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setRole(role);
        message.setContent(content);

        return messageRepository.save(message);
    }
}
