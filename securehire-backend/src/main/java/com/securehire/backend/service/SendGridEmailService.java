package com.securehire.backend.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class SendGridEmailService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.sender.email}")
    private String senderEmail;

    public void enviarCorreo(String destinatario, String asunto, String contenidoTexto) {
        Email from = new Email(senderEmail);
        Email to = new Email(destinatario);
        Content content = new Content("text/plain", contenidoTexto);
        Mail mail = new Mail(from, asunto, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);

            // Log de respuesta
            System.out.println("🔵 SendGrid STATUS: " + response.getStatusCode());
            System.out.println("🔵 SendGrid BODY: " + response.getBody());
            System.out.println("🔵 SendGrid HEADERS: " + response.getHeaders());

            if (response.getStatusCode() >= 400) {
                throw new RuntimeException("❌ Error al enviar correo: " + response.getBody());
            } else {
                System.out.println("✅ Correo enviado correctamente por SendGrid a " + destinatario);
            }

        } catch (IOException ex) {
            ex.printStackTrace();
            throw new RuntimeException("❌ Error al enviar correo con SendGrid", ex);
        }
    }
}