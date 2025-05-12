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
@Document(collection = "eventos_calendario")
public class EventoCalendario {
    @Id
    private String id;
    private String usuarioId;         // Usuario al que pertenece el evento
    private String titulo;
    private String descripcion;
    private String tipo;              // Puede ser: "evento" o "entrevista"
    private Date fechaHora;           // Fecha y hora del evento
    private String ubicacion;         // Opcional
    private String color;             // Opcional, para mostrar en el frontend
    private Date creadoEn;            // Fecha de creación
} 