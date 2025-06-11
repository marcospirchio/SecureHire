package com.securehire.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.model.Usuario;
import com.securehire.backend.service.BusquedaService;
import com.securehire.backend.service.CandidatoService;
import com.securehire.backend.service.PostulacionService;   
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<String> compararCandidatos(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Usuario usuario
    ) throws IOException, InterruptedException {

        List<String> postulacionIds = (List<String>) body.get("postulacionIds");
        if (postulacionIds == null || postulacionIds.size() < 1 || postulacionIds.size() > 10) {
            return ResponseEntity.badRequest().body("Debe enviar entre 1 y 10 postulaciones.");
        }

        // Obtener la búsqueda asociada a la primera postulación
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

        // Construir lista de candidatos
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
        
                // ✅ Obtener el nombre del candidato
                Optional<Candidato> candidatoOpt = candidatoService.obtenerCandidatoPorId(p.getCandidatoId());
                String nombre = candidatoOpt.map(Candidato::getNombre).orElse("Sin nombre");
                limpio.put("nombre", nombre);
        
                candidatos.add(limpio);
            }
        }
        

        Map<String, Object> payload = new HashMap<>();
        payload.put("busqueda", busqueda);
        payload.put("candidatos", candidatos);

        // Logging
        String jsonPayload = new ObjectMapper().writeValueAsString(payload);
        System.out.println("======== INPUT JSON PARA SCRIPT IA ========");
        System.out.println(jsonPayload);
        System.out.println("==========================================");

        // Ruta del script
        String scriptPath = System.getProperty("user.dir") + "/securehire-backend/src/main/java/com/securehire/backend/ia/comparar_candidatos_mistral.py";
        System.out.println("======== RUTA DEL SCRIPT ========");
        System.out.println("Script path: " + scriptPath);
        System.out.println("=================================");

        ProcessBuilder pb = new ProcessBuilder("python3", scriptPath);
        pb.redirectErrorStream(true); // combina stderr y stdout
        Process process = pb.start();

        // Escribir input al proceso
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
            writer.write(jsonPayload);
            writer.flush();
        }

        // Leer output del proceso
        StringBuilder resultado = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                resultado.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        System.out.println("======== EXIT CODE DEL SCRIPT IA ========");
        System.out.println("Exit code: " + exitCode);
        System.out.println("========================================");

        System.out.println("======== OUTPUT DEL SCRIPT IA ========");
        System.out.println(resultado.toString());
        System.out.println("======================================");

        if (exitCode != 0) {
            return ResponseEntity.status(500).header("Content-Type", "application/json")
                    .body("{\"error\": \"El script de IA falló con código " + exitCode + "\"}");
        }

        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(resultado.toString());
    }
}
