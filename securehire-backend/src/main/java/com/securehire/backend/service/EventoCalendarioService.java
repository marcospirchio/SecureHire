package com.securehire.backend.service;

import com.securehire.backend.model.EventoCalendario;
import com.securehire.backend.repository.EventoCalendarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class EventoCalendarioService {
    @Autowired
    private EventoCalendarioRepository eventoCalendarioRepository;

    public EventoCalendario crearEvento(EventoCalendario evento) {
        evento.setCreadoEn(new Date());
        return eventoCalendarioRepository.save(evento);
    }

    public List<EventoCalendario> obtenerEventosPorUsuario(String usuarioId) {
        return eventoCalendarioRepository.findByUsuarioId(usuarioId);
    }

    public List<EventoCalendario> obtenerEventosPorUsuarioYRangoFechas(String usuarioId, Date desde, Date hasta) {
        return eventoCalendarioRepository.findByUsuarioIdAndFechaHoraBetween(usuarioId, desde, hasta);
    }

    public List<EventoCalendario> obtenerEventosPorUsuarioYTipo(String usuarioId, String tipo) {
        return eventoCalendarioRepository.findByUsuarioIdAndTipo(usuarioId, tipo);
    }

    public List<EventoCalendario> obtenerEventosPorUsuarioYTipoYRangoFechas(
            String usuarioId,
            String tipo,
            Date desde,
            Date hasta
    ) {
        return eventoCalendarioRepository.findByUsuarioIdAndTipoAndFechaHoraBetween(usuarioId, tipo, desde, hasta);
    }

    public void eliminarEvento(String id) {
        eventoCalendarioRepository.deleteById(id);
    }

    public Optional<EventoCalendario> obtenerEventoPorId(String id) {
        return eventoCalendarioRepository.findById(id);
    }
} 