package com.securehire.backend.service;

import com.securehire.backend.dto.CandidatoDTO;
import com.securehire.backend.dto.CandidatoConComentariosDTO;
import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.model.Comentario;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.repository.BusquedaRepository;
import com.securehire.backend.repository.CandidatoRepository;
import com.securehire.backend.repository.ComentarioRepository;
import com.securehire.backend.repository.PostulacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CandidatoService {

    @Autowired private CandidatoRepository candidatoRepository;
    @Autowired private ComentarioRepository comentarioRepository;
    @Autowired private PostulacionRepository postulacionRepository;
    @Autowired private BusquedaRepository busquedaRepository;
    public Candidato crearCandidato(CandidatoDTO dto) {
        Optional<Candidato> porEmail = candidatoRepository.findByEmail(dto.getEmail());
        Optional<Candidato> porDni = candidatoRepository.findByDni(dto.getDni());
    
        Candidato existente = porEmail.orElse(porDni.orElse(null));
    
        if (existente == null) {
            // ⚠️ Validar que haya CV
            if (dto.getCvUrl() == null || dto.getCvUrl().isBlank()) {
                throw new IllegalArgumentException("El CV (cvUrl) es obligatorio para postularse.");
            }
    
            Candidato nuevo = Candidato.builder()
                    .nombre(dto.getNombre())
                    .apellido(dto.getApellido())
                    .email(dto.getEmail())
                    .telefono(dto.getTelefono())
                    .dni(dto.getDni())
                    .codigoPais(dto.getCodigoPais())
                    .fechaNacimiento(dto.getFechaNacimiento())
                    .genero(dto.getGenero())
                    .nacionalidad(dto.getNacionalidad())
                    .paisResidencia(dto.getPaisResidencia())
                    .provincia(dto.getProvincia())
                    .direccion(dto.getDireccion())
                    .cvUrl(dto.getCvUrl()) // <- ¡Esto es clave!
                    .reputacion(null)
                    .tiempoRespuesta(null)
                    .comentarioIds(new ArrayList<>())
                    .historialEntrevistas(new ArrayList<>())
                    .fechaRegistro(new Date())
                    .build();
    
            return candidatoRepository.save(nuevo);
    
        } else {
            copiarDatosPersonalesDesdeDto(dto, existente);
    
            if (dto.getCvUrl() != null && !dto.getCvUrl().isBlank()) {
                existente.setCvUrl(dto.getCvUrl());
            }
    
            if (existente.getComentarioIds() == null) existente.setComentarioIds(new ArrayList<>());
            if (existente.getHistorialEntrevistas() == null) existente.setHistorialEntrevistas(new ArrayList<>());
            return candidatoRepository.save(existente);
        }
    }
    
    private void copiarDatosPersonalesDesdeDto(CandidatoDTO dto, Candidato destino) {
        destino.setNombre(dto.getNombre());
        destino.setApellido(dto.getApellido());
        destino.setEmail(dto.getEmail());
        destino.setTelefono(dto.getTelefono());
        destino.setDni(dto.getDni());
        destino.setFechaNacimiento(dto.getFechaNacimiento());
        destino.setGenero(dto.getGenero());
        destino.setNacionalidad(dto.getNacionalidad());
        destino.setPaisResidencia(dto.getPaisResidencia());
        destino.setProvincia(dto.getProvincia());
        destino.setDireccion(dto.getDireccion());
    }
    

    public boolean existeCandidatoConEmail(String email) {
        return candidatoRepository.findByEmail(email).isPresent();
    }

    public Optional<Candidato> obtenerCandidatoPorId(String id) {
        return candidatoRepository.findById(id);
    }

    public Optional<Candidato> obtenerCandidatoPorEmail(String email) {
        return candidatoRepository.findByEmail(email);
    }

    public List<Candidato> buscarPorNombre(String nombre) {
        return candidatoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Optional<Candidato> obtenerCandidatoPorIdParaReclutador(String candidatoId, String usuarioId) {
        List<Postulacion> postulaciones = postulacionRepository.findByCandidatoId(candidatoId);
    
        for (Postulacion p : postulaciones) {
            Optional<Busqueda> busquedaOpt = busquedaRepository.findById(p.getBusquedaId());
            if (busquedaOpt.isPresent() && busquedaOpt.get().getUsuarioId().equals(usuarioId)) {
                return candidatoRepository.findById(candidatoId);
            }
        }
    
        return Optional.empty(); // No se encontró ninguna postulación válida
    }
    

    public List<Candidato> buscarPorNombreParaReclutador(String nombre, String usuarioId) {
        Set<String> idsPermitidos = obtenerIdsCandidatosDeReclutador(usuarioId);
        List<Candidato> candidatos = candidatoRepository.findByNombreContainingIgnoreCase(nombre);
        candidatos.removeIf(c -> !idsPermitidos.contains(c.getId()));
        return candidatos;
    }

    public Optional<CandidatoConComentariosDTO> obtenerCandidatoConComentariosParaReclutador(String id, String usuarioId) {
        Optional<Candidato> candidatoOpt = obtenerCandidatoPorIdParaReclutador(id, usuarioId);
        if (candidatoOpt.isEmpty()) return Optional.empty();

        Candidato candidato = candidatoOpt.get();
        List<Comentario> comentarios = new ArrayList<>();
        if (candidato.getComentarioIds() != null) {
            for (String comentarioId : candidato.getComentarioIds()) {
                comentarioRepository.findById(comentarioId).ifPresent(comentarios::add);
            }
        }
        return Optional.of(new CandidatoConComentariosDTO(candidato, comentarios));
    }

    public Page<Candidato> obtenerCandidatosFiltradosPorReclutador(String usuarioId, int page, int size, String nombre) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaRegistro").descending());
        Set<String> idsPermitidos = obtenerIdsCandidatosDeReclutador(usuarioId);

        Page<Candidato> todos;
        if (nombre != null && !nombre.isEmpty()) {
            todos = candidatoRepository.findByNombreContainingIgnoreCase(nombre, pageable);
        } else {
            todos = candidatoRepository.findAll(pageable);
        }

        List<Candidato> filtrados = new ArrayList<>();
        for (Candidato c : todos) {
            if (idsPermitidos.contains(c.getId())) filtrados.add(c);
        }

        return new PageImpl<>(filtrados, pageable, filtrados.size());
    }

    public Candidato actualizarCandidato(Candidato candidato) {
        return candidatoRepository.save(candidato);
    }

    public boolean eliminarCandidatoParaReclutador(String candidatoId, String usuarioId) {
        boolean tieneAcceso = postulacionRepository.existsByCandidatoIdAndBusquedaId(candidatoId, usuarioId);
        if (!tieneAcceso) return false;
        candidatoRepository.deleteById(candidatoId);
        return true;
    }

    private Set<String> obtenerIdsCandidatosDeReclutador(String usuarioId) {
        List<Postulacion> postulaciones = postulacionRepository.findByUsuarioId(usuarioId);
        Set<String> ids = new HashSet<>();
        for (Postulacion p : postulaciones) {
            ids.add(p.getCandidatoId());
        }
        return ids;
    }

    public Optional<CandidatoConComentariosDTO> obtenerCandidatoConComentarios(String id) {
        Optional<Candidato> candidatoOpt = candidatoRepository.findById(id);
        if (candidatoOpt.isEmpty()) return Optional.empty();

        Candidato candidato = candidatoOpt.get();
        List<Comentario> comentarios = new ArrayList<>();

        if (candidato.getComentarioIds() != null) {
            for (String comentarioId : candidato.getComentarioIds()) {
                comentarioRepository.findById(comentarioId).ifPresent(comentarios::add);
            }
        }

        return Optional.of(new CandidatoConComentariosDTO(candidato, comentarios));
    }
}