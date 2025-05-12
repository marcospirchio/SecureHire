package com.securehire.backend.dto;

import com.securehire.backend.model.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request object for authentication operations")
public class AuthRequest {
    @Schema(description = "User's first name", example = "Juan")
    private String nombre;

    @Schema(description = "User's email address", example = "juan.perez@empresa.com")
    private String email;

    @Schema(description = "User's password", example = "Contraseña123!")
    private String password;

    @Schema(description = "User's role in the system", example = "RECLUTADOR")
    private UserRole rol;

    @Schema(description = "User's DNI", example = "12345678")
    private String dni;
} 
