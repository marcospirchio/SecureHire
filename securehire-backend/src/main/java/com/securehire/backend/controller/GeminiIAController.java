package com.securehire.backend.controller;


import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;

import com.securehire.backend.model.Busqueda;
import com.securehire.backend.service.GeminiService;
import com.securehire.backend.service.BusquedaService;

import java.io.IOException;

@RestController
@RequestMapping("/api/geminiIA")
public class GeminiIAController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private BusquedaService busquedaService;
    
    @PostMapping("/extraer-cv-y-resumir")
    public ResponseEntity<String> extraerCvYResumir(
            @RequestParam("file") MultipartFile file,
            @RequestParam("busquedaId") String busquedaId
    ) {
        try {
            // 1. Obtener la búsqueda
            Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(busquedaId);
            if (busquedaOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("No se encontró la búsqueda con ID: " + busquedaId);
            }
            Busqueda busqueda = busquedaOpt.get();

            // 2. Leer el contenido del PDF
            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            // 3. Construir el prompt
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
            """.formatted(
                                busqueda.getTitulo(),
                    busqueda.getDescripcion(),
                    text
            );

            // 4. Llamar a Gemini
            String respuesta = geminiService.obtenerRespuestaDesdeGemini(prompt);
            return ResponseEntity.ok(respuesta);

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error extrayendo texto del PDF: " + e.getMessage());
        }
    }
    
}
