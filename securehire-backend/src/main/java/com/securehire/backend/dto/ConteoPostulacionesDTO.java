package com.securehire.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConteoPostulacionesDTO {
    private String busquedaId;
    private long cantidad;
}
