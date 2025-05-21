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
import com.securehire.backend.service.ComentarioService;
import com.securehire.backend.model.Comentario;
import com.securehire.backend.dto.OpinionRequest;
import java.io.IOException; 
import java.util.Optional;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/geminiIA")
public class GeminiIAController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private BusquedaService busquedaService;

    @Autowired
    private PostulacionRepository postulacionRepository;

    @Autowired
    private ComentarioService comentarioService;

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

                Mostrá la información de manera ordenada, en texto plano (no JSON), usando emojis y subtítulos como:

                🧑‍💻 Experiencia laboral  
                🛠️ Habilidades  
                🎓 Educación  
                🌐 Idiomas  
                ✅ ¿Tiene experiencia?  
                📝 Comentario general

                No uses código ni formatees como JSON. Devolvé todo como texto plano, directamente legible.

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

    @PostMapping("/generar-opinion-candidato")
    public ResponseEntity<String> generarOpinionCandidato(@RequestBody OpinionRequest request) {
        String postulacionId = request.getPostulacionId();

        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(postulacionId);
        if (postulacionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No se encontró la postulación.");
        }

        Postulacion postulacion = postulacionOpt.get();

        if (postulacion.getOpinionComentariosIA() != null && !postulacion.getOpinionComentariosIA().isBlank()) {
            return ResponseEntity.ok(postulacion.getOpinionComentariosIA());
        }

        String candidatoId = postulacion.getCandidatoId();
        List<Comentario> comentarios = comentarioService.obtenerComentariosPorCandidato(candidatoId);

        if (comentarios.isEmpty()) {
            return ResponseEntity.badRequest().body("No hay comentarios disponibles para este candidato.");
        }

        StringBuilder textoComentarios = new StringBuilder();
        for (Comentario comentario : comentarios) {
            textoComentarios.append("- ").append(comentario.getTexto()).append("\n");
        }

        String prompt = """
            Actuás como un asistente de selección de personal. A continuación, se listan comentarios de distintos reclutadores sobre un candidato.

            Tu tarea es analizarlos y generar solamente los siguientes dos apartados, como si fueras un asesor de recursos humanos:

            1. Una opinión general que resuma lo más relevante de los comentarios.
            2. Una recomendación final sobre si el candidato debería continuar en el proceso de selección.

            ⚠️ IMPORTANTE:
            - Podés hacer clasificaciones internas (positivos, negativos, patrones, etc.) solo para ayudarte a escribir, pero no las muestres en el resultado.
            - No uses markdown, ni listas.
            - Devolvé únicamente los dos párrafos (opinión general y recomendación), como texto plano legible por humanos.

            Comentarios:
            %s
            """.formatted(textoComentarios);

        String respuesta = geminiService.obtenerRespuestaDesdeGemini(prompt);

        postulacion.setOpinionComentariosIA(respuesta);
        postulacionRepository.save(postulacion);

        return ResponseEntity.ok(respuesta);
    }


}
