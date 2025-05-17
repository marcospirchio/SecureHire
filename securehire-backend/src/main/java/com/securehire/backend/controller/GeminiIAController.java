package com.securehire.backend.controller;

import com.securehire.backend.model.Busqueda;
import com.securehire.backend.model.Postulacion;
import com.securehire.backend.repository.PostulacionRepository;
import com.securehire.backend.service.BusquedaService;
import com.securehire.backend.service.GeminiService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/geminiIA")
public class GeminiIAController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private BusquedaService busquedaService;

    @Autowired
    private PostulacionRepository postulacionRepository;

    @PostMapping("/extraer-cv-y-resumir")
    public ResponseEntity<String> extraerCvYResumir(
            @RequestParam("file") MultipartFile file,
            @RequestParam("busquedaId") String busquedaId,
            @RequestParam(value = "postulacionId", required = false) String postulacionId
    ) {
        try {
            // Buscar la búsqueda correspondiente
            Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(busquedaId);
            if (busquedaOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("No se encontró la búsqueda con ID: " + busquedaId);
            }

            Busqueda busqueda = busquedaOpt.get();

            // Leer el contenido del PDF
            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            // Armar prompt para IA
            String prompt = """
                Sos un asistente de selección de personal. Recibiste el currículum de un candidato que se postuló a una búsqueda laboral. 
                Quiero que resumas la información más importante del CV para ayudar a un reclutador a evaluarlo. 
                Indicá si tiene o no experiencia laboral, sus principales habilidades técnicas, su formación académica y conocimientos de idiomas. 
                Devolvé la respuesta en formato JSON con las siguientes claves:

                {
                  "experienciaLaboral": [lista de experiencias más relevantes],
                  "habilidades": [lista de habilidades técnicas principales],
                  "educacion": [formación académica más relevante],
                  "idiomas": [idiomas conocidos con nivel si se menciona],
                  "tieneExperiencia": true/false,
                  "comentarioGeneral": "Resumen en lenguaje natural (opcional)"
                }

                Tené en cuenta que el candidato se postuló a la siguiente búsqueda:

                Título de la búsqueda: %s  
                Descripción del puesto: %s

                Currículum completo extraído del PDF:
                %s
            """.formatted(busqueda.getTitulo(), busqueda.getDescripcion(), text);

            // Llamar a Gemini
            String resumen = geminiService.obtenerRespuestaDesdeGemini(prompt);

            // Si vino postulacionId, guardar el resumen en esa postulación
            if (postulacionId != null && !postulacionId.isBlank()) {
                postulacionRepository.findById(postulacionId).ifPresent(postulacion -> {
                    postulacion.setResumenCv(resumen);
                    postulacionRepository.save(postulacion);
                });
            }

            return ResponseEntity.ok(resumen);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error extrayendo texto del PDF: " + e.getMessage());
        }
    }
}
