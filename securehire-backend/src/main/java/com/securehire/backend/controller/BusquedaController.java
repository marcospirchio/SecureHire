package com.securehire.backend.controller;

import com.securehire.backend.model.Busqueda;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.BusquedaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.NoSuchElementException;
import java.util.List;
import java.util.Optional;
import java.util.Date;
import org.springframework.http.HttpStatus;
import com.securehire.backend.exception.UnauthorizedException;

@RestController
@RequestMapping("/api/busquedas")
public class BusquedaController {

    @Autowired
    private BusquedaService busquedaService;

    @PostMapping
    public ResponseEntity<Busqueda> crearBusqueda(
            @RequestBody Busqueda busqueda,
            @AuthenticationPrincipal Usuario usuario
    ) {
        String usuarioId = usuario.getId(); 
        busqueda.setUsuarioId(usuarioId);
        return ResponseEntity.ok(busquedaService.crearBusqueda(busqueda));
    }

    @GetMapping
    public ResponseEntity<Page<Busqueda>> obtenerBusquedasDelUsuarioPaginadas(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean archivada,
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date fechaHasta
    ) {
        return ResponseEntity.ok(
            busquedaService.obtenerBusquedasPaginadasPorUsuario(
                usuario.getId(), page, size, archivada, titulo, fechaDesde, fechaHasta
            )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Busqueda> obtenerBusqueda(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(id);

        if (busquedaOpt.isPresent()) {
            Busqueda busqueda = busquedaOpt.get();
            if (busqueda.getUsuarioId().equals(usuario.getId())) {
                return ResponseEntity.ok(busqueda);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Busqueda>> buscarPorTitulo(
            @RequestParam String titulo,
            @AuthenticationPrincipal Usuario usuario
    ) {
        List<Busqueda> resultados = busquedaService.buscarPorTituloYUsuario(titulo, usuario.getId());
        return ResponseEntity.ok(resultados);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Busqueda> actualizarBusqueda(
            @PathVariable String id,
            @RequestBody Busqueda busqueda
    ) {
        if (!busquedaService.obtenerBusquedaPorId(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        busqueda.setId(id);
        return ResponseEntity.ok(busquedaService.actualizarBusqueda(busqueda));
    }

    @PatchMapping("/{id}/archivar")
    public ResponseEntity<Busqueda> cambiarEstadoArchivado(
            @PathVariable String id,
            @RequestParam boolean archivar
    ) {
        try {
            Busqueda busqueda = busquedaService.cambiarEstadoArchivado(id, archivar);
            return ResponseEntity.ok(busqueda);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarBusqueda(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        try {
            busquedaService.eliminarBusqueda(id, usuario);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    // // NUEVO: Agregar una fase a la búsqueda
    // @PatchMapping("/{id}/agregar-fase")
    // public ResponseEntity<?> agregarFase(
    //         @PathVariable String id,
    //         @RequestParam String nuevaFase,
    //         @AuthenticationPrincipal Usuario usuario
    // ) {
    //     Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(id);

    //     if (busquedaOpt.isEmpty()) return ResponseEntity.notFound().build();

    //     Busqueda busqueda = busquedaOpt.get();
    //     if (!busqueda.getUsuarioId().equals(usuario.getId())) {
    //         return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    //     }

    //     if (busqueda.getFases() == null) {
    //         busqueda.setFases(new java.util.ArrayList<>());
    //     }

    //     if (!busqueda.getFases().contains(nuevaFase)) {
    //         busqueda.getFases().add(nuevaFase);
    //         busquedaService.actualizarBusqueda(busqueda);
    //     }

    //     return ResponseEntity.ok(busqueda);
    // }

    // // NUEVO: Eliminar una fase de la búsqueda
    // @PatchMapping("/{id}/eliminar-fase")
    // public ResponseEntity<?> eliminarFase(
    //         @PathVariable String id,
    //         @RequestParam String faseAEliminar,
    //         @AuthenticationPrincipal Usuario usuario
    // ) {
    //     Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(id);

    //     if (busquedaOpt.isEmpty()) return ResponseEntity.notFound().build();

    //     Busqueda busqueda = busquedaOpt.get();
    //     if (!busqueda.getUsuarioId().equals(usuario.getId())) {
    //         return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    //     }

    //     if (busqueda.getFases() != null && busqueda.getFases().remove(faseAEliminar)) {
    //         busquedaService.actualizarBusqueda(busqueda);
    //     }

    //     return ResponseEntity.ok(busqueda);
    // }
}