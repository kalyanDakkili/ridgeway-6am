package com.ridgeway.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Component
public class AnthropicClient {

    @Value("${anthropic.base.url:https://api.anthropic.com}")
    private String baseUrl;

    @Value("${anthropic.api.key:}")
    private String apiKey;

    // OpenRouter uses Authorization: Bearer token instead of x-api-key
    @Value("${anthropic.auth.token:}")
    private String authToken;

    @Value("${anthropic.model:claude-sonnet-4-20250514}")
    private String model;

    private final ObjectMapper mapper = new ObjectMapper();

    private WebClient buildClient() {
        return WebClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader("anthropic-version", "2023-06-01")
            .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
            .build();
    }

    public JsonNode sendMessage(List<Map<String, Object>> messages,
                                 List<Map<String, Object>> tools,
                                 String systemPrompt) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("max_tokens", 4096);
        body.put("system", systemPrompt);
        body.put("tools", tools);
        body.put("messages", messages);

        // Determine which auth header to use:
        // OpenRouter:  Authorization: Bearer <ANTHROPIC_AUTH_TOKEN>
        // Anthropic:   x-api-key: <ANTHROPIC_API_KEY>
        boolean useBearer = authToken != null && !authToken.isBlank();
        String effectiveKey = useBearer ? authToken : apiKey;

        try {
            WebClient client = buildClient();
            var requestSpec = client.post()
                .uri("/v1/messages");

            if (useBearer) {
                requestSpec = requestSpec.header(HttpHeaders.AUTHORIZATION, "Bearer " + effectiveKey);
            } else {
                requestSpec = requestSpec.header("x-api-key", effectiveKey);
            }

            String response = requestSpec
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            return mapper.readTree(response);
        } catch (WebClientResponseException e) {
            throw new RuntimeException("API error " + e.getStatusCode() + ": " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new RuntimeException("API call failed: " + e.getMessage(), e);
        }
    }
}
