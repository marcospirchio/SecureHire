package com.securehire.backend.service;

import com.securehire.backend.dto.ConteoPostulacionesDTO;
import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.repository.CandidatoRepository;
import com.securehire.backend.repository.PostulacionRepository;
import com.securehire.backend.repository.BusquedaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.bson.Document;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperationContext;
import org.springframework.data.mongodb.core.aggregation.AggregationOperationContext;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class PostulacionService {

    @Autowired
    private PostulacionRepository postulacionRepository;

    @Autowired
    private CandidatoRepository candidatoRepository;

    @Autowired
    private BusquedaRepository busquedaRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Postulacion crearPostulacion(Postulacion postulacion, Candidato candidatoDatos) {
        Optional<Candidato> candidatoOpt = candidatoRepository.findByEmail(candidatoDatos.getEmail());
        if (candidatoOpt.isEmpty()) {
            candidatoOpt = candidatoRepository.findByDni(candidatoDatos.getDni());
        }

        Candidato candidato = candidatoOpt.orElseGet(() -> {
            candidatoDatos.setFechaRegistro(new Date());
            return candidatoRepository.save(candidatoDatos);
        });

        if (postulacionRepository.existsByCandidatoIdAndBusquedaId(candidato.getId(), postulacion.getBusquedaId())) {
            throw new IllegalStateException("El candidato ya está postulado a esta búsqueda");
        }

        busquedaRepository.findById(postulacion.getBusquedaId()).ifPresentOrElse(
            busqueda -> postulacion.setUsuarioId(busqueda.getUsuarioId()),
            () -> {
                throw new IllegalStateException("La búsqueda asociada no existe");
            }
        );

        postulacion.setCandidatoId(candidato.getId());
        postulacion.setFechaPostulacion(new Date());
        postulacion.setEstado("pendiente");
        postulacion.setFaseActual("inicial");

        return postulacionRepository.save(postulacion);
    }

    public String asociarCandidatoABusqueda(String candidatoId, String busquedaId) {
        Optional<Candidato> candidatoOpt = candidatoRepository.findById(candidatoId);
        if (candidatoOpt.isEmpty()) {
            throw new IllegalArgumentException("El candidato no existe.");
        }

        if (postulacionRepository.existsByCandidatoIdAndBusquedaId(candidatoId, busquedaId)) {
            throw new IllegalStateException("El candidato ya está postulado a esta búsqueda.");
        }

        Postulacion postulacion = Postulacion.builder()
                .candidatoId(candidatoId)
                .busquedaId(busquedaId)
                .estado("pendiente")
                .faseActual("inicial")
                .fechaPostulacion(new Date())
                .build();

        postulacionRepository.save(postulacion);
        return "Postulación registrada correctamente.";
    }

    public Optional<Postulacion> obtenerPostulacionPorId(String id) {
        return postulacionRepository.findById(id);
    }

    public Optional<Postulacion> obtenerPostulacionSiPerteneceAUsuario(String id, String usuarioId) {
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(id);
        if (postulacionOpt.isPresent()) {
            String busquedaId = postulacionOpt.get().getBusquedaId();
            Optional<Busqueda> busquedaOpt = busquedaRepository.findById(busquedaId);
            if (busquedaOpt.isPresent() && busquedaOpt.get().getUsuarioId().equals(usuarioId)) {
                return postulacionOpt;
            }
        }
        return Optional.empty();
    }

    public Page<Postulacion> obtenerPostulacionesDelReclutador(String usuarioId, int page, int size, String estado, String fase) {
        Pageable pageable = PageRequest.of(page, size);

        if (fase != null && !Postulacion.Fase.isValid(fase)) {
            throw new IllegalArgumentException("Fase inválida");
        }
        if (estado != null && !Postulacion.Estado.isValid(estado)) {
            throw new IllegalArgumentException("Estado inválido");
        }

        if (estado != null && fase != null) {
            return postulacionRepository.findByUsuarioIdAndEstadoAndFaseActual(usuarioId, estado, fase, pageable);
        } else if (estado != null) {
            return postulacionRepository.findByUsuarioIdAndEstado(usuarioId, estado, pageable);
        } else if (fase != null) {
            return postulacionRepository.findByUsuarioIdAndFaseActual(usuarioId, fase, pageable);
        } else {
            return postulacionRepository.findByUsuarioId(usuarioId, pageable);
        }
    }

    public List<Postulacion> obtenerPostulacionesPorCandidato(String candidatoId) {
        return postulacionRepository.findByCandidatoId(candidatoId);
    }

    public List<Postulacion> obtenerPostulacionesPorBusquedaYUsuario(String busquedaId, String usuarioId, String estado, String fase) {
        Optional<Busqueda> busquedaOpt = busquedaRepository.findById(busquedaId);
        if (busquedaOpt.isPresent() && busquedaOpt.get().getUsuarioId().equals(usuarioId)) {
            return obtenerPostulacionesPorBusqueda(busquedaId, fase, estado);
        }
        return List.of();
    }

    public List<Postulacion> obtenerPostulacionesPorBusqueda(String busquedaId, String fase, String estado) {
        if (fase != null && !Postulacion.Fase.isValid(fase)) {
            throw new IllegalArgumentException("Fase inválida");
        }
        if (estado != null && !Postulacion.Estado.isValid(estado)) {
            throw new IllegalArgumentException("Estado inválido");
        }

        if (fase != null && estado != null) {
            return postulacionRepository.findByBusquedaIdAndFaseActualAndEstado(busquedaId, fase, estado);
        } else if (fase != null) {
            return postulacionRepository.findByBusquedaIdAndFaseActual(busquedaId, fase);
        } else if (estado != null) {
            return postulacionRepository.findByBusquedaIdAndEstado(busquedaId, estado);
        } else {
            return postulacionRepository.findByBusquedaId(busquedaId);
        }
    }

    public Page<Postulacion> obtenerTodasPostulaciones(Pageable pageable) {
        return postulacionRepository.findAll(pageable);
    }

    public Postulacion actualizarPostulacion(Postulacion postulacion) {
        return postulacionRepository.save(postulacion);
    }

    public void eliminarPostulacion(String id) {
        postulacionRepository.deleteById(id);
    }

    public boolean perteneceAlUsuario(String postulacionId, String usuarioId) {
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(postulacionId);
        if (postulacionOpt.isPresent()) {
            String busquedaId = postulacionOpt.get().getBusquedaId();
            Optional<Busqueda> busquedaOpt = busquedaRepository.findById(busquedaId);
            return busquedaOpt.map(busqueda -> busqueda.getUsuarioId().equals(usuarioId)).orElse(false);
        }
        return false;
    }

    public Postulacion actualizarFase(String id, String nuevaFase) {
        if (!Postulacion.Fase.isValid(nuevaFase)) {
            throw new IllegalArgumentException("Fase inválida");
        }
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(id);
        if (postulacionOpt.isPresent()) {
            Postulacion postulacion = postulacionOpt.get();
            postulacion.setFaseActual(nuevaFase);
            return postulacionRepository.save(postulacion);
        }
        return null;
    }

    public Postulacion actualizarEstado(String id, String nuevoEstado, String motivo) {
        if (!Postulacion.Estado.isValid(nuevoEstado)) {
            throw new IllegalArgumentException("Estado inválido");
        }
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(id);
        if (postulacionOpt.isPresent()) {
            Postulacion postulacion = postulacionOpt.get();
            postulacion.setEstado(nuevoEstado);
            postulacion.setMotivoFinalizacion(motivo);
            return postulacionRepository.save(postulacion);
        }
        return null;
    }

    public Postulacion agregarAnotacionPrivada(String id, Postulacion.AnotacionPrivada anotacion) {
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(id);
        if (postulacionOpt.isPresent()) {
            Postulacion postulacion = postulacionOpt.get();
            postulacion.getAnotacionesPrivadas().add(anotacion);
            return postulacionRepository.save(postulacion);
        }
        return null;
    }

    
    public List<ConteoPostulacionesDTO> obtenerConteoPorBusqueda(String usuarioId) {
        List<Busqueda> busquedas = busquedaRepository.findByUsuarioId(usuarioId);
        List<ConteoPostulacionesDTO> resultado = new ArrayList<>();
    
        for (Busqueda b : busquedas) {
            List<Postulacion> postulaciones = postulacionRepository.findByBusquedaId(b.getId());
            long cantidad = postulaciones.stream()
                .filter(p -> !"FINALIZADA".equalsIgnoreCase(p.getEstado()))
                .count();
            resultado.add(new ConteoPostulacionesDTO(b.getId(), cantidad));
        }
    
        return resultado;
    }
    
    public List<Postulacion> obtenerPorBusqueda(String busquedaId) {
        return postulacionRepository.findByBusquedaId(busquedaId);
    }

    public Postulacion agregarAnotacionPrivada(String postulacionId, String usuarioId, String comentario) {
        Postulacion p = postulacionRepository.findById(postulacionId)
            .orElseThrow(() -> new IllegalArgumentException("Postulación no encontrada"));
    
        if (p.getAnotacionesPrivadas() == null) {
            p.setAnotacionesPrivadas(new ArrayList<>());
        }
    
        Postulacion.AnotacionPrivada anotacion = Postulacion.AnotacionPrivada.builder()
            .usuarioId(usuarioId)
            .comentario(comentario)
            .fecha(new Date())
            .build();
    
        p.getAnotacionesPrivadas().add(anotacion);
        return postulacionRepository.save(p);
    }
    
    public Postulacion editarAnotacionPrivada(String postulacionId, int indice, String usuarioId, String nuevoComentario) {
        Postulacion p = postulacionRepository.findById(postulacionId)
                .orElseThrow(() -> new IllegalArgumentException("Postulación no encontrada"));
    
        if (p.getAnotacionesPrivadas() == null || indice < 0 || indice >= p.getAnotacionesPrivadas().size()) {
            throw new IllegalArgumentException("Índice de anotación inválido");
        }
    
        Postulacion.AnotacionPrivada anotacion = p.getAnotacionesPrivadas().get(indice);
    
        if (!anotacion.getUsuarioId().equals(usuarioId)) {
            throw new IllegalArgumentException("No tenés permiso para editar esta anotación");
        }
    
        anotacion.setComentario(nuevoComentario);
        anotacion.setFecha(new Date()); // opcional: actualizar fecha de edición
    
        return postulacionRepository.save(p);
    }
    
    
    public Postulacion eliminarAnotacionPrivada(String postulacionId, String usuarioId, int index) {
        Postulacion p = postulacionRepository.findById(postulacionId)
            .orElseThrow(() -> new IllegalArgumentException("Postulación no encontrada"));
    
        if (index < 0 || index >= p.getAnotacionesPrivadas().size()) {
            throw new IllegalArgumentException("Índice inválido");
        }
    
        Postulacion.AnotacionPrivada anotacion = p.getAnotacionesPrivadas().get(index);
        if (!anotacion.getUsuarioId().equals(usuarioId)) {
            throw new IllegalArgumentException("No puedes eliminar anotaciones de otros usuarios");
        }
    
        p.getAnotacionesPrivadas().remove(index);
        return postulacionRepository.save(p);
    }
    

}
