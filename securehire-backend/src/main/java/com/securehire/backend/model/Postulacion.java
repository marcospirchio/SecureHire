package com.securehire.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "postulaciones")
public class Postulacion {
    @Id
    private String id;

    private String candidatoId;
    private String busquedaId;
    private String usuarioId;

    private List<RespuestaFormulario> respuestas;

    private String faseActual;
    private String estado; 
    private String motivoFinalizacion; 
    private List<AnotacionPrivada> anotacionesPrivadas;
    private Date fechaPostulacion;

    private String resumenCv; 

    private byte[] cvArchivo; 

    private String opinionComentariosIA; 

    private String fotoPerfil;

    private Boolean esFavorito = false;

    private String perfilDetectadoIA;
    private Integer puntajeIA;
    private List<String> motivosIA;

    private Integer puntajeRequisitosClave;
    private Integer puntajeExperienciaLaboral;
    private Integer puntajeFormacionAcademica;
    private Integer puntajeIdiomasYSoftSkills;
    private Integer puntajeOtros;
    private Integer puntajeGeneral;
    
    private List<String> motivosPositivos;
    private List<String> motivosNegativos;
    private Integer aniosExperiencia;
    private List<String> explicacionesPorCriterio; // explicación corta por cada criterio

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RespuestaFormulario {
        private String campo;
        private String respuesta;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnotacionPrivada {
        private String usuarioId;
        private String comentario;
        private Date fecha;
    }

    public enum Estado {
        PENDIENTE, ACTIVA, FINALIZADA, RECHAZADA, INACTIVA;

        public static boolean isValid(String valor) {
            for (Estado estado : values()) {
                if (estado.name().equalsIgnoreCase(valor)) {
                    return true;
                }
            }
            return false;
        }
    }

    public enum Fase {
        INICIAL, PRIMERA_ENTREVISTA, SEGUNDA_ENTREVISTA, DECISION_FINAL;

        public static boolean isValid(String valor) {
            for (Fase fase : values()) {
                if (fase.name().equalsIgnoreCase(valor)) {
                    return true;
                }
            }
            return false;
        }
    }

    public Boolean getEsFavorito() {
        return esFavorito != null ? esFavorito : false;
    }

    public void setEsFavorito(Boolean esFavorito) {
        this.esFavorito = esFavorito != null ? esFavorito : false;
    }
}
