package com.securehire.backend.controller;

import com.securehire.backend.dto.CandidatoConComentariosDTO;
import com.securehire.backend.model.Entrevista;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.CandidatoService;
import com.securehire.backend.service.EntrevistaService;
import com.securehire.backend.service.PostulacionService;
import org.springframework.beans.factory.annotation.Autowired;
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

    // ✅ Crear una nueva entrevista asignada al usuario logueado.
    // Si tiene vinculada una postulación, se completa automáticamente el candidato.

    @PostMapping
    public ResponseEntity<Entrevista> crearEntrevista(
            @RequestBody Entrevista entrevista,
            @AuthenticationPrincipal Usuario usuario
    ) {
        entrevista.setUsuarioId(usuario.getId());

        if (entrevista.getPostulacionId() != null) {
            String candidatoId = postulacionService.obtenerPostulacionPorId(entrevista.getPostulacionId())
                    .orElseThrow(() -> new RuntimeException("Postulación no encontrada"))
                    .getCandidatoId();
            entrevista.setCandidatoId(candidatoId);
        }

        return ResponseEntity.ok(entrevistaService.crearEntrevista(entrevista));
    }

    // ✅ Obtener una entrevista por su ID.
    // Solo útil si se necesita consultar detalles específicos desde el frontend.
    @GetMapping("/{id}")
    public ResponseEntity<Entrevista> obtenerEntrevista(@PathVariable String id) {
        Optional<Entrevista> entrevista = entrevistaService.obtenerEntrevistaPorId(id);
        return entrevista.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Obtener los comentarios públicos y privados del candidato vinculado a una entrevista.
    // Se usa, por ejemplo, para ver el historial del candidato al revisar una entrevista.
    @GetMapping("/{id}/candidato-comentarios")
    public ResponseEntity<CandidatoConComentariosDTO> obtenerCandidatoConComentarios(@PathVariable String id) {
        Optional<Entrevista> entrevistaOpt = entrevistaService.obtenerEntrevistaPorId(id);
        if (entrevistaOpt.isPresent()) {
            Entrevista entrevista = entrevistaOpt.get();
            Optional<CandidatoConComentariosDTO> resultado = candidatoService.obtenerCandidatoConComentarios(entrevista.getCandidatoId());
            return resultado.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return ResponseEntity.notFound().build();
    }

    // ✅ Filtrar entrevistas del usuario logueado por estado, candidato, postulación o fechas.
    // Muy útil para mostrar entrevistas próximas o históricas en el calendario.
    @GetMapping
    public ResponseEntity<List<Entrevista>> filtrarEntrevistas(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String candidatoId,
            @RequestParam(required = false) String postulacionId,
            @RequestParam(required = false) Date inicio,
            @RequestParam(required = false) Date fin
    ) {
        List<Entrevista> entrevistas = entrevistaService.filtrarEntrevistas(
                estado, usuario.getId(), candidatoId, postulacionId, inicio, fin
        );
        return ResponseEntity.ok(entrevistas);
    }
    // ✅ Actualizar una entrevista por ID. Se usa para cambiar su estado o reprogramarla.
    @PutMapping("/{id}")
    public ResponseEntity<Entrevista> actualizarEntrevista(
            @PathVariable String id,
            @RequestBody Entrevista entrevista
    ) {
        if (!entrevistaService.obtenerEntrevistaPorId(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        entrevista.setId(id);
        return ResponseEntity.ok(entrevistaService.actualizarEntrevista(entrevista));
    }

    // ✅ Eliminar una entrevista por su ID. Se puede usar para cancelar permanentemente.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEntrevista(@PathVariable String id) {
        if (!entrevistaService.obtenerEntrevistaPorId(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        entrevistaService.eliminarEntrevista(id);
        return ResponseEntity.ok().build();
    }
}
