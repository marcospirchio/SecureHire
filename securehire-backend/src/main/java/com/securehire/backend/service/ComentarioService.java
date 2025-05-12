package com.securehire.backend.service;

import com.securehire.backend.model.Comentario;
import com.securehire.backend.repository.ComentarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComentarioService {
    @Autowired
    private ComentarioRepository comentarioRepository;

    public Comentario crearComentario(Comentario comentario) {
        return comentarioRepository.save(comentario);
    }

    public List<Comentario> obtenerComentariosPorCandidato(String candidatoId) {
        return comentarioRepository.findByCandidatoId(candidatoId);
    }

    public List<Comentario> obtenerComentariosPorUsuario(String usuarioId) {
        return comentarioRepository.findByUsuarioId(usuarioId);
    }

    public List<Comentario> obtenerComentariosPorCandidatoYUsuario(String candidatoId, String usuarioId) {
        return comentarioRepository.findByCandidatoIdAndUsuarioId(candidatoId, usuarioId);
    }

    public Optional<Comentario> obtenerComentarioPorId(String id) {
        return comentarioRepository.findById(id);
    }

    public void eliminarComentario(String id) {
        comentarioRepository.deleteById(id);
    }
} 