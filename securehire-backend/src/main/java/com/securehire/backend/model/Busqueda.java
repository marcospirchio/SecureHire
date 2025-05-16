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
@Document(collection = "busquedas")
public class Busqueda {
    @Id
    private String id;
    private String titulo;
    private String empresa;
    private String ubicacion;
    private String modalidad;
    private String tipoContrato;
    private String salario;
    private String descripcion;
    private List<CampoFormulario> camposPorDefecto;
    private List<CampoFormulario> camposAdicionales;
    private List<String> fases;
    private String usuarioId;
    private String urlPublica;
    private Date fechaCreacion;
    private boolean archivada;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampoFormulario {
        private String nombre;
        private String tipo;
        private boolean esExcluyente;
        private List<String> opciones;
        private List<String> valoresExcluyentes;
        private boolean obligatorio;
    }
}