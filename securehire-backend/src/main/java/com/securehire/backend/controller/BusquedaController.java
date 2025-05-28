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
    public ResponseEntity<List<Busqueda>> obtenerTodasLasBusquedasDelUsuario(
        @AuthenticationPrincipal Usuario usuario,
        @RequestParam(required = false) Boolean archivada,
        @RequestParam(required = false) String titulo,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date fechaHasta
) {
    List<Busqueda> resultado = busquedaService.obtenerBusquedasPorUsuario(
        usuario.getId(), archivada, titulo, fechaDesde, fechaHasta
    );
    return ResponseEntity.ok(resultado);
}

    @GetMapping("/{id}")
    public ResponseEntity<Busqueda> obtenerBusqueda(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(id);

            if (busquedaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Busqueda busqueda = busquedaOpt.get();
            
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (!busqueda.getUsuarioId().equals(usuario.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(busqueda);
        } catch (Exception e) {
            System.err.println("Error al obtener búsqueda: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

}