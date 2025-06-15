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
import com.securehire.backend.dto.EvaluacionIAResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    public ResponseEntity<?> extraerCvYResumir(
            @RequestParam("file") MultipartFile file,
            @RequestParam("busquedaId") String busquedaId,
            @RequestParam(value = "postulacionId", required = false) String postulacionId
    ) {
        try {
            Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(busquedaId);
            if (busquedaOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("No se encontró la búsqueda con ID: " + busquedaId);
            }

            Busqueda busqueda = busquedaOpt.get();

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("El archivo CV está vacío o no fue enviado.");
            }

            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            String textoCV = stripper.getText(document);
            document.close();

            StringBuilder preguntasRespuestas = new StringBuilder();
            StringBuilder exclusiones = new StringBuilder();

            if (postulacionId != null && !postulacionId.isBlank()) {
                postulacionRepository.findById(postulacionId).ifPresent(postulacion -> {
                    for (Postulacion.RespuestaFormulario respuesta : postulacion.getRespuestas()) {
                        String campo = respuesta.getCampo();
                        String valor = respuesta.getRespuesta();

                        preguntasRespuestas.append("- ").append(campo).append(": ").append(valor).append("\n");

                        busqueda.getCamposAdicionales().stream()
                                .filter(c -> c.getNombre().equalsIgnoreCase(campo) && c.isEsExcluyente())
                                .findFirst()
                                .ifPresent(campoExcluyente -> {
                                    List<String> valoresEsperados = campoExcluyente.getValoresExcluyentes();
                                    if (!valoresEsperados.isEmpty() && !valoresEsperados.contains(valor)) {
                                        exclusiones.append("- ").append(campo)
                                                .append(" → respondió \"").append(valor)
                                                .append("\" (esperado: ").append(String.join("/", valoresEsperados)).append(")\n");
                                    }
                                });
                    }
                });
            }

            String prompt =
                    "Sos un asistente experto y objetivo en selección de personal. Vas a evaluar un CV en función de una búsqueda laboral específica.\n\n" +
                    "Tu objetivo es generar un análisis claro, imparcial y repetible. No uses opiniones ni supuestos. Solo analizá la información concreta que figura en el CV, las respuestas del postulante y los requisitos de la búsqueda.\n\n" +
                    "⚠️ No asumas experiencia laboral por formación, duración de estudios o nivel académico. Si el CV no indica explícitamente experiencia laboral (con palabras como \"trabajé\", \"empresa\", \"freelance\", \"proyecto laboral\", algún puesto de trabajo, etc.), asumí que NO tiene experiencia laboral.\n\n" +
                    "📌 No infieras experiencia laboral a partir de años de estudios o menciones vagas. Solo considerá experiencia si se menciona explícitamente como experiencia laboral.\n\n" +
                    "📌 Antes de devolver la respuesta, validá que no hay contradicciones. Si una sección no está presente, dejala fuera sin intentar completarla con suposiciones.\n\n" +
                    "📌 La suma de todos los puntajes debe ser como máximo 100. No devuelvas campos fuera de los siguientes:\n" +
                    "- requisitosClave\n" +
                    "- experienciaLaboral\n" +
                    "- formacionAcademica\n" +
                    "- idiomasYSoftSkills\n" +
                    "- otros (solo si hay proyectos personales, portfolio o logros extracurriculares, con un peso máximo del 10%)\n\n" +
                    "Respondé en formato JSON con la siguiente estructura:\n\n" +
                    "{\n" +
                    "  \"perfilDetectado\": \"...\",\n" +
                    "  \"resumen\": \"...\",\n" +
                    "  \"puntajeGeneral\": 0–100,\n" +
                    "  \"motivos\": [ \"frase 1\", \"frase 2\", ... ],\n" +
                    "  \"puntajesDetalle\": {\n" +
                    "    \"requisitosClave\": number,\n" +
                    "    \"experienciaLaboral\": number,\n" +
                    "    \"formacionAcademica\": number,\n" +
                    "    \"idiomasYSoftSkills\": number,\n" +
                    "    \"otros\": number (opcional)\n" +
                    "  }\n" +
                    "}\n\n" +
                    "Para calcular el campo \"puntajeGeneral\", seguí estas reglas de ponderación:\n" +
                    "- Coincidencia con requisitos y tecnologías clave: 50%\n" +
                    "- Experiencia laboral relacionada (solo si está explícitamente indicada): 20%\n" +
                    "- Formación académica relevante: 10%\n" +
                    "- Idiomas y soft skills: 10%\n" +
                    "- Otros (proyectos personales o logros diferenciadores): máximo 10%, solo si son claros y relevantes\n" +
                    "- Penalizá con fuerza si no cumple con requisitos excluyentes.\n\n" +
                    "Título de la búsqueda: " + busqueda.getTitulo() + "\n" +
                    "Descripción del puesto: " + busqueda.getDescripcion() + "\n\n" +
                    "Respuestas brindadas por el candidato:\n" + preguntasRespuestas + "\n\n" +
                    "Requisitos excluyentes que NO cumple:\n" + (exclusiones.isEmpty() ? "Ninguno" : exclusiones) + "\n\n" +
                    "CV completo:\n" + textoCV;

            String respuestaJson = geminiService.obtenerRespuestaDesdeGemini(prompt);

            String jsonLimpio = respuestaJson
                    .replaceAll("(?i)^```json", "")
                    .replaceAll("^```", "")
                    .replaceAll("```$", "")
                    .trim();

            ObjectMapper mapper = new ObjectMapper();
            EvaluacionIAResponse evaluacion = mapper.readValue(jsonLimpio, EvaluacionIAResponse.class);

            if (postulacionId != null && !postulacionId.isBlank()) {
                postulacionRepository.findById(postulacionId).ifPresent(postulacion -> {
                    if (postulacion.getPuntajeGeneral() != null) {
                        System.out.println("⚠️ Puntajes ya existentes, se evita regenerarlos para la postulación: " + postulacionId);
                        // Solo se actualiza el resumen si ya fue evaluada
                        postulacion.setResumenCv(evaluacion.getResumen());
                        postulacionRepository.save(postulacion);
                        return;
                    }

                    Map<String, Integer> detalle = evaluacion.getPuntajesDetalle();
                    postulacion.setPuntajeGeneral(evaluacion.getPuntajeGeneral());
                    postulacion.setPuntajeRequisitosClave(detalle.getOrDefault("requisitosClave", 0));
                    postulacion.setPuntajeExperienciaLaboral(detalle.getOrDefault("experienciaLaboral", 0));
                    postulacion.setPuntajeFormacionAcademica(detalle.getOrDefault("formacionAcademica", 0));
                    postulacion.setPuntajeIdiomasYSoftSkills(detalle.getOrDefault("idiomasYSoftSkills", 0));
                    postulacion.setPuntajeOtros(detalle.getOrDefault("otros", 0));
                    postulacion.setMotivosIA(evaluacion.getMotivos());
                    postulacion.setPerfilDetectadoIA(evaluacion.getPerfilDetectado());
                    postulacion.setResumenCv(evaluacion.getResumen());
                    postulacionRepository.save(postulacion);
                });
            }

            return ResponseEntity.ok(evaluacion);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error extrayendo texto del PDF: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error procesando la evaluación: " + e.getMessage());
        }
    }


    // METODO VIEJO
    // @PostMapping("/extraer-cv-y-resumir")
    // public ResponseEntity<String> extraerCvYResumir(
    //         @RequestParam("file") MultipartFile file,
    //         @RequestParam("busquedaId") String busquedaId,
    //         @RequestParam(value = "postulacionId", required = false) String postulacionId
    // ) {
    //     try {
    //         Optional<Busqueda> busquedaOpt = busquedaService.obtenerBusquedaPorId(busquedaId);
    //         if (busquedaOpt.isEmpty()) {
    //             return ResponseEntity.badRequest().body("No se encontró la búsqueda con ID: " + busquedaId);
    //         }

    //         Busqueda busqueda = busquedaOpt.get();

    //         if (file == null || file.isEmpty()) {
    //             return ResponseEntity.badRequest().body("El archivo CV está vacío o no fue enviado.");
    //         }

    //         PDDocument document = PDDocument.load(file.getInputStream());
    //         PDFTextStripper stripper = new PDFTextStripper();
    //         String text = stripper.getText(document);
    //         document.close();

    //         String prompt = """
    //             Sos un asistente de selección de personal. Recibiste el currículum de un candidato que se postuló a una búsqueda laboral. 
    //             Quiero que resumas la información más importante del CV para ayudar a un reclutador a evaluarlo. 
    //             Indicá si tiene o no experiencia laboral, sus principales habilidades técnicas, su formación académica y conocimientos de idiomas.

    //             Mostrá la información de manera ordenada, en texto plano (no JSON), usando emojis y subtítulos como:

    //             🧑‍💻 Experiencia laboral  
    //             🛠️ Habilidades  
    //             🎓 Educación  
    //             🌐 Idiomas  
    //             ✅ ¿Tiene experiencia?  
    //             📝 Comentario general

    //             No uses código ni formatees como JSON. Devolvé todo como texto plano, directamente legible.

    //             Tené en cuenta que el candidato se postuló a la siguiente búsqueda:

    //             Título de la búsqueda: %s  
    //             Descripción del puesto: %s

    //             Currículum completo extraído del PDF:
    //             %s
    //             """.formatted(busqueda.getTitulo(), busqueda.getDescripcion(), text);

    //         String resumen = geminiService.obtenerRespuestaDesdeGemini(prompt);

    //         if (postulacionId != null && !postulacionId.isBlank()) {
    //             postulacionRepository.findById(postulacionId).ifPresent(postulacion -> {
    //                 postulacion.setResumenCv(resumen);
    //                 postulacionRepository.save(postulacion);
    //             });
    //         }

    //         return ResponseEntity.ok(resumen);
    //     } catch (IOException e) {
    //         return ResponseEntity.badRequest().body("Error extrayendo texto del PDF: " + e.getMessage());
    //     }
    // }

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

        if (comentarios == null || comentarios.isEmpty()) {
            return ResponseEntity.badRequest().body("No hay comentarios suficientes para generar una opinión.");
        }

        StringBuilder textoComentarios = new StringBuilder();
        for (Comentario comentario : comentarios) {
            textoComentarios.append("- ").append(comentario.getTexto()).append("\n");
        }

        String prompt = """
            Actuás como un asistente de selección de personal. A continuación, se listan comentarios de distintos reclutadores sobre un candidato.

            Tu tarea es generar una opinión general que resuma lo más relevante de los comentarios.

            ⚠️ IMPORTANTE:
            - Podés hacer clasificaciones internas (positivos, negativos, patrones, etc.) solo para ayudarte a escribir, pero no las muestres en el resultado.
            - No uses markdown, ni listas.
            - Devolvé únicamente un párrafo con la opinión general, como texto plano legible por humanos.
            - No incluyas recomendaciones ni sugerencias sobre continuar o no en el proceso.

            Comentarios:
            %s
            """.formatted(textoComentarios);

        String respuesta = geminiService.obtenerRespuestaDesdeGemini(prompt);

        postulacion.setOpinionComentariosIA(respuesta);
        postulacionRepository.save(postulacion);

        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/eliminar-opinion-ia/{postulacionId}")
    public ResponseEntity<?> eliminarOpinionIA(@PathVariable String postulacionId) {
        Optional<Postulacion> postulacionOpt = postulacionRepository.findById(postulacionId);
        if (postulacionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Postulación no encontrada");
        }
    
        Postulacion postulacion = postulacionOpt.get();
        postulacion.setOpinionComentariosIA(null); // o postulacion.setOpinionComentariosIA("")
    
        postulacionRepository.save(postulacion);
    
        return ResponseEntity.ok("Opinión eliminada correctamente");
    }
    
    
}
