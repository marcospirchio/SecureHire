package com.securehire.backend.repository;

import com.securehire.backend.model.Entrevista;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface EntrevistaRepository extends MongoRepository<Entrevista, String> {
    List<Entrevista> findByCandidatoId(String candidatoId);
    List<Entrevista> findByUsuarioId(String usuarioId);
    List<Entrevista> findByPostulacionId(String postulacionId);
    List<Entrevista> findByFechaProgramadaBetween(Date inicio, Date fin);
    List<Entrevista> findByEstado(String estado);
}

