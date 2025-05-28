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
    private String usuarioId;        
    private String titulo;
    private String descripcion;
    private String tipo;              
    private Date fechaHora;           
    private String ubicacion;         
    private String color;             
    private Date creadoEn;            
} 