package com.securehire.backend.dto;

import lombok.Data;
import java.util.Date;

@Data
public class EntrevistaConCandidatoDTO {
    private String id;
    private Date fechaProgramada;
    private String horaProgramada;
    private String estado;
    private String linkEntrevista;
    private String nombreCandidato;
    private String apellidoCandidato;
    private String tituloPuesto; // agregalo con su getter/setter

}
