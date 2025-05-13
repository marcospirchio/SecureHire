package com.securehire.backend.service;

import com.securehire.backend.model.Usuario;
import com.securehire.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ResendEmailService emailService;

    public Usuario crearUsuario(Usuario usuario) {
        usuario.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash()));
        usuario.setFechaCreacion(new Date());

        Usuario nuevoUsuario = usuarioRepository.save(usuario);

        // Enviar email de bienvenida
        String asunto = "¡Bienvenido a SecureHire!";
        String mensaje = "Hola " + usuario.getNombre() + ", gracias por registrarte en nuestra plataforma.";
        emailService.enviarCorreo(usuario.getEmail(), asunto, mensaje);

        return nuevoUsuario;
    }

    public Optional<Usuario> obtenerUsuarioPorId(String id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public boolean existeUsuarioConEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }
} 