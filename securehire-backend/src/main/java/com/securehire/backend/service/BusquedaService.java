package com.securehire.backend.service;

import com.securehire.backend.model.Busqueda;
import com.securehire.backend.repository.BusquedaRepository;
import com.securehire.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageImpl;
import java.util.List;  
import java.util.ArrayList;
import java.util.Optional;
import java.util.Date;
import org.springframework.security.core.context.SecurityContextHolder;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.exception.UnauthorizedException; 
import java.util.NoSuchElementException;

@Service
public class BusquedaService {
    @Autowired
    private BusquedaRepository busquedaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Busqueda crearBusqueda(Busqueda busqueda) {
        busqueda.setFechaCreacion(new Date());
        busqueda.setArchivada(false);
    
        // 1. Guardar sin URL para obtener el ID generado
        Busqueda guardada = busquedaRepository.save(busqueda);
    
        // 2. Ahora que tenemos el ID, generamos la URL
        String url = "http://localhost:3000/ofertas/" + guardada.getId();
        guardada.setUrlPublica(url);
    
        // 3. Guardar nuevamente con la URL ya seteada
        guardada = busquedaRepository.save(guardada);
    
        // Log de confirmación
        System.out.println("🔗 URL Pública generada: " + url);
    
        // 4. Asociar al usuario
        Optional<Usuario> optUsuario = usuarioRepository.findById(guardada.getUsuarioId());
        if (optUsuario.isPresent()) {
            Usuario usuario = optUsuario.get();
    
            if (usuario.getPuestosPublicados() == null) {
                usuario.setPuestosPublicados(new ArrayList<>());
            }
    
            usuario.getPuestosPublicados().add(guardada.getId());
    
            usuarioRepository.save(usuario);
            System.out.println("✅ Usuario actualizado con nueva búsqueda.");
        } else {
            System.out.println("❌ Usuario no encontrado con ID: " + guardada.getUsuarioId());
        }
    
        return guardada;
    }
    
    
    
    

    public Optional<Busqueda> obtenerBusquedaPorId(String id) {
        try {
            if (id == null || id.trim().isEmpty()) {
                throw new IllegalArgumentException("El ID de la búsqueda no puede ser nulo o vacío");
            }
        return busquedaRepository.findById(id);
        } catch (Exception e) {
            System.err.println("Error al obtener búsqueda por ID: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al acceder a la base de datos", e);
        }
    }

    public List<Busqueda> obtenerBusquedasPorUsuario(
        String usuarioId, 
        Boolean archivada, 
        String titulo, 
        Date fechaDesde, 
        Date fechaHasta
    ) {
        return busquedaRepository.findByUsuarioId(usuarioId) // ya filtra internamente
            .stream()
            .filter(b -> archivada == null || b.isArchivada() == archivada)
            .filter(b -> titulo == null || b.getTitulo().toLowerCase().contains(titulo.toLowerCase()))
            .filter(b -> fechaDesde == null || (b.getFechaCreacion() != null && !b.getFechaCreacion().before(fechaDesde)))
            .filter(b -> fechaHasta == null || (b.getFechaCreacion() != null && !b.getFechaCreacion().after(fechaHasta)))
            .toList();
    }

    public List<Busqueda> obtenerBusquedasPorUsuarioYArchivada(String usuarioId, boolean archivada) {
        return busquedaRepository.findByUsuarioIdAndArchivada(usuarioId, archivada);
    }

    public List<Busqueda> buscarPorTituloYUsuario(String titulo, String usuarioId) {
        return busquedaRepository.findByTituloContainingIgnoreCaseAndUsuarioId(titulo, usuarioId);
    }
    

    public Page<Busqueda> obtenerBusquedasPorUsuarioPaginadas(String usuarioId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return busquedaRepository.findByUsuarioId(usuarioId, pageable);
    }
    

    public Busqueda actualizarBusqueda(Busqueda busqueda) {
        return busquedaRepository.save(busqueda);
    }

    public Busqueda cambiarEstadoArchivado(String id, boolean archivar) {
        Busqueda busqueda = busquedaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Búsqueda no encontrada"));

        String emailAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();

        Usuario usuario = usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        if (!busqueda.getUsuarioId().equals(usuario.getId())) {
            throw new UnauthorizedException("No tenés permiso para modificar esta búsqueda");
        }

        busqueda.setArchivada(archivar);
        return busquedaRepository.save(busqueda);
    }

    public void eliminarBusqueda(String id, Usuario usuarioAutenticado) {
        Busqueda busqueda = busquedaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Búsqueda no encontrada"));
    
        // Validación fuerte: no dejar borrar si no hay usuario asignado o si no es el dueño
        if (busqueda.getUsuarioId() == null || !busqueda.getUsuarioId().equals(usuarioAutenticado.getId())) {
            throw new UnauthorizedException("No tenés permiso para eliminar esta búsqueda");
        }
    
        busquedaRepository.deleteById(id);
    }
    
    

    public Page<Busqueda> obtenerBusquedasPaginadasPorUsuario(
        String usuarioId,
        int page,
        int size,
        Boolean archivada,
        String titulo,
        Date fechaDesde,
        Date fechaHasta
    ) {
        Pageable pageable = PageRequest.of(page, size);

        List<Busqueda> todas = busquedaRepository.findByUsuarioId(usuarioId);

        List<Busqueda> filtradas = todas.stream()
                .filter(b -> archivada == null || b.isArchivada() == archivada)
                .filter(b -> titulo == null || b.getTitulo().toLowerCase().contains(titulo.toLowerCase()))
                .filter(b -> fechaDesde == null || (b.getFechaCreacion() != null && !b.getFechaCreacion().before(fechaDesde)))
                .filter(b -> fechaHasta == null || (b.getFechaCreacion() != null && !b.getFechaCreacion().after(fechaHasta)))
                .toList();

        int start = page * size;
        int end = Math.min(start + size, filtradas.size());
        List<Busqueda> pageContent = start >= filtradas.size() ? List.of() : filtradas.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filtradas.size());
    }


}
