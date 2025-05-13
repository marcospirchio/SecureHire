package com.securehire.backend.model;

import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "entrevistas")
public class Entrevista {
    @Id
    private String id;
    private String usuarioId;
    private String candidatoId;
    private String busquedaId;
    private String postulacionId;
    private Date fechaProgramada;           // Fecha (ej. 2025-05-15)
    private String horaProgramada;          // Hora (ej. "10:00")
    private String estado;                  // "confirmada", etc.
    private String linkEntrevista;
    private List<String> comentarios;
    private String motivoCancelacion;
}
