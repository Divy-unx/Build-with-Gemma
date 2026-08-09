package com.webpilot.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class GemmaClient {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;

    public GemmaClient(
            @Value("${gemma.api-key}") String apiKey,
            @Value("${gemma.model}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = new ObjectMapper();

        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String generate(String message) {
        System.out.println(">>> GEMMA GENERATE CALLED");
        System.out.println(">>> MESSAGE: " + message);

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                        "role", "user",
                        "parts", List.of(
                                Map.of(
                                        "text",
                                        "You are WebPilot, an AI-controlled workspace. You support THREE modes of operation:\n\n" +
                                        "MODE 1: NORMAL CONVERSATION\n" +
                                        "For general questions (e.g., 'Explain Docker'), respond with normal conversational text.\n\n" +
                                        "MODE 2: SIMPLE UI WORKSPACE ACTION\n" +
                                        "When the user asks to modify the workspace (e.g., 'Make background red', 'Add a button', 'Remove button'), you MUST call the provided tools. You can call multiple tools in sequence if needed.\n\n" +
                                        "MODE 3: COMPLEX GENERATIVE UI (ARTIFACT)\n" +
                                        "When the user asks for a complex application (e.g., 'Build a calculator', 'Create a dashboard'), output a standalone HTML document inside a ```html block containing HTML/CSS/JS. Do not use tools for complex apps.\n\n" +
                                        "IMPORTANT RULES:\n" +
                                        "- NEVER claim an action is 'Done' unless you have executed the tool.\n" +
                                        "- Do not use keyword matching. Understand the user's natural language intent.\n" +
                                        "- Tool calls must only use the predefined tools and arguments."
                                )
                        )
                ),
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(
                                        Map.of("text", message)
                                )
                        )
                ),
                "tools", List.of(
                        Map.of("functionDeclarations", getToolDeclarations())
                ),
                "generationConfig", Map.of(
                        "thinkingConfig", Map.of("thinkingLevel", "minimal")
                )
        );

        try {
            Map<?, ?> response = restClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            return extractResponse(response);
        } catch (Exception e) {
            System.out.println(">>> GEMMA REQUEST FAILED");
            e.printStackTrace();
            throw new RuntimeException("Failed to call Gemma API", e);
        }
    }

    private List<Map<String, Object>> getToolDeclarations() {
        return List.of(
                Map.of(
                        "name", "set_background_color",
                        "description", "Sets the workspace background color.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "color", Map.of("type", "STRING", "description", "Valid CSS color or HEX (e.g. #ff0000)")
                                ),
                                "required", List.of("color")
                        )
                ),
                Map.of(
                        "name", "set_background_gradient",
                        "description", "Sets the workspace background gradient.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "from", Map.of("type", "STRING"),
                                        "to", Map.of("type", "STRING"),
                                        "direction", Map.of("type", "STRING")
                                ),
                                "required", List.of("from", "to", "direction")
                        )
                ),
                Map.of(
                        "name", "set_theme",
                        "description", "Switches the global application theme.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "theme", Map.of("type", "STRING", "enum", List.of("light", "dark"))
                                ),
                                "required", List.of("theme")
                        )
                ),
                Map.of(
                        "name", "create_ui_element",
                        "description", "Adds a UI component to the workspace canvas.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "type", Map.of("type", "STRING", "enum", List.of("button", "heading", "text", "input", "card", "badge", "divider")),
                                        "id", Map.of("type", "STRING", "description", "Unique identifier"),
                                        "text", Map.of("type", "STRING", "description", "Inner text or label")
                                ),
                                "required", List.of("type", "id")
                        )
                ),
                Map.of(
                        "name", "remove_ui_element",
                        "description", "Removes a UI component by its ID.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "id", Map.of("type", "STRING")
                                ),
                                "required", List.of("id")
                        )
                ),
                Map.of(
                        "name", "update_ui_element",
                        "description", "Updates styling or properties of an existing UI component.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "id", Map.of("type", "STRING"),
                                        "properties", Map.of("type", "OBJECT", "description", "Object containing style/props to update (e.g. {backgroundColor: '#ef4444', text: 'New'})")
                                ),
                                "required", List.of("id", "properties")
                        )
                ),
                Map.of(
                        "name", "show_notification",
                        "description", "Shows a temporary toast notification in the workspace.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "message", Map.of("type", "STRING"),
                                        "type", Map.of("type", "STRING", "enum", List.of("success", "error", "info"))
                                ),
                                "required", List.of("message", "type")
                        )
                ),
                Map.of(
                        "name", "clear_workspace",
                        "description", "Clears all AI-generated components from the workspace canvas.",
                        "parameters", Map.of("type", "OBJECT")
                )
        );
    }

    private String extractResponse(Map<?, ?> response) {
        if (response == null) throw new IllegalStateException("Gemma returned a null response.");

        Object candidatesObject = response.get("candidates");
        if (!(candidatesObject instanceof List<?> candidates) || candidates.isEmpty()) {
            throw new IllegalStateException("Gemma returned no candidates.");
        }

        Object candidateObject = candidates.get(0);
        if (!(candidateObject instanceof Map<?, ?> candidate)) {
            throw new IllegalStateException("Invalid candidate response.");
        }

        Object contentObject = candidate.get("content");
        if (!(contentObject instanceof Map<?, ?> content)) {
            throw new IllegalStateException("Gemma returned no content.");
        }

        Object partsObject = content.get("parts");
        if (!(partsObject instanceof List<?> parts) || parts.isEmpty()) {
            throw new IllegalStateException("Gemma returned no parts.");
        }

        List<Map<String, Object>> toolCalls = new ArrayList<>();
        StringBuilder textBuilder = new StringBuilder();

        for (Object partObject : parts) {
            if (!(partObject instanceof Map<?, ?> part)) continue;

            Object functionCallObject = part.get("functionCall");
            if (functionCallObject instanceof Map<?, ?> functionCall) {
                Map<String, Object> action = new HashMap<>();
                action.put("tool", functionCall.get("name"));
                action.put("args", functionCall.get("args"));
                toolCalls.add(action);
            }

            Object textObj = part.get("text");
            if (textObj instanceof String textValue && !textValue.isBlank()) {
                textBuilder.append(textValue).append("\n");
            }
        }

        Map<String, Object> result = new HashMap<>();
        if (!toolCalls.isEmpty()) {
            result.put("type", "tool_calls");
            result.put("actions", toolCalls);
            // Default message if the AI didn't provide conversational text along with the tool calls
            String msg = textBuilder.toString().trim();
            result.put("message", msg.isEmpty() ? "Executed workspace actions." : msg);
        } else {
            result.put("type", "message");
            result.put("message", textBuilder.toString().trim());
        }

        try {
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize Gemma response", e);
        }
    }
}