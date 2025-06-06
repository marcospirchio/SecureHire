package com.securehire.backend.model;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "candidatos")
public class Candidato {

    @Id
    private String id;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @Email(message = "El email debe tener un formato válido")
    @NotBlank(message = "El email es obligatorio")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @NotBlank(message = "El DNI es obligatorio")
    private String dni;

    @NotBlank(message = "El código de país es obligatorio")
    private String codigoPais;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private Date fechaNacimiento;

    @NotBlank(message = "El género es obligatorio")
    private String genero;

    @NotBlank(message = "La nacionalidad es obligatoria")
    private String nacionalidad;

    @NotBlank(message = "El país de residencia es obligatorio")
    private String paisResidencia;

    @NotBlank(message = "La provincia es obligatoria")
    private String provincia;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;

    private String cvUrl;
    private Double reputacion;
    private Integer tiempoRespuesta;
    private List<String> historialEntrevistas;
    private List<String> comentarioIds;
    private Date fechaRegistro;
    
}
