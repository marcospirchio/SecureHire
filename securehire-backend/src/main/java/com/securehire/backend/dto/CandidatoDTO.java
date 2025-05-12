package com.securehire.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Date;

@Data
public class CandidatoDTO {

    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String telefono;

    @NotBlank
    private String dni;

    @NotBlank
    private String codigoPais;

    @NotNull
    private Date fechaNacimiento;

    @NotBlank
    private String genero;

    @NotBlank
    private String nacionalidad;

    @NotBlank
    private String paisResidencia;

    @NotBlank
    private String provincia;

    @NotBlank
    private String direccion;

    @NotBlank(message = "El cvUrl es obligatorio")
    private String cvUrl;
}
