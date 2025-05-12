package com.securehire.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response object for authentication operations")
public class AuthResponse {
    @Schema(description = "JWT token for authentication")
    private String token;

    @Schema(description = "User's email address")
    private String email;

    @Schema(description = "User's first name")
    private String nombre;

    @Schema(description = "User's role in the system")
    private String rol;
} 