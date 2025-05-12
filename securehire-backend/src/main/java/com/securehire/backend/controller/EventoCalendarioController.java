package com.securehire.backend.controller;

import com.securehire.backend.model.EventoCalendario;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.EventoCalendarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/calendario")
public class EventoCalendarioController {
    @Autowired
    private EventoCalendarioService eventoCalendarioService;

    // ✅ Obtiene eventos del calendario del usuario logueado
    // ✅ Filtra eventos por tipo, rango de fechas o ambos
    @GetMapping("/eventos")
    public ResponseEntity<List<EventoCalendario>> obtenerEventos(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Date inicio,
            @RequestParam(required = false) Date fin
    ) {
    String usuarioId = usuario.getId();
    List<EventoCalendario> eventos;

    if (tipo != null && inicio != null && fin != null) {
        eventos = eventoCalendarioService.obtenerEventosPorUsuarioYTipoYRangoFechas(usuarioId, tipo, inicio, fin);
    } else if (tipo != null) {
        eventos = eventoCalendarioService.obtenerEventosPorUsuarioYTipo(usuarioId, tipo);
    } else if (inicio != null && fin != null) {
        eventos = eventoCalendarioService.obtenerEventosPorUsuarioYRangoFechas(usuarioId, inicio, fin);
    } else {
        eventos = eventoCalendarioService.obtenerEventosPorUsuario(usuarioId);
    }

    return ResponseEntity.ok(eventos);
    }


    // ✅ Crear un nuevo evento en el calendario del usuario logueado
    // ✅ Asigna el usuario logueado y la fecha automática
    @PostMapping("/eventos")
    public ResponseEntity<EventoCalendario> crearEvento(
            @RequestBody EventoCalendario evento,
            @AuthenticationPrincipal Usuario usuario
    ) {
        evento.setUsuarioId(usuario.getId()); // ✅ Asigna el usuario logueado
        evento.setCreadoEn(new Date());       // ✅ Fecha automática
        return ResponseEntity.ok(eventoCalendarioService.crearEvento(evento));
    }
    

    // ✅ Eliminar un evento por su ID
    // ❌ Si no existe o no pertenece al usuario logueado
    @DeleteMapping("/eventos/{id}")
    public ResponseEntity<Void> eliminarEvento(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
    Optional<EventoCalendario> eventoOpt = eventoCalendarioService.obtenerEventoPorId(id);

    // ❌ Si no existe o no pertenece al usuario logueado
    if (eventoOpt.isEmpty() || !eventoOpt.get().getUsuarioId().equals(usuario.getId())) {
        return ResponseEntity.notFound().build();
    }

    eventoCalendarioService.eliminarEvento(id);
    return ResponseEntity.ok().build();
    }

} 