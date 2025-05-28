package com.securehire.backend.controller;

import com.securehire.backend.model.Comentario;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.AuthService;
import com.securehire.backend.service.ComentarioService;
import com.securehire.backend.service.PostulacionService;
import com.securehire.backend.service.CandidatoService;
import com.securehire.backend.service.BusquedaService;
    
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.service.CandidatoService;
import com.securehire.backend.service.BusquedaService;
import com.securehire.backend.service.SendGridEmailService;



@RestController
@RequestMapping("/api/comentarios")
public class ComentarioController {
    @Autowired
    private ComentarioService comentarioService;

    @Autowired
    private CandidatoService candidatoService;

    @Autowired
    private BusquedaService busquedaService;

    @Autowired
    private SendGridEmailService sendGridEmailService;

    @Autowired
    private AuthService authService;

    @Autowired
    private PostulacionService postulacionService;

    
    @PostMapping
    public ResponseEntity<Comentario> crearComentario(
            @RequestBody Comentario comentario,
            @AuthenticationPrincipal Usuario usuario
    ) {
        comentario.setUsuarioId(usuario.getId());
        System.out.println("📥 Recibido comentario de usuario: " + usuario.getEmail());
    
        if (comentario.getPostulacionId() == null) {
            System.out.println("⛔ No se envió postulaciónId");
            return ResponseEntity.badRequest().build();
        }
    
        Optional<Postulacion> postulacionOpt = postulacionService.obtenerPostulacionPorId(comentario.getPostulacionId());
    
        if (postulacionOpt.isEmpty()) {
            System.out.println("⛔ No se encontró postulación con ID: " + comentario.getPostulacionId());
            return ResponseEntity.badRequest().build();
        }
    
        Postulacion postulacion = postulacionOpt.get();
    
        if (!"FINALIZADA".equalsIgnoreCase(postulacion.getEstado())) {
            System.out.println("⛔ La postulación no está finalizada.");
            return ResponseEntity.badRequest().build();
        }
    
        comentario.setCandidatoId(postulacion.getCandidatoId());
    
        Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(postulacion.getBusquedaId());
        String tituloBusqueda = busquedaOpt.map(Busqueda::getTitulo).orElse("una de tus postulaciones");
    
        Comentario comentarioGuardado = comentarioService.crearComentario(comentario);
        System.out.println("✅ Comentario guardado correctamente en la BDD con ID: " + comentarioGuardado.getId());
    
        // Enviar correo
        try {
            System.out.println("📩 Iniciando proceso de envío de correo...");
            Candidato candidato = candidatoService.obtenerCandidatoPorId(comentario.getCandidatoId())
                    .orElseThrow(() -> new RuntimeException("Candidato no encontrado"));
    
            System.out.println("✅ Candidato encontrado: " + candidato.getEmail());
    
            String asunto = "Nuevo comentario sobre tu postulación";
            String mensaje = String.format(
                "Hola %s,\n\nHas recibido un nuevo comentario sobre tu postulación a \"%s\":\n\n\"%s\"\n\nSaludos,\nSecureHire",
                candidato.getNombre(),
                tituloBusqueda,
                comentario.getTexto()
            );
    
            System.out.println("📤 Enviando correo a: " + candidato.getEmail());
            sendGridEmailService.enviarCorreo(candidato.getEmail(), asunto, mensaje);
            System.out.println("✅ Solicitud de envío de correo completada.");
        } catch (Exception e) {
            System.out.println("⚠️ No se pudo enviar el correo al candidato: " + e.getMessage());
        }
    
        return ResponseEntity.ok(comentarioGuardado);
    }
    

    @GetMapping("/candidato/{candidatoId}")
    public ResponseEntity<List<Comentario>> obtenerComentariosPorCandidato(
            @PathVariable String candidatoId,
            @RequestParam(required = false) String postulacionId
    ) {
        List<Comentario> comentarios;

        if (postulacionId != null && !postulacionId.isBlank()) {
            comentarios = comentarioService.obtenerComentariosPorCandidatoYPostulacion(candidatoId, postulacionId);
        } else {
            comentarios = comentarioService.obtenerComentariosPorCandidato(candidatoId);
        }

        return ResponseEntity.ok(comentarios);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Comentario> actualizarComentario(
            @PathVariable String id,
            @RequestBody Comentario actualizado,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Comentario> comentarioOpt = comentarioService.obtenerComentarioPorId(id);
    
        if (comentarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
    
        Comentario existente = comentarioOpt.get();
    
        if (!existente.getUsuarioId().equals(usuario.getId())) {
            return ResponseEntity.status(403).build();
        }
    
        existente.setTexto(actualizado.getTexto());
        existente.setFecha(new Date()); 
    
        return ResponseEntity.ok(comentarioService.actualizarComentario(existente));
    }
    
    
    
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
            return ResponseEntity.status(403).build(); 
        }
    
        comentarioService.eliminarComentario(id);
        return ResponseEntity.ok().build();
    }
    
}
