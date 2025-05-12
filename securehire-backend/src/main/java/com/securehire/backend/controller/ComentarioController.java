package com.securehire.backend.controller;

import com.securehire.backend.model.Comentario;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.AuthService;
import com.securehire.backend.service.ComentarioService;
import com.securehire.backend.service.PostulacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comentarios")
public class ComentarioController {
    @Autowired
    private ComentarioService comentarioService;

    @Autowired
    private AuthService authService;

    @Autowired
    private PostulacionService postulacionService;

    
    // ✅ Crear un comentario público (solo si la postulación está finalizada)
    // Este comentario se guarda como parte del perfil del candidato y es visible por todos los reclutadores.
    @PostMapping
    public ResponseEntity<Comentario> crearComentario(
            @RequestBody Comentario comentario,
            @AuthenticationPrincipal Usuario usuario
    ) {
    comentario.setUsuarioId(usuario.getId());

    if (comentario.getPostulacionId() != null) {
        var postulacion = postulacionService.obtenerPostulacionPorId(comentario.getPostulacionId())
                .orElseThrow(() -> new RuntimeException("Postulación no encontrada"));

        // Validar que la postulación esté finalizada
        if (!"FINALIZADA".equalsIgnoreCase(postulacion.getEstado())) {
            return ResponseEntity.badRequest().build(); // o un error más descriptivo
        }

        comentario.setCandidatoId(postulacion.getCandidatoId());
    } else {
        return ResponseEntity.badRequest().build(); // No se puede comentar sin una postulación
    }

    return ResponseEntity.ok(comentarioService.crearComentario(comentario));
    }


    // ✅ Obtener comentarios por candidato.
    // Útil para mostrar los comentarios de un candidato en la vista de candidato.
    @GetMapping("/candidato/{candidatoId}")
    public ResponseEntity<List<Comentario>> obtenerComentariosPorCandidato(@PathVariable String candidatoId) {
        return ResponseEntity.ok(comentarioService.obtenerComentariosPorCandidato(candidatoId));
    }


    // ✅ Eliminar un comentario por su ID.
    // Solo se puede eliminar si el usuario es el propietario del comentario.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarComentario(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Comentario> comentarioOpt = comentarioService.obtenerComentarioPorId(id);
    
        if (comentarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
    
        Comentario comentario = comentarioOpt.get();
        if (!comentario.getUsuarioId().equals(usuario.getId())) {
            return ResponseEntity.status(403).build(); // No autorizado
        }
    
        comentarioService.eliminarComentario(id);
        return ResponseEntity.ok().build();
    }
    
}
