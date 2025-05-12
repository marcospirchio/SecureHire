package com.securehire.backend.repository;

import com.securehire.backend.model.Candidato;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatoRepository extends MongoRepository<Candidato, String> {
    Optional<Candidato> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Candidato> findByDni(String dni);
    List<Candidato> findByNombreContainingIgnoreCase(String nombre);

    @Query("{'historial.puestoId': ?0}")
    List<Candidato> findByHistorialPuestoId(String puestoId);

    List<Candidato> findByReputacion(double reputacion);

    @Query("{'historial.puestoId': ?0, 'reputacion': ?1}")
    List<Candidato> findByHistorialPuestoIdAndReputacion(String puestoId, double reputacion);  

    Page<Candidato> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
    List<Candidato> findByNombreContainingIgnoreCaseAndIdIn(String nombre, List<String> ids);

    Page<Candidato> findByIdIn(List<String> ids, Pageable pageable);
    
    Optional<Candidato> findByIdAndIdIn(String id, List<String> ids);
    
}