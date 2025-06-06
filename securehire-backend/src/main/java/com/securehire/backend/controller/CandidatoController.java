package com.securehire.backend.controller;

import com.securehire.backend.dto.CandidatoConComentariosDTO;
import com.securehire.backend.dto.CandidatoDTO;
import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.CandidatoService;
import com.securehire.backend.repository.CandidatoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/candidatos")
public class CandidatoController {

    @Autowired private CandidatoService candidatoService;
    @Autowired private CandidatoRepository candidatoRepository;

    // @PostMapping
    // public ResponseEntity<Candidato> crearCandidato(@Valid @RequestBody CandidatoDTO dto) {
    //     Candidato creadoOActualizado = candidatoService.crearCandidato(dto);
    //     return ResponseEntity.ok(creadoOActualizado);
    // }
    
    
    @GetMapping
    public ResponseEntity<Page<Candidato>> obtenerCandidatosPaginadosFiltrados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String nombre,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(candidatoService.obtenerCandidatosFiltradosPorReclutador(usuario.getId(), page, size, nombre));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidato> obtenerCandidato(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Candidato> candidato = candidatoService.obtenerCandidatoPorIdParaReclutador(id, usuario.getId());
        return candidato.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/nombre")
    public ResponseEntity<List<Candidato>> buscarPorNombre(
            @RequestParam String nombre,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(candidatoService.buscarPorNombreParaReclutador(nombre, usuario.getId()));
    }

    @GetMapping("/{id}/comentarios")
    public ResponseEntity<CandidatoConComentariosDTO> obtenerCandidatoConComentarios(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<CandidatoConComentariosDTO> resultado = candidatoService.obtenerCandidatoConComentariosParaReclutador(id, usuario.getId());
        return resultado.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Candidato> obtenerCandidatoPorEmail(@PathVariable String email) {
        Optional<Candidato> candidato = candidatoService.obtenerCandidatoPorEmail(email);
        return candidato.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/foto-perfil")
    public ResponseEntity<Candidato> subirFotoPerfil(
            @PathVariable String id,
            @RequestParam("foto") MultipartFile foto,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Candidato> candidato = candidatoService.obtenerCandidatoPorIdParaReclutador(id, usuario.getId());
        if (candidato.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Candidato actualizado = candidatoService.actualizarFotoPerfil(id, foto);
        return ResponseEntity.ok(actualizado);
    }




    //no deberia usarse 


    // @PutMapping("/{id}")
    // public ResponseEntity<Candidato> actualizarCandidato(
    //         @PathVariable String id,
    //         @RequestBody Candidato candidato,
    //         @AuthenticationPrincipal Usuario usuario
    // ) {
    //     Optional<Candidato> existente = candidatoService.obtenerCandidatoPorIdParaReclutador(id, usuario.getId());
    //     if (existente.isEmpty()) return ResponseEntity.notFound().build();

    //     candidato.setId(id);
    //     return ResponseEntity.ok(candidatoService.actualizarCandidato(candidato));
    // }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> eliminarCandidato(
    //         @PathVariable String id,
    //         @AuthenticationPrincipal Usuario usuario
    // ) {
    //     boolean eliminado = candidatoService.eliminarCandidatoParaReclutador(id, usuario.getId());
    //     if (!eliminado) return ResponseEntity.notFound().build();
    //     return ResponseEntity.ok().build();
    // }
}
