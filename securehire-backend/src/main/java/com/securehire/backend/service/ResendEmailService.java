package com.securehire.backend.service;

import java.text.SimpleDateFormat;
import reactor.core.publisher.Mono;
import java.util.Date;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResendEmailService {

    @Value("${resend.api.key}")
    private String apiKey;

    private WebClient webClient;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.resend.com/")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public void enviarCorreo(String destinatario, String asunto, String mensaje) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("from", "SecureHire <onboarding@resend.dev>");
    payload.put("to", destinatario);
    payload.put("subject", asunto);
    payload.put("text", mensaje);
    payload.put("html", "<p>" + mensaje + "</p>");

    System.out.println("Enviando correo a: " + destinatario);


    webClient.post()
            .uri("/emails")
            .bodyValue(payload)
            .retrieve()
            .onStatus(status -> status.value() == 403, clientResponse -> {
                System.out.println("Resend bloqueó el correo (403). Ignorando el error para continuar sin fallos.");
                return Mono.empty(); 
            })
            .onStatus(status -> status.isError(), clientResponse ->
                clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                    System.out.println("Error al enviar correo: " + errorBody);
                    return Mono.empty();
                })
            )
            .bodyToMono(String.class)
            .doOnSuccess(resp -> System.out.println("Respuesta de Resend: " + resp))
            .onErrorResume(e -> {
                System.out.println("Error inesperado al enviar correo: " + e.getMessage());
                return Mono.empty(); 
            })
            .block();
    }

}