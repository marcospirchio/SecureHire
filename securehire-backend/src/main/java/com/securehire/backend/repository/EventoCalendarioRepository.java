package com.securehire.backend.repository;

import com.securehire.backend.model.EventoCalendario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface EventoCalendarioRepository extends MongoRepository<EventoCalendario, String> {
    List<EventoCalendario> findByUsuarioId(String usuarioId);
    List<EventoCalendario> findByUsuarioIdAndFechaHoraBetween(String usuarioId, Date desde, Date hasta);
    List<EventoCalendario> findByUsuarioIdAndTipo(String usuarioId, String tipo);
    List<EventoCalendario> findByUsuarioIdAndTipoAndFechaHoraBetween(String usuarioId, String tipo, Date desde, Date hasta);
} 