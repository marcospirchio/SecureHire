package com.securehire.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class EvaluacionIAResponse {
    private String perfilDetectado;
    private String resumen;
    private int puntajeGeneral;
    private List<String> motivos;

    // ✅ Nuevo campo para descomposición del puntaje
    private Map<String, Integer> puntajesDetalle;
}
