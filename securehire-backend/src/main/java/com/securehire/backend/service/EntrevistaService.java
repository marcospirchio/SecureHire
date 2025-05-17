package com.securehire.backend.service;

import com.securehire.backend.model.Entrevista;
import com.securehire.backend.repository.EntrevistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;    
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.repository.BusquedaRepository;
import com.securehire.backend.repository.UsuarioRepository;

@Service
public class EntrevistaService {
    @Autowired
    private EntrevistaRepository entrevistaRepository;

    @Autowired
    private BusquedaRepository busquedaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CandidatoService candidatoService;

    @Autowired
    private BusquedaService busquedaService;

    @Autowired
    private ResendEmailService resendEmailService;

    public Entrevista crearEntrevista(Entrevista entrevista) {
        Entrevista creada = entrevistaRepository.save(entrevista);
    
        try {
            var candidato = candidatoService.obtenerCandidatoPorId(creada.getCandidatoId())
                    .orElseThrow(() -> new RuntimeException("Candidato no encontrado"));
            String email = candidato.getEmail();
    
            var busquedaOpt = busquedaRepository.findById(creada.getBusquedaId());
            String nombreProceso = busquedaOpt.map(Busqueda::getTitulo).orElse("Proceso desconocido");
    
            var usuarioOpt = usuarioRepository.findById(creada.getUsuarioId());
            String nombreReclutador = usuarioOpt.map(u -> u.getNombre() + " " + u.getApellido()).orElse("Reclutador desconocido");
            String empresa = usuarioOpt.map(Usuario::getEmpresa).orElse("Empresa desconocida");
    
            // Formatear la fecha
            SimpleDateFormat formatoFecha = new SimpleDateFormat("dd/MM/yyyy HH:mm");
            String fechaFormateada = formatoFecha.format(creada.getFechaProgramada());
    
            // Preparar asunto y mensaje
            String asunto = "Entrevista agendada para el proceso: " + nombreProceso;
            String mensaje = String.format("""
                Estimado/a %s,

                Te confirmamos que has sido convocado/a a una entrevista para el proceso de selección "%s" en %s.

                📅 Fecha y hora: %s  
                🧑 Reclutador asignado: %s  
                🔗 Dirección: Avenida Siempre Viva 123

                Para confirmar tu asistencia, hacé clic en el siguiente enlace:
                👉 https://securehire.com/confirmar-entrevista/%s

                ¡Muchos éxitos!

                Saludos cordiales,  
                Equipo de %s
                """,
                candidato.getNombre(),
                nombreProceso,
                empresa,
                fechaFormateada,
                nombreReclutador,
                creada.getId(), // Usado solo para el link
                empresa
            );

    
            resendEmailService.enviarCorreo(email, asunto, mensaje);
            System.out.println("✅ Correo enviado exitosamente a " + email);
    
        } catch (Exception e) {
            System.out.println("⚠️ No se pudo enviar el correo de entrevista: " + e.getMessage());
        }
    
        return creada;
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
