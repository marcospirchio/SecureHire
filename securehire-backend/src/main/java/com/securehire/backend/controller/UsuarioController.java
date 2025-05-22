package com.securehire.backend.controller;

import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.io.IOException;
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;


    //mostrar  los datos del reclutador actual desde su id (por ejemplo, al entrar al perfil del reclutador
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuario(@PathVariable String id) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorId(id);
        return usuario.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/perfil")
    public ResponseEntity<Usuario> obtenerPerfil(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(usuario);
    }

    @PutMapping(value = "/foto-perfil", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizarFotoPerfil(
            @AuthenticationPrincipal Usuario usuario,
            @RequestPart("imagen") MultipartFile imagen) {
    
        if (imagen.isEmpty()) {
            return ResponseEntity.badRequest().body("No se envió ninguna imagen.");
        }
    
        try {
            byte[] imagenBytes = imagen.getBytes();
            usuario.setFotoPerfil(imagenBytes); // asegurate que el campo exista
            usuarioService.actualizarUsuario(usuario);
            return ResponseEntity.ok("Foto de perfil actualizada correctamente.");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al procesar la imagen.");
        }
    }
}