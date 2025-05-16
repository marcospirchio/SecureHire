package com.securehire.backend.service;

import com.securehire.backend.model.Comentario;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.repository.ComentarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;  
import java.util.List;
import java.util.Optional;


// ESTA CLASE ES FEEDBACK NO COMENTARIO.

@Service
public class ComentarioService {
    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    public Comentario crearComentario(Comentario comentario) {
        comentario.setFecha(new Date());
        
        // Obtener información del reclutador
        usuarioService.obtenerUsuarioPorId(comentario.getUsuarioId())
            .ifPresent(reclutador -> {
                comentario.setNombreReclutador(reclutador.getNombre() + " " + reclutador.getApellido());
                comentario.setEmpresaReclutador(reclutador.getEmpresa());
            });
        
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


    public Comentario actualizarComentario(Comentario comentario) {
        return comentarioRepository.save(comentario);
    }
    
    public void eliminarComentario(String id) {
        comentarioRepository.deleteById(id);
    }
} 