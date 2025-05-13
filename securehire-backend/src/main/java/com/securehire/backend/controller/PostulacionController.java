package com.securehire.backend.controller;

import com.securehire.backend.dto.PostulacionRequest;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.model.Postulacion.AnotacionPrivada;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.AuthService;
import com.securehire.backend.service.PostulacionService;
import com.securehire.backend.service.CandidatoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Map;
@RestController
@RequestMapping("/api/postulaciones")
public class PostulacionController {

    @Autowired
    private PostulacionService postulacionService;

    @Autowired
    private AuthService authService;

    @Autowired
    private CandidatoService candidatoService;

    //FUNCIONA
    @PostMapping
    public ResponseEntity<?> crearPostulacion(@RequestBody PostulacionRequest request) {
        Postulacion postulacion = request.getPostulacion();
        try {
            return ResponseEntity.ok(postulacionService.crearPostulacion(postulacion, request.getCandidato()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    //FUNCIONA  
    // para asociar manual, pero no hace falta
    @PostMapping("/asociar-candidato")
    public ResponseEntity<?> asociarCandidatoAPostulacion(@RequestBody Map<String, String> datos) {
        String candidatoId = datos.get("candidatoId");
        String busquedaId = datos.get("busquedaId");
    
        System.out.println("🟡 Recibido candidatoId: " + candidatoId + ", busquedaId: " + busquedaId);
    
        if (candidatoId == null || busquedaId == null) {
            return ResponseEntity.badRequest().body("Faltan parámetros obligatorios.");
        }
    
        try {
            return ResponseEntity.ok(postulacionService.asociarCandidatoABusqueda(candidatoId, busquedaId));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace(); // 👈 imprimí el error completo
            return ResponseEntity.status(500).body("Error interno: " + ex.getMessage());
        }
    }
    
    

    //FUNCIONA
    @GetMapping("/mis-postulaciones")
    public ResponseEntity<Page<Postulacion>> obtenerMisPostulaciones(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fase
    ) {
        return ResponseEntity.ok(
                postulacionService.obtenerPostulacionesDelReclutador(usuario.getId(), page, size, estado, fase)
        );
    }
    //FUNCIONA
    @GetMapping("/{id}")
    public ResponseEntity<Postulacion> obtenerPostulacion(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> postulacion = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        return postulacion.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(403).build());
    }


    //FUNCIONA
    @GetMapping("/candidato/{candidatoId}")
    public ResponseEntity<List<Postulacion>> obtenerPostulacionesPorCandidato(@PathVariable String candidatoId) {
        return ResponseEntity.ok(postulacionService.obtenerPostulacionesPorCandidato(candidatoId));
    }

        //FUNCIONA
    @GetMapping("/busqueda/{busquedaId}")
    public ResponseEntity<List<Postulacion>> obtenerPostulacionesPorBusqueda(
            @PathVariable String busquedaId,
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fase
    ) {
        return ResponseEntity.ok(postulacionService.obtenerPostulacionesPorBusquedaYUsuario(busquedaId, usuario.getId(), estado, fase));
    }

    // no probe de aca para abajo
    @PatchMapping("/{id}/fase")
    public ResponseEntity<Postulacion> actualizarFasePostulacion(
            @PathVariable String id,
            @RequestParam String nuevaFase,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(postulacionService.actualizarFase(id, nuevaFase));
    }
    //ACTUALIZA EL ESTADO DE LA POSTULACION
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Postulacion> actualizarEstadoPostulacion(
            @PathVariable String id,
            @RequestParam String nuevoEstado,
            @RequestParam(required = false) String motivo,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(postulacionService.actualizarEstado(id, nuevoEstado, motivo));
    }
    //AGREGA UNA ANOTACION PRIVADA A LA POSTULACION
    @PostMapping("/{id}/anotacion")
    public ResponseEntity<Postulacion> agregarAnotacionPrivada(
            @PathVariable String id,
            @RequestBody String comentario,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();
        AnotacionPrivada anotacion = AnotacionPrivada.builder()
                .usuarioId(usuario.getId())
                .comentario(comentario)
                .fecha(new Date())
                .build();
        return ResponseEntity.ok(postulacionService.agregarAnotacionPrivada(id, anotacion));
    }

    // RECHAZA AL CANDIDATO PERO NO ELIMINA LA POSTULACION
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<Postulacion> rechazarPostulacion(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(postulacionService.actualizarEstado(id, "RECHAZADA", "Rechazado por el reclutador"));
    }

    // ELIMINA LA POSTULACION   
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPostulacion(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();
        postulacionService.eliminarPostulacion(id);
        return ResponseEntity.ok().build();
    }
}
