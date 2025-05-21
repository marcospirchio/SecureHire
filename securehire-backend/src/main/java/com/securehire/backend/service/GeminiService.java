package com.securehire.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;  
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class GeminiService {

    @Value("${google.api.key}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    public String obtenerRespuestaDesdeGemini(String prompt) {
        RestTemplate restTemplate = new RestTemplate();
    
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));
    
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
    
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
    
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    GEMINI_API_URL + apiKey,
                    entity,
                    String.class
            );
    
            // ✅ Parsear JSON y extraer sólo el texto deseado
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
    
            return root
                    .path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
    
        } catch (Exception e) {
            throw new RuntimeException("Error al llamar o procesar respuesta de Gemini: " + e.getMessage(), e);
        }
}
}
