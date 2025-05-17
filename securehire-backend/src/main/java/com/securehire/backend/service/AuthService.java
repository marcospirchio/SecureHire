package com.securehire.backend.service;

import com.securehire.backend.dto.AuthRequest;
import com.securehire.backend.dto.AuthResponse;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.model.UserRole;
import com.securehire.backend.repository.UsuarioRepository;
import com.securehire.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.securehire.backend.service.ResendEmailService;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ResendEmailService emailService;
    public AuthResponse register(AuthRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (usuarioRepository.existsByDni(request.getDni())) {
            throw new RuntimeException("Ya existe un usuario con ese DNI");
        }
            
        var usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol().name())
                .dni(request.getDni())
                .empresa("Empresa por defecto")
                .puestosPublicados(List.of())
                .fechaCreacion(new Date())
                .build();
                
              emailService.enviarCorreo(
                usuario.getEmail(),
                "¡Bienvenido a SecureHire!",
                "Hola " + usuario.getNombre() + ", gracias por registrarte en nuestra plataforma."
            );
        
        usuarioRepository.save(usuario);
        var jwtToken = jwtService.generateToken((UserDetails) usuario);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
    
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    
        String jwtToken = jwtService.generateToken((UserDetails) usuario);
    
        return AuthResponse.builder()
            .token(jwtToken)
            .email(usuario.getEmail())
            .nombre(usuario.getNombre())
            .rol(usuario.getRol())
            .build();
    }
    

    public Usuario getUserByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
} 