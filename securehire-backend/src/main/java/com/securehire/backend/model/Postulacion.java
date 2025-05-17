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
    private String estado; // "ACTIVA", "FINALIZADA", "RECHAZADA", "INACTIVA"
    private String motivoFinalizacion; // "NINGUNO", "DESAPARECIO", "NO_ASISTIO", "NO_CUMPLE"
    private List<AnotacionPrivada> anotacionesPrivadas;
    private Date fechaPostulacion;

    private String resumenCv; // Texto generado por IA (opcional)

    private byte[] cvArchivo; // Archivo PDF binario

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
        ACTIVA, FINALIZADA, RECHAZADA, INACTIVA;

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
}
