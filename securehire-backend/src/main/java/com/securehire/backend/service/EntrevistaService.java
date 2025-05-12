package com.securehire.backend.service;

import com.securehire.backend.model.Entrevista;
import com.securehire.backend.repository.EntrevistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;    
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class EntrevistaService {
    @Autowired
    private EntrevistaRepository entrevistaRepository;

    public Entrevista crearEntrevista(Entrevista entrevista) {
        return entrevistaRepository.save(entrevista);
    }

    public Optional<Entrevista> obtenerEntrevistaPorId(String id) {
        return entrevistaRepository.findById(id);
    }

    public Entrevista actualizarEntrevista(Entrevista entrevista) {
        return entrevistaRepository.save(entrevista);
    }

    public void eliminarEntrevista(String id) {
        entrevistaRepository.deleteById(id);
    }

    public List<Entrevista> filtrarEntrevistas(
            String estado,
            String usuarioId,
            String candidatoId,
            String postulacionId,
            Date inicio,
            Date fin
    ) {
        return entrevistaRepository.findAll().stream()
                .filter(e -> estado == null || estado.equalsIgnoreCase(e.getEstado()))
                .filter(e -> usuarioId == null || usuarioId.equals(e.getUsuarioId()))
                .filter(e -> candidatoId == null || candidatoId.equals(e.getCandidatoId()))
                .filter(e -> postulacionId == null || postulacionId.equals(e.getPostulacionId()))
                .filter(e -> inicio == null || (e.getFechaProgramada() != null && !e.getFechaProgramada().before(inicio)))
                .filter(e -> fin == null || (e.getFechaProgramada() != null && !e.getFechaProgramada().after(fin)))
                .toList();
    }

    public Page<Entrevista> filtrarEntrevistasPaginadas(
        String usuarioId,
        String estado,
        String candidatoId,
        String postulacionId,
        Date inicio,
        Date fin,
        Pageable pageable
) {
    List<Entrevista> todas = entrevistaRepository.findByUsuarioId(usuarioId);

    List<Entrevista> filtradas = todas.stream()
            .filter(e -> estado == null || estado.equalsIgnoreCase(e.getEstado()))
            .filter(e -> candidatoId == null || candidatoId.equals(e.getCandidatoId()))
            .filter(e -> postulacionId == null || postulacionId.equals(e.getPostulacionId()))
            .filter(e -> inicio == null || (e.getFechaProgramada() != null && !e.getFechaProgramada().before(inicio)))
            .filter(e -> fin == null || (e.getFechaProgramada() != null && !e.getFechaProgramada().after(fin)))
            .toList();

    int start = (int) pageable.getOffset();
    int end = Math.min(start + pageable.getPageSize(), filtradas.size());
    List<Entrevista> content = (start >= filtradas.size()) ? List.of() : filtradas.subList(start, end);

    return new PageImpl<>(content, pageable, filtradas.size());
}

}
