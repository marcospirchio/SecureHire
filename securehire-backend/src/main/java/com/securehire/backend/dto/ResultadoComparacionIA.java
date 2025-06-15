package com.securehire.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) 
public class ResultadoComparacionIA {
    private List<CandidatoComparado> resultados;

    @Data
    public static class CandidatoComparado {
        private int index; 
        private String nombre;
        private int score;
        private List<String> explicacion;
    }
}
