package com.securehire.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securehire.backend.model.Busqueda;
import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.repository.CandidatoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CompararCandidatosService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CandidatoRepository candidatoRepository;

    public String ejecutarComparacionIA(Busqueda busqueda, List<Postulacion> postulaciones) {
        try {
            // Preparamos el payload con la información limpia
            List<Map<String, Object>> candidatos = new ArrayList<>();
            for (Postulacion p : postulaciones) {
                // 🔍 Obtener el nombre del candidato asociado
                Optional<Candidato> candidatoOpt = candidatoRepository.findById(p.getCandidatoId());
                String nombre = candidatoOpt.map(Candidato::getNombre).orElse("Sin nombre");
            
                Map<String, Object> limpio = new HashMap<>();
                limpio.put("respuestas", p.getRespuestas());
                limpio.put("resumenCv", p.getResumenCv());
                limpio.put("estado", p.getEstado());
                limpio.put("faseActual", p.getFaseActual());
                limpio.put("nombre", nombre); // ✅ nombre del candidato obtenido
                candidatos.add(limpio);
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("busqueda", busqueda);
            payload.put("candidatos", candidatos);

            // Ruta absoluta del script (más confiable)
            String scriptPath = System.getProperty("user.dir") + "/securehire-backend/src/main/java/com/securehire/backend/ia/comparar_candidatos_mistral.py";
            ProcessBuilder pb = new ProcessBuilder("python3", scriptPath);
            pb.redirectErrorStream(true); // combinar stdout + stderr
            Process process = pb.start();

            // Enviar JSON al script
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                writer.write(objectMapper.writeValueAsString(payload));
                writer.flush();
            }

            // Leer salida del script
            StringBuilder resultado = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    resultado.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("El script de IA falló con código: " + exitCode + ". Salida: " + resultado);
            }

            return resultado.toString();

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Error ejecutando la IA local: " + e.getMessage(), e);
        }
    }
}
