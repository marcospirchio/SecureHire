package com.securehire.backend.controller;

import com.securehire.backend.dto.ConteoPostulacionesDTO;
import com.securehire.backend.dto.PostulacionRequest;
import com.securehire.backend.dto.AnotacionPrivadaRequest;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.model.Postulacion.AnotacionPrivada;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.AuthService;
import com.securehire.backend.service.PostulacionService;
import com.securehire.backend.service.CandidatoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.repository.BusquedaRepository;
import com.securehire.backend.repository.PostulacionRepository;
import com.securehire.backend.model.Candidato;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.ArrayList;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import java.io.IOException; 
import java.util.Base64;

@RestController
@RequestMapping("/api/postulaciones")
public class PostulacionController {

    @Autowired
    private PostulacionService postulacionService;

    @Autowired
    private AuthService authService;

    @Autowired
    private CandidatoService candidatoService;

    @Autowired
    private BusquedaRepository busquedaRepository;

    @Autowired
    private PostulacionRepository postulacionRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearPostulacion(
            @RequestParam("cv") MultipartFile archivoCV,
            @RequestParam("fotoPerfil") MultipartFile fotoPerfil,
            @RequestParam("busquedaId") String busquedaId,
            @RequestParam("nombre") String nombre,
            @RequestParam("apellido") String apellido,
            @RequestParam("email") String email,
            @RequestParam("telefono") String telefono,
            @RequestParam("dni") String dni,
            @RequestParam("codigoPais") String codigoPais,
            @RequestParam("fechaNacimiento") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date fechaNacimiento,
            @RequestParam("genero") String genero,
            @RequestParam("nacionalidad") String nacionalidad,
            @RequestParam("paisResidencia") String paisResidencia,
            @RequestParam("provincia") String provincia,
            @RequestParam("direccion") String direccion,
            @RequestParam(value = "respuestas", required = false) String respuestasJson
    ) {
        Candidato candidato = Candidato.builder()
                .nombre(nombre)
                .apellido(apellido)
                .email(email)
                .telefono(telefono)
                .dni(dni)
                .codigoPais(codigoPais)
                .fechaNacimiento(fechaNacimiento)
                .genero(genero)
                .nacionalidad(nacionalidad)
                .paisResidencia(paisResidencia)
                .provincia(provincia)
                .direccion(direccion)
                .fechaRegistro(new Date())
                .build();

        List<Postulacion.RespuestaFormulario> respuestas = new ArrayList<>();
        if (respuestasJson != null && !respuestasJson.isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                respuestas = Arrays.asList(mapper.readValue(respuestasJson, Postulacion.RespuestaFormulario[].class));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error al parsear respuestas del formulario");
            }
        }

        Optional<Busqueda> busquedaOpt = busquedaRepository.findById(busquedaId);
        if (busquedaOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("La búsqueda indicada no existe");
        }

        Postulacion postulacion = new Postulacion();
        postulacion.setBusquedaId(busquedaId);
        postulacion.setRespuestas(respuestas);

        try {
            return ResponseEntity.ok(postulacionService.crearPostulacion(postulacion, candidato, archivoCV, fotoPerfil));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    @GetMapping("/{id}/cv")
    public ResponseEntity<byte[]> obtenerCvDePostulacion(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(id);

        if (postulacionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Postulacion postulacion = postulacionOpt.get();

        Optional<Busqueda> busquedaOpt = busquedaRepository.findById(postulacion.getBusquedaId());
        if (busquedaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Busqueda busqueda = busquedaOpt.get();

        if (!busqueda.getUsuarioId().equals(usuario.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (postulacion.getCvArchivo() == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"cv.pdf\"")
                .body(postulacion.getCvArchivo());
    }

    @PostMapping("/asociar-candidato")
    public ResponseEntity<?> asociarCandidatoAPostulacion(@RequestBody Map<String, String> datos) {
        String candidatoId = datos.get("candidatoId");
        String busquedaId = datos.get("busquedaId");
    
        System.out.println("🟡 Recibido candidatoId: " + candidatoId + ", busquedaId: " + busquedaId);
    
        if (candidatoId == null || busquedaId == null) {
            return ResponseEntity.badRequest().body("Faltan parámetros obligatorios.");
        }
    
        try {
            return ResponseEntity.ok(postulacionService.asociarCandidatoABusqueda(candidatoId, busquedaId));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace(); 
            return ResponseEntity.status(500).body("Error interno: " + ex.getMessage());
        }

        
    }
    
    @GetMapping("/conteo-por-busqueda")
    public ResponseEntity<List<ConteoPostulacionesDTO>> obtenerConteoPorBusqueda(@AuthenticationPrincipal Usuario usuario) {
        List<ConteoPostulacionesDTO> conteo = postulacionService.obtenerConteoPorBusqueda(usuario.getId());
        return ResponseEntity.ok(conteo);
    }
    
    

    

    @GetMapping("/mis-postulaciones")
    public ResponseEntity<Page<Postulacion>> obtenerMisPostulaciones(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fase
    ) {
        return ResponseEntity.ok(
                postulacionService.obtenerPostulacionesDelReclutador(usuario.getId(), page, size, estado, fase)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Postulacion> obtenerPostulacion(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> postulacion = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        return postulacion.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(403).build());
    }


    @GetMapping("/candidato/{candidatoId}")
    public ResponseEntity<List<Postulacion>> obtenerPostulacionesPorCandidato(@PathVariable String candidatoId) {
        return ResponseEntity.ok(postulacionService.obtenerPostulacionesPorCandidato(candidatoId));
    }

    @GetMapping("/busqueda/{busquedaId}")
    public ResponseEntity<List<Postulacion>> obtenerPostulacionesPorBusqueda(
            @PathVariable String busquedaId,
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fase
    ) {
        return ResponseEntity.ok(postulacionService.obtenerPostulacionesPorBusquedaYUsuario(busquedaId, usuario.getId(), estado, fase));
    }

    @PatchMapping("/{id}/fase")
    public ResponseEntity<Postulacion> actualizarFasePostulacion(
            @PathVariable String id,
            @RequestParam String nuevaFase,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(postulacionService.actualizarFase(id, nuevaFase));
    }
 
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Postulacion> actualizarEstadoPostulacion(
            @PathVariable String id,
            @RequestParam String nuevoEstado,
            @RequestParam(required = false) String motivo,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(postulacionService.actualizarEstado(id, nuevoEstado, motivo));
    }
    
    @PostMapping("/{id}/anotacion")
    public ResponseEntity<Postulacion> agregarAnotacionPrivada(
            @PathVariable String id,
            @RequestBody String comentario,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();
        AnotacionPrivada anotacion = AnotacionPrivada.builder()
                .usuarioId(usuario.getId())
                .comentario(comentario)
                .fecha(new Date())
                .build();
        return ResponseEntity.ok(postulacionService.agregarAnotacionPrivada(id, anotacion));
    }

    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<Postulacion> rechazarPostulacion(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(postulacionService.actualizarEstado(id, "RECHAZADA", "Rechazado por el reclutador"));
    }
  
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPostulacion(
            @PathVariable String id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> opt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
        if (opt.isEmpty()) return ResponseEntity.status(403).build();
        postulacionService.eliminarPostulacion(id);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/busqueda/{busquedaId}/completas")
    public List<PostulacionRequest> obtenerPostulacionesCompletasPorBusqueda(@PathVariable String busquedaId) {
        List<Postulacion> postulaciones = postulacionService.obtenerPorBusqueda(busquedaId);

        return postulaciones.stream().map(p -> {
            Candidato candidato = candidatoService.obtenerPorId(p.getCandidatoId());
            PostulacionRequest dto = new PostulacionRequest();
            dto.setPostulacion(p);
            dto.setCandidato(candidato);
            return dto;
        }).toList();
    }


    @PostMapping("/{postulacionId}/anotaciones")
    public ResponseEntity<?> crearAnotacionPrivada(
            @PathVariable String postulacionId,
            @RequestBody AnotacionPrivadaRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            Postulacion actualizada = postulacionService.agregarAnotacionPrivada(
                postulacionId,
                usuario.getId(),
                request.getComentario()
            );
            return ResponseEntity.ok(actualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    

    @PutMapping("/{postulacionId}/anotaciones/{indice}")
    public ResponseEntity<?> editarAnotacionPrivada(
            @PathVariable String postulacionId,
            @PathVariable int indice,
            @RequestBody AnotacionPrivadaRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            Postulacion actualizada = postulacionService.editarAnotacionPrivada(postulacionId, indice, usuario.getId(), request.getComentario());
            return ResponseEntity.ok(actualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    

    @DeleteMapping("/{postulacionId}/anotaciones/{index}")
    public ResponseEntity<?> eliminarAnotacionPrivada(
            @PathVariable String postulacionId,
            @PathVariable int index,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            Postulacion actualizada = postulacionService.eliminarAnotacionPrivada(postulacionId, usuario.getId(), index);
            return ResponseEntity.ok(actualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/anotaciones/postulacion/{postulacionId}")
    public ResponseEntity<?> obtenerAnotacionesPrivadasPorPostulacion(
            @PathVariable String postulacionId,
            @AuthenticationPrincipal Usuario usuario
    ) {
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(postulacionId);

        if (postulacionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Postulación no encontrada");
        }

        Postulacion postulacion = postulacionOpt.get();

      
        Optional<Busqueda> busquedaOpt = busquedaRepository.findById(postulacion.getBusquedaId());
        if (busquedaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Búsqueda no encontrada");
        }

        if (!busquedaOpt.get().getUsuarioId().equals(usuario.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No autorizado para ver anotaciones de esta postulación");
        }

        List<Postulacion.AnotacionPrivada> propias = postulacion.getAnotacionesPrivadas() != null
            ? postulacion.getAnotacionesPrivadas().stream()
                .filter(a -> a.getUsuarioId().equals(usuario.getId()))
                .toList()
            : List.of();

        return ResponseEntity.ok(propias);
    }

    @PutMapping("/{postulacionId}/actualizar-cv")
    public ResponseEntity<String> actualizarCv(
            @PathVariable String postulacionId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            Optional<Postulacion> postulacionOpt = postulacionRepository.findById(postulacionId);
            if (postulacionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Postulacion postulacion = postulacionOpt.get();
            postulacion.setCvArchivo(file.getBytes());
            postulacionRepository.save(postulacion);

            return ResponseEntity.ok("CV actualizado correctamente");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al actualizar el CV: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> actualizarOpinionIA(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(id);
        if (postulacionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Postulacion postulacion = postulacionOpt.get();

        if (body.containsKey("opinionComentariosIA")) {
            postulacion.setOpinionComentariosIA(body.get("opinionComentariosIA"));
        }

        postulacionRepository.save(postulacion);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/foto-perfil")
    public ResponseEntity<String> subirFotoPerfil( 
            @PathVariable String id,
            @RequestParam("archivo") MultipartFile archivo) {
        try {
            Optional<Postulacion> postulacionOpt = postulacionService.obtenerPostulacionPorId(id);
            if (postulacionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
    
            String base64 = Base64.getEncoder().encodeToString(archivo.getBytes());
            Postulacion postulacion = postulacionOpt.get();
            postulacion.setFotoPerfil("data:" + archivo.getContentType() + ";base64," + base64);
            postulacionService.actualizarPostulacion(postulacion);
    
            return ResponseEntity.ok("Foto guardada correctamente.");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al procesar el archivo.");
        }
    }
    
    @GetMapping("/{id}/foto-perfil")
    public ResponseEntity<String> obtenerFotoPerfil(@PathVariable String id) {
        Optional<Postulacion> postulacionOpt = postulacionService.obtenerPostulacionPorId(id);
    
        if (postulacionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
    
        String fotoPerfil = postulacionOpt.get().getFotoPerfil();
        if (fotoPerfil == null || fotoPerfil.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
    
        return ResponseEntity.ok(fotoPerfil); 
    }
    


}