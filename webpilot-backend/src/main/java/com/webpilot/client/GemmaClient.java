package com.webpilot.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class GemmaClient {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GemmaClient(
            @Value("${gemma.api-key}") String apiKey,
            @Value("${gemma.model}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;

        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String generate(String message) {

        System.out.println(">>> GEMMA GENERATE CALLED");
        System.out.println(">>> MESSAGE: " + message);

        /*
         * Tool declaration
         */
        Map<String, Object> setThemeFunction = Map.of(
                "name", "set_theme",
                "description", "Changes the WebPilot workspace theme.",
                "parameters", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(
                                "theme", Map.of(
                                        "type", "STRING",
                                        "description", "The theme to apply.",
                                        "enum", List.of("light", "dark")
                                )
                        ),
                        "required", List.of("theme")
                )
        );

        /*
         * Request body
         */
        Map<String, Object> requestBody = Map.of(

                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(
                                        Map.of(
                                                "text",
                                                message
                                        )
                                )
                        )
                ),

                "tools", List.of(
                        Map.of(
                                "functionDeclarations",
                                List.of(setThemeFunction)
                        )
                ),

                "generationConfig", Map.of(
                        "thinkingConfig", Map.of(
                                "thinkingLevel", "minimal"
                        )
                )
        );

        System.out.println(">>> SENDING REQUEST TO GEMMA");
        System.out.println(">>> MODEL: " + model);

        try {

            Map<?, ?> response = restClient.post()
                    .uri(
                            "/v1beta/models/{model}:generateContent",
                            model
                    )
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            System.out.println(">>> GEMMA RAW RESPONSE:");
            System.out.println(response);

            return extractResponse(response);

        } catch (Exception e) {

            System.out.println(">>> GEMMA REQUEST FAILED");
            e.printStackTrace();

            throw e;
        }
    }

    private String extractResponse(Map<?, ?> response) {

        System.out.println(">>> EXTRACTING GEMMA RESPONSE");

        if (response == null) {
            throw new IllegalStateException(
                    "Gemma returned a null response."
            );
        }

        Object candidatesObject = response.get("candidates");

        System.out.println(">>> CANDIDATES: " + candidatesObject);

        if (!(candidatesObject instanceof List<?> candidates)
                || candidates.isEmpty()) {

            throw new IllegalStateException(
                    "Gemma returned no candidates: " + response
            );
        }

        Object candidateObject = candidates.get(0);

        if (!(candidateObject instanceof Map<?, ?> candidate)) {

            throw new IllegalStateException(
                    "Invalid candidate response: " + response
            );
        }

        System.out.println(">>> CANDIDATE: " + candidate);

        Object contentObject = candidate.get("content");

        if (!(contentObject instanceof Map<?, ?> content)) {

            throw new IllegalStateException(
                    "Gemma returned no content: " + response
            );
        }

        System.out.println(">>> CONTENT: " + content);

        Object partsObject = content.get("parts");

        if (!(partsObject instanceof List<?> parts)
                || parts.isEmpty()) {

            throw new IllegalStateException(
                    "Gemma returned no parts: " + response
            );
        }

        System.out.println(">>> PARTS: " + parts);

        /*
         * FIRST:
         * Search every part for a function call.
         */
        for (Object partObject : parts) {

            if (!(partObject instanceof Map<?, ?> part)) {
                continue;
            }

            System.out.println(">>> CHECKING PART: " + part);

            Object functionCallObject =
                    part.get("functionCall");

            if (functionCallObject instanceof Map<?, ?> functionCall) {

                String functionName =
                        String.valueOf(
                                functionCall.get("name")
                        );

                Object arguments =
                        functionCall.get("args");

                System.out.println(
                        ">>> FUNCTION CALL FOUND"
                );

                System.out.println(
                        ">>> FUNCTION: " + functionName
                );

                System.out.println(
                        ">>> ARGUMENTS: " + arguments
                );

                return "FUNCTION_CALL: "
                        + functionName
                        + " "
                        + arguments;
            }
        }

        /*
         * SECOND:
         * If there is no function call,
         * search for normal text.
         */
        for (Object partObject : parts) {

            if (!(partObject instanceof Map<?, ?> part)) {
                continue;
            }

            Object text = part.get("text");

            if (text instanceof String textValue
                    && !textValue.isBlank()) {

                System.out.println(
                        ">>> TEXT RESPONSE FOUND"
                );

                return textValue;
            }
        }

        throw new IllegalStateException(
                "Gemma returned no usable text or function call: "
                        + response
        );
    }
}