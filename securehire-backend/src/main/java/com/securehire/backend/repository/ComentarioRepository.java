package com.securehire.backend.repository;

import com.securehire.backend.model.Comentario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends MongoRepository<Comentario, String> {
    List<Comentario> findByCandidatoId(String candidatoId);
    List<Comentario> findByUsuarioId(String usuarioId);
    List<Comentario> findByCandidatoIdAndUsuarioId(String candidatoId, String usuarioId);
} 