package com.securehire.backend.controller;

import com.securehire.backend.dto.AuthRequest;
import com.securehire.backend.dto.AuthResponse;
import com.securehire.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;

    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account with the provided information and returns an authentication token",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                schema = @Schema(implementation = AuthRequest.class),
                examples = @ExampleObject(
                    value = "{\"nombre\": \"Juan\", \"apellido\": \"Pérez\", \"email\": \"juan.perez@empresa.com\", \"password\": \"Contraseña123!\", \"role\": \"RECLUTADOR\"}"
                )
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "User registered successfully",
                content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid input data"
            ),
            @ApiResponse(
                responseCode = "409",
                description = "Email already exists"
            )
        }
    )
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
        @RequestBody
        @Schema(description = "User registration data")
        AuthRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(
        summary = "Login user",
        description = "Authenticates a user and returns an authentication token",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                schema = @Schema(implementation = AuthRequest.class),
                examples = @ExampleObject(
                    value = "{\"email\": \"juan.perez@empresa.com\", \"password\": \"Contraseña123!\"}"
                )
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Login successful",
                content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                responseCode = "401",
                description = "Invalid credentials"
            )
        }
    )
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @RequestBody
        @Schema(description = "User login credentials")
        AuthRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
} 