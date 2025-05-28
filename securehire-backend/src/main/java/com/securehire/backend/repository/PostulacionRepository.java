package com.securehire.backend.repository;

import com.securehire.backend.model.Postulacion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;

import java.util.List;

@Repository
public interface PostulacionRepository extends MongoRepository<Postulacion, String> {
    List<Postulacion> findByCandidatoId(String candidatoId);
    List<Postulacion> findByBusquedaId(String busquedaId);
    List<Postulacion> findByEstado(String estado);
    List<Postulacion> findByFaseActual(String faseActual);
    List<Postulacion> findByBusquedaIdAndFaseActualAndEstado(String busquedaId, String faseActual, String estado);
    List<Postulacion> findByBusquedaIdAndFaseActual(String busquedaId, String faseActual);
    List<Postulacion> findByBusquedaIdAndEstado(String busquedaId, String estado);
    List<Postulacion> findByCandidatoIdAndBusquedaIdAndEstado(String candidatoId, String busquedaId, String estado);
    Page<Postulacion> findByCandidatoId(String candidatoId, Pageable pageable);
    List<Postulacion> findByUsuarioId(String usuarioId); 
    Page<Postulacion> findByUsuarioId(String usuarioId, Pageable pageable);
    Page<Postulacion> findByUsuarioIdAndEstado(String usuarioId, String estado, Pageable pageable);
    Page<Postulacion> findByUsuarioIdAndFaseActual(String usuarioId, String fase, Pageable pageable);
    Page<Postulacion> findByUsuarioIdAndEstadoAndFaseActual(String usuarioId, String estado, String fase, Pageable pageable);

    boolean existsByCandidatoIdAndBusquedaId(String candidatoId, String busquedaId);

    @Aggregation(pipeline = {
        "{ $group: { _id: '$busquedaId', cantidad: { $sum: 1 } } }"
    })
    List<org.bson.Document> contarPostulacionesPorBusqueda();

    int countByBusquedaId(String busquedaId);

    long countByBusquedaIdAndEstadoNot(String busquedaId, String estado);


    List<Postulacion> findByBusquedaIdAndEstadoNot(String busquedaId, String estado);
}
