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
import java.text.SimpleDateFormat;      
import java.util.TimeZone;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/calendario")
public class EventoCalendarioController {
    @Autowired
    private EventoCalendarioService eventoCalendarioService;

    @GetMapping("/eventos")
    public ResponseEntity<List<EventoCalendario>> obtenerEventos(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fin
    ) {
        String usuarioId = usuario.getId();
        List<EventoCalendario> eventos;
        Date fechaInicio = null;
        Date fechaFin = null;
    
        try {
            if (inicio != null && fin != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
    
                OffsetDateTime odtInicio = OffsetDateTime.parse(inicio, formatter);
                OffsetDateTime odtFin = OffsetDateTime.parse(fin, formatter);
    
                fechaInicio = Date.from(odtInicio.toInstant());
                fechaFin = Date.from(odtFin.toInstant());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    
        if (tipo != null && fechaInicio != null && fechaFin != null) {
            eventos = eventoCalendarioService.obtenerEventosPorUsuarioYTipoYRangoFechas(usuarioId, tipo, fechaInicio, fechaFin);
        } else if (tipo != null) {
            eventos = eventoCalendarioService.obtenerEventosPorUsuarioYTipo(usuarioId, tipo);
        } else if (fechaInicio != null && fechaFin != null) {
            eventos = eventoCalendarioService.obtenerEventosPorUsuarioYRangoFechas(usuarioId, fechaInicio, fechaFin);
        } else {
            eventos = eventoCalendarioService.obtenerEventosPorUsuario(usuarioId);
        }
    
        return ResponseEntity.ok(eventos);
    }

    @PostMapping("/eventos")
    public ResponseEntity<EventoCalendario> crearEvento(
            @RequestBody EventoCalendario evento,
            @AuthenticationPrincipal Usuario usuario
    ) {
        evento.setUsuarioId(usuario.getId()); 
        evento.setCreadoEn(new Date());       
        return ResponseEntity.ok(eventoCalendarioService.crearEvento(evento));
    }
    

    @DeleteMapping("/eventos/{id}")
    public ResponseEntity<Void> eliminarEvento(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
    Optional<EventoCalendario> eventoOpt = eventoCalendarioService.obtenerEventoPorId(id);

    if (eventoOpt.isEmpty() || !eventoOpt.get().getUsuarioId().equals(usuario.getId())) {
        return ResponseEntity.notFound().build();
    }

    eventoCalendarioService.eliminarEvento(id);
    return ResponseEntity.ok().build();
    }

} 