package com.securehire.backend.model;

import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comentarios")
public class Comentario {
    @Id
    private String id;
    private String candidatoId;
    private String usuarioId;
    private String postulacionId;
    private String texto;
    private int puntaje;
    private Date fecha;
}
