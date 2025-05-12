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
    private String busquedaId; // Corregido: antes era puestoId
    private String postulacionId;
    private Date fechaProgramada;
    private String estado; // "pendiente", "confirmada", "cancelada", "reprogramada", "finalizada", "ausente"
    private String linkEntrevista; // Agregado
    private List<String> comentarios;
    private String motivoCancelacion; // Agregado
}
