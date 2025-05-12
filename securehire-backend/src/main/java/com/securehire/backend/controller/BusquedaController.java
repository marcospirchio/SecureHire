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

    //(FUNCIONA)
    @PostMapping
    public ResponseEntity<Busqueda> crearBusqueda(
            @RequestBody Busqueda busqueda,
            @AuthenticationPrincipal Usuario usuario
    ) {
        String usuarioId = usuario.getId(); 
        busqueda.setUsuarioId(usuarioId);
        return ResponseEntity.ok(busquedaService.crearBusqueda(busqueda));
    }
    // Obtiene las busquedas del usuario paginadas (FUNCIONA)
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

    


    // @GetMapping("/{id}")
    // public ResponseEntity<Busqueda> obtenerBusqueda(@PathVariable String id) {
    //     Optional<Busqueda> busqueda = busquedaService.obtenerBusquedaPorId(id);
    //     return busqueda.map(ResponseEntity::ok)
    //             .orElseGet(() -> ResponseEntity.notFound().build());
    // }

    
    // lo mismo que el de arriba pero sin paginacion
    // @GetMapping("/mis-busquedas")
    // public ResponseEntity<List<Busqueda>> obtenerBusquedasDelUsuario(
    //         @AuthenticationPrincipal Usuario usuario,
    //         @RequestParam(required = false) Boolean archivada
    // ) {
    //     String usuarioId = usuario.getId();
    //     List<Busqueda> busquedas;
    
    //     if (archivada != null) {
    //         busquedas = busquedaService.obtenerBusquedasPorUsuarioYArchivada(usuarioId, archivada);
    //     } else {
    //         busquedas = busquedaService.obtenerBusquedasPorUsuario(usuarioId);
    //     }
    
    //     return ResponseEntity.ok(busquedas);
    // }
    

    //(FUNCIONA)
    @GetMapping("/buscar")
    public ResponseEntity<List<Busqueda>> buscarPorTitulo(@RequestParam String titulo) {
        return ResponseEntity.ok(busquedaService.buscarPorTitulo(titulo));
    }
    //(FUNCIONA)
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

    //(FUNCIONA)
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

    //(FUNCIONA)
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
