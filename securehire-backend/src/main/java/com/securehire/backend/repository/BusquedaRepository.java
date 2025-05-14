package com.securehire.backend.repository;

import com.securehire.backend.model.Busqueda;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface BusquedaRepository extends MongoRepository<Busqueda, String> {
    List<Busqueda> findByUsuarioId(String usuarioId);
    //List<Busqueda> findByUsuarioIdAndArchivadaFalse(String usuarioId)   ;
    List<Busqueda> findByTituloContainingIgnoreCase(String titulo);
    List<Busqueda> findByUsuarioIdAndArchivada(String usuarioId, boolean archivada);
    Page<Busqueda> findByUsuarioId(String usuarioId, Pageable pageable);
    Page<Busqueda> findByUsuarioIdAndArchivada(String usuarioId, Boolean archivada, Pageable pageable);
    Page<Busqueda> findByUsuarioIdAndTituloContainingIgnoreCase(String usuarioId, String titulo, Pageable pageable);
    Page<Busqueda> findByUsuarioIdAndArchivadaAndTituloContainingIgnoreCase(String usuarioId, Boolean archivada, String titulo, Pageable pageable);
    List<Busqueda> findByTituloContainingIgnoreCaseAndUsuarioId(String titulo, String usuarioId);

} 

