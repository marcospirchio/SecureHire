package com.securehire.backend.controller;

import com.securehire.backend.dto.CandidatoConComentariosDTO;
import com.securehire.backend.dto.EntrevistaConCandidatoDTO;
import com.securehire.backend.model.Entrevista;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.repository.BusquedaRepository;
import com.securehire.backend.service.CandidatoService; 
import com.securehire.backend.service.EntrevistaService;
import com.securehire.backend.service.PostulacionService;      
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/entrevistas")
public class EntrevistaController {

    @Autowired
    private EntrevistaService entrevistaService;

    @Autowired
    private CandidatoService candidatoService;

    @Autowired
    private PostulacionService postulacionService;

    @Autowired
    private BusquedaRepository busquedaRepository;

    @GetMapping("/mis-entrevistas")
    public ResponseEntity<Page<Entrevista>> obtenerMisEntrevistas(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String candidatoId,
            @RequestParam(required = false) String postulacionId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date fin
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Entrevista> entrevistas = entrevistaService.filtrarEntrevistasPaginadas(
                usuario.getId(), estado, candidatoId, postulacionId, inicio, fin, pageable
        );
        return ResponseEntity.ok(entrevistas);
    }

    @PostMapping
    public ResponseEntity<?> crearEntrevista(
            @RequestBody Entrevista entrevista,
            @AuthenticationPrincipal Usuario usuario
    ) {
        String usuarioId = usuario.getId();
        if (entrevista.getBusquedaId() == null || entrevista.getPostulacionId() == null) {
            return ResponseEntity.badRequest().body("Faltan datos: búsqueda o postulación");
        }

        Optional<Busqueda> busquedaOpt = busquedaRepository.findById(entrevista.getBusquedaId());
        if (busquedaOpt.isEmpty() || !busquedaOpt.get().getUsuarioId().equals(usuarioId)) {
            return ResponseEntity.status(403).body("La búsqueda no pertenece al usuario");
        }

        var postulacionOpt = postulacionService.obtenerPostulacionPorId(entrevista.getPostulacionId());
        if (postulacionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("La postulación no existe");
        }

        var postulacion = postulacionOpt.get();
        if (!postulacion.getBusquedaId().equals(entrevista.getBusquedaId())) {
            return ResponseEntity.status(403).body("La postulación no pertenece a la búsqueda indicada");
        }

        if (entrevista.getHoraProgramada() == null || entrevista.getHoraProgramada().isBlank()) {
            return ResponseEntity.badRequest().body("Falta la hora programada de la entrevista");
        }

        entrevista.setUsuarioId(usuarioId);
        entrevista.setCandidatoId(postulacion.getCandidatoId());

        return ResponseEntity.ok(entrevistaService.crearEntrevista(entrevista));
    }

    @PatchMapping("/confirmar/{id}")
    public ResponseEntity<?> confirmarEntrevista(@PathVariable String id) {
        Optional<Entrevista> entrevistaOpt = entrevistaService.obtenerEntrevistaPorId(id);
        if (entrevistaOpt.isEmpty()) return ResponseEntity.notFound().build();

        Entrevista entrevista = entrevistaOpt.get();
        if (!"pendiente".equalsIgnoreCase(entrevista.getEstado())) {
            return ResponseEntity.badRequest().body("La entrevista ya fue confirmada, cancelada o finalizada.");
        }

        entrevista.setEstado("confirmada");
        return ResponseEntity.ok(entrevistaService.actualizarEntrevista(entrevista));
    }

    @GetMapping("/mis-entrevistas-con-candidato")
    public ResponseEntity<List<EntrevistaConCandidatoDTO>> obtenerEntrevistasConDatosCandidato(
            @AuthenticationPrincipal Usuario usuario
    ) {
        List<Entrevista> entrevistas = entrevistaService.filtrarEntrevistas(
            null, usuario.getId(), null, null, null, null
        );
    
        List<EntrevistaConCandidatoDTO> dtos = entrevistas.stream()
            .filter(e -> {
                String estado = e.getEstado() == null ? "" : e.getEstado().toLowerCase();
                return estado.equals("confirmada") || estado.contains("pendiente");
            })
            .map(e -> {
                var dto = new EntrevistaConCandidatoDTO();
                dto.setId(e.getId());
                dto.setFechaProgramada(e.getFechaProgramada());
                dto.setHoraProgramada(e.getHoraProgramada());
                dto.setEstado(e.getEstado());
                dto.setLinkEntrevista(e.getLinkEntrevista());
    
                // Nombre y apellido del candidato
                var candidato = candidatoService.obtenerCandidatoPorId(e.getCandidatoId());
                candidato.ifPresent(c -> {
                    dto.setNombreCandidato(c.getNombre());
                    dto.setApellidoCandidato(c.getApellido());
                });
    
                // Título de la búsqueda (puesto)
                if (e.getPostulacionId() != null) {
                    postulacionService.obtenerPostulacionPorId(e.getPostulacionId())
                        .flatMap(p -> busquedaRepository.findById(p.getBusquedaId()))
                        .ifPresent(busqueda -> dto.setTituloPuesto(busqueda.getTitulo()));
                }
    
                return dto;
            })
            .toList();
    
        return ResponseEntity.ok(dtos);
    }
    

    @GetMapping("/{id}")
    public ResponseEntity<Entrevista> obtenerEntrevista(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Entrevista> entrevistaOpt = entrevistaService.obtenerEntrevistaPorId(id);
        if (entrevistaOpt.isEmpty()) return ResponseEntity.notFound().build();

        Entrevista entrevista = entrevistaOpt.get();
        if (!entrevista.getUsuarioId().equals(usuario.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(entrevista);
    }

    @GetMapping("/{id}/candidato-comentarios")
    public ResponseEntity<CandidatoConComentariosDTO> obtenerCandidatoConComentarios(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Entrevista> entrevistaOpt = entrevistaService.obtenerEntrevistaPorId(id);
        if (entrevistaOpt.isEmpty()) return ResponseEntity.notFound().build();

        Entrevista entrevista = entrevistaOpt.get();
        if (!entrevista.getUsuarioId().equals(usuario.getId())) {
            return ResponseEntity.status(403).build();
        }

        Optional<CandidatoConComentariosDTO> resultado = candidatoService.obtenerCandidatoConComentarios(entrevista.getCandidatoId());
        return resultado.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Entrevista> reprogramarOActualizarEstado(
            @PathVariable String id,
            @RequestBody Entrevista cambios,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Entrevista> opt = entrevistaService.obtenerEntrevistaPorId(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Entrevista existente = opt.get();
        if (!existente.getUsuarioId().equals(usuario.getId())) return ResponseEntity.status(403).build();

        boolean seReprogramo = cambios.getFechaProgramada() != null &&
            !cambios.getFechaProgramada().equals(existente.getFechaProgramada());

        if (seReprogramo) {
            existente.setFechaProgramada(cambios.getFechaProgramada());
            existente.setHoraProgramada(cambios.getHoraProgramada());
            existente.setEstado("reprogramada");
            String nuevoLink = "https://securehire.com/confirmar/" + existente.getId() + "?token=" + System.currentTimeMillis();
            existente.setLinkEntrevista(nuevoLink);
        }

        if (cambios.getMotivoCancelacion() != null && !cambios.getMotivoCancelacion().isBlank()) {
            existente.setMotivoCancelacion(cambios.getMotivoCancelacion());
            existente.setEstado("cancelada");
        }

        if (cambios.getEstado() != null && !cambios.getEstado().isBlank()) {
            existente.setEstado(cambios.getEstado());
        }

        return ResponseEntity.ok(entrevistaService.actualizarEntrevista(existente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEntrevista(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Entrevista> entrevistaOpt = entrevistaService.obtenerEntrevistaPorId(id);
        if (entrevistaOpt.isEmpty()) return ResponseEntity.notFound().build();

        if (!entrevistaOpt.get().getUsuarioId().equals(usuario.getId())) {
            return ResponseEntity.status(403).build();
        }

        entrevistaService.eliminarEntrevista(id);
        return ResponseEntity.ok().build();
    }
}