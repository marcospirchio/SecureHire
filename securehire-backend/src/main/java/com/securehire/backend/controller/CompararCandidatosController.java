package com.securehire.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.BusquedaService;
import com.securehire.backend.service.CandidatoService;
import com.securehire.backend.service.PostulacionService;
import com.securehire.backend.util.Dotenv;
import jakarta.servlet.http.HttpServletRequest;
import com.securehire.backend.dto.ResultadoComparacionIA;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.*;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
public class CompararCandidatosController {

    private final PostulacionService postulacionService;
    private final BusquedaService busquedaService;
    private final CandidatoService candidatoService;


    @PostMapping("/comparar")
public ResponseEntity<?> compararCandidatos(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Usuario usuario
) throws IOException, InterruptedException {

        List<String> postulacionIds = (List<String>) body.get("postulacionIds");
    if (postulacionIds == null || postulacionIds.isEmpty() || postulacionIds.size() > 10) {
            return ResponseEntity.badRequest().body("Debe enviar entre 1 y 10 postulaciones.");
        }

    // Obtener y validar la búsqueda
        String primeraPostulacionId = postulacionIds.get(0);
        Optional<Postulacion> primeraPostulacionOpt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(primeraPostulacionId, usuario.getId());
        if (primeraPostulacionOpt.isEmpty()) {
            return ResponseEntity.status(403).body("La primera postulación no pertenece al usuario.");
        }

        Postulacion primeraPostulacion = primeraPostulacionOpt.get();
        Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(primeraPostulacion.getBusquedaId());
        if (busquedaOpt.isEmpty() || !busquedaOpt.get().getUsuarioId().equals(usuario.getId())) {
            return ResponseEntity.status(403).body("La búsqueda asociada no pertenece al usuario.");
        }

        Busqueda busqueda = busquedaOpt.get();

    // Preparar candidatos
        List<Map<String, Object>> candidatos = new ArrayList<>();
        for (String id : postulacionIds) {
            Optional<Postulacion> postOpt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(id, usuario.getId());
            if (postOpt.isPresent()) {
                Postulacion p = postOpt.get();
                Map<String, Object> limpio = new HashMap<>();
                limpio.put("respuestas", p.getRespuestas());
                limpio.put("resumenCv", p.getResumenCv());
                limpio.put("estado", p.getEstado());
                limpio.put("faseActual", p.getFaseActual());

            Optional<Candidato> candidatoOpt = candidatoService.obtenerCandidatoPorId(p.getCandidatoId());
            String nombre = candidatoOpt.map(Candidato::getNombre).orElse("Sin nombre");
            limpio.put("nombre", nombre);

                candidatos.add(limpio);
            }
        }

    // Armar payload JSON
        Map<String, Object> payload = new HashMap<>();
        payload.put("busqueda", busqueda);
        payload.put("candidatos", candidatos);

    ObjectMapper mapper = new ObjectMapper();
    String jsonPayload = mapper.writeValueAsString(payload);

    // Ejecutar script Python
    String scriptPath = String.join(File.separator, System.getProperty("user.dir"), "securehire-backend", "src", "main", "java", "com", "securehire", "backend", "ia", "comparar_candidatos_mistral.py");
    ProcessBuilder pb = new ProcessBuilder("python3", scriptPath);

    // Cargar variables de entorno y añadirlas al proceso
    Map<String, String> env = Dotenv.load();
    pb.environment().putAll(env);

    pb.redirectErrorStream(false);  // ✅ Separar stdout y stderr
        Process process = pb.start();

    // Enviar JSON al proceso
    try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
        writer.write(jsonPayload);
        writer.flush();
    }

    // Leer stdout (resultado JSON real)
    StringBuilder stdout = new StringBuilder();
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
        String line;
        while ((line = reader.readLine()) != null) {
            stdout.append(line);
        }
    }

    // Leer stderr (logs informativos)
    StringBuilder stderr = new StringBuilder();
    try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
        String line;
        while ((line = errorReader.readLine()) != null) {
            stderr.append(line).append("\n");
        }
    }

    int exitCode = process.waitFor();
        
    System.out.println("===== STDERR del script IA =====");
    System.out.println(stderr.toString());
    System.out.println("================================");
        
    if (exitCode != 0) {
        return ResponseEntity.status(500).body("El script de IA falló con código " + exitCode);
    }

    // Parsear resultado JSON limpio
    try {
        ResultadoComparacionIA dto = mapper.readValue(stdout.toString(), ResultadoComparacionIA.class);
        return ResponseEntity.ok(dto);
    } catch (Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(500).body("Error parseando respuesta del script IA: " + ex.getMessage());
    }
}

    
}
