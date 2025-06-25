package com.securehire.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResultadoComparacionIA {
    private List<CandidatoComparado> resultados;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CandidatoComparado {
        private int index;
        private String nombre;
        private int score;
        private List<String> explicacion;

        // Puntajes por criterio
        private int puntajeRequisitosClave;
        private int puntajeExperienciaLaboral;
        private int puntajeFormacionAcademica;
        private int puntajeIdiomasYSoftSkills;
        private int puntajeOtros;
        private int puntajeGeneral;

        // Detalles adicionales
        private int aniosExperiencia;
        private List<String> motivosPositivos;
        private List<String> motivosNegativos;

        // Nueva propiedad para explicaciones por criterio
        private Map<String, String> explicacionesPorCriterio;
    }
}
