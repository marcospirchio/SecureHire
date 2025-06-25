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
import com.securehire.backend.dto.ResultadoComparacionIA;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${google.api.key}")
    private String googleApiKey;

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
            if (postOpt.isEmpty()) continue;
        
            Postulacion p = postOpt.get();
            Map<String, Object> limpio = new HashMap<>();
            limpio.put("respuestas", p.getRespuestas());
            limpio.put("resumenCv", p.getResumenCv());
            limpio.put("estado", p.getEstado());
            limpio.put("faseActual", p.getFaseActual());
        
            Optional<Candidato> candidatoOpt = candidatoService.obtenerCandidatoPorId(p.getCandidatoId());
            String nombreCompleto = candidatoOpt.map(c -> c.getNombre() + " " + c.getApellido()).orElse("Sin nombre");
            limpio.put("nombre", nombreCompleto);
        
            candidatos.add(limpio);
        }

        // Armar payload JSON
        Map<String, Object> payload = new HashMap<>();
        payload.put("busqueda", busqueda);
        payload.put("candidatos", candidatos);

        ObjectMapper mapper = new ObjectMapper();
        String jsonPayload = mapper.writeValueAsString(payload);

        // Ejecutar script Python
        String scriptPath = String.join(File.separator, System.getProperty("user.dir"), "securehire-backend", "src", "main", "java", "com", "securehire", "backend", "ia", "comparar_candidatos_gemini.py");
        ProcessBuilder pb = new ProcessBuilder("python3", scriptPath);

        // Cargar variables de entorno y añadirlas al proceso
        Map<String, String> env = Dotenv.load();
        pb.environment().putAll(env);
        
        // Asegurar que la API key esté disponible para el script Python
        pb.environment().put("GOOGLE_API_KEY", googleApiKey);
        
        System.out.println("===== CONFIGURACIÓN DEL SCRIPT =====");
        System.out.println("Script path: " + scriptPath);
        System.out.println("API Key configurada: " + (googleApiKey != null && !googleApiKey.isEmpty() ? "SÍ" : "NO"));
        System.out.println("API Key (primeros 10 chars): " + (googleApiKey != null ? googleApiKey.substring(0, Math.min(10, googleApiKey.length())) + "..." : "NULL"));
        System.out.println("=====================================");

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
        
        System.out.println("===== STDOUT del script IA =====");
        System.out.println(stdout.toString());
        System.out.println("================================");
        
        if (exitCode != 0) {
            return ResponseEntity.status(500).body("El script de IA falló con código " + exitCode);
        }

        // Parsear resultado JSON limpio
        try {
            System.out.println("===== INTENTANDO PARSEAR JSON =====");
            System.out.println("STDOUT length: " + stdout.length());
            System.out.println("STDOUT content: " + stdout.toString());
            
            ResultadoComparacionIA dto = mapper.readValue(stdout.toString(), ResultadoComparacionIA.class);
            System.out.println("✅ JSON parseado correctamente");
            System.out.println("Resultados encontrados: " + (dto.getResultados() != null ? dto.getResultados().size() : 0));
            
            // Guardar los puntajes en las postulaciones
            if (dto.getResultados() != null) {
                System.out.println("===== PROCESANDO RESULTADOS =====");
                System.out.println("Total de resultados de IA: " + dto.getResultados().size());
                System.out.println("Total de postulaciones a procesar: " + postulacionIds.size());
                
                for (ResultadoComparacionIA.CandidatoComparado resultado : dto.getResultados()) {
                    System.out.println("Procesando candidato: " + resultado.getNombre());
                    System.out.println("Puntaje general: " + resultado.getPuntajeGeneral());
                    System.out.println("Score: " + resultado.getScore());
                    System.out.println("Años experiencia: " + resultado.getAniosExperiencia());
                    System.out.println("Motivos positivos: " + (resultado.getMotivosPositivos() != null ? resultado.getMotivosPositivos().size() : 0));
                    System.out.println("Motivos negativos: " + (resultado.getMotivosNegativos() != null ? resultado.getMotivosNegativos().size() : 0));
                    
                    // Buscar la postulación correspondiente por nombre del candidato
                    boolean encontrado = false;
                    for (String postulacionId : postulacionIds) {
                        Optional<Postulacion> postOpt = postulacionService.obtenerPostulacionSiPerteneceAUsuario(postulacionId, usuario.getId());
                        if (postOpt.isPresent()) {
                            Postulacion postulacion = postOpt.get();
                            Optional<Candidato> candidatoOpt = candidatoService.obtenerCandidatoPorId(postulacion.getCandidatoId());
                            
                            if (candidatoOpt.isPresent()) {
                                Candidato candidato = candidatoOpt.get();
                                String nombreCompleto = candidato.getNombre() + " " + candidato.getApellido();
                                
                                System.out.println("Comparando: '" + nombreCompleto.trim() + "' vs '" + resultado.getNombre().trim() + "'");
                                
                                // Verificar si coincide con el resultado (comparación más flexible)
                                String nombreResultado = resultado.getNombre().trim().toLowerCase();
                                String nombreCandidato = nombreCompleto.trim().toLowerCase();
                                String soloNombre = candidato.getNombre().trim().toLowerCase();
                                
                                System.out.println("  - Nombre resultado (lowercase): '" + nombreResultado + "'");
                                System.out.println("  - Nombre candidato (lowercase): '" + nombreCandidato + "'");
                                System.out.println("  - Solo nombre (lowercase): '" + soloNombre + "'");
                                
                                if (nombreCandidato.equals(nombreResultado) || 
                                    soloNombre.equals(nombreResultado) ||
                                    nombreCandidato.contains(nombreResultado) ||
                                    nombreResultado.contains(soloNombre)) {
                                    
                                    System.out.println("✅ Coincidencia encontrada! Actualizando postulación...");
                                    encontrado = true;
                                    
                                    // Actualizar la postulación con los puntajes (solo si no existen)
                                    if (postulacion.getPuntajeRequisitosClave() == null) {
                                        postulacion.setPuntajeRequisitosClave(resultado.getPuntajeRequisitosClave());
                                    }
                                    if (postulacion.getPuntajeExperienciaLaboral() == null) {
                                        postulacion.setPuntajeExperienciaLaboral(resultado.getPuntajeExperienciaLaboral());
                                    }
                                    if (postulacion.getPuntajeFormacionAcademica() == null) {
                                        postulacion.setPuntajeFormacionAcademica(resultado.getPuntajeFormacionAcademica());
                                    }
                                    if (postulacion.getPuntajeIdiomasYSoftSkills() == null) {
                                        postulacion.setPuntajeIdiomasYSoftSkills(resultado.getPuntajeIdiomasYSoftSkills());
                                    }
                                    if (postulacion.getPuntajeOtros() == null) {
                                        postulacion.setPuntajeOtros(resultado.getPuntajeOtros());
                                    }
                                    if (postulacion.getPuntajeGeneral() == null) {
                                        postulacion.setPuntajeGeneral(resultado.getPuntajeGeneral());
                                    }
                                    
                                    // Guardar motivos positivos y negativos por separado (solo si no existen)
                                    if (postulacion.getMotivosPositivos() == null) {
                                        postulacion.setMotivosPositivos(resultado.getMotivosPositivos());
                                    }
                                    if (postulacion.getMotivosNegativos() == null) {
                                        postulacion.setMotivosNegativos(resultado.getMotivosNegativos());
                                    }
                                    
                                    // Guardar años de experiencia (solo si no existe)
                                    if (postulacion.getAniosExperiencia() == null) {
                                        postulacion.setAniosExperiencia(resultado.getAniosExperiencia());
                                    }
                                    
                                    // Siempre actualizar explicaciones por criterio (se sobrescriben)
                                    if (resultado.getExplicacionesPorCriterio() != null) {
                                        List<String> explicaciones = new ArrayList<>();
                                        for (Map.Entry<String, String> entry : resultado.getExplicacionesPorCriterio().entrySet()) {
                                            explicaciones.add(entry.getValue());
                                        }
                                        postulacion.setExplicacionesPorCriterio(explicaciones);
                                    }
                                    
                                    // Mantener compatibilidad con motivosIA (solo si no existe)
                                    if (postulacion.getMotivosIA() == null) {
                                        List<String> motivosCombinados = new ArrayList<>();
                                        if (resultado.getMotivosPositivos() != null) {
                                            motivosCombinados.addAll(resultado.getMotivosPositivos());
                                        }
                                        if (resultado.getMotivosNegativos() != null) {
                                            motivosCombinados.addAll(resultado.getMotivosNegativos());
                                        }
                                        postulacion.setMotivosIA(motivosCombinados);
                                    }
                                    
                                    System.out.println("  - Intentando guardar postulación ID: " + postulacion.getId());
                                    // Guardar en la base de datos
                                    Postulacion postulacionGuardada = postulacionService.actualizarPostulacion(postulacion);
                                    System.out.println("✅ Postulación guardada con ID: " + postulacionGuardada.getId());
                                    System.out.println("Puntaje general guardado: " + postulacionGuardada.getPuntajeGeneral());
                                    System.out.println("Años de experiencia guardados: " + postulacionGuardada.getAniosExperiencia());
                                    System.out.println("Motivos positivos guardados: " + (postulacionGuardada.getMotivosPositivos() != null ? postulacionGuardada.getMotivosPositivos().size() : 0));
                                    System.out.println("Motivos negativos guardados: " + (postulacionGuardada.getMotivosNegativos() != null ? postulacionGuardada.getMotivosNegativos().size() : 0));
                                    break;
                                } else {
                                    System.out.println("  ❌ No coincide");
                                }
                            }
                        }
                    }
                    if (!encontrado) {
                        System.out.println("❌ NO SE ENCONTRÓ COINCIDENCIA para: " + resultado.getNombre());
                    }
                }
                System.out.println("===== FIN PROCESAMIENTO =====");
            }
            
            return ResponseEntity.ok(dto);
        } catch (Exception ex) {
            System.out.println("❌ Error parseando respuesta del script IA: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Error parseando respuesta del script IA: " + ex.getMessage());
        }
    }
}
