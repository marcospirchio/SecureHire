package com.securehire.backend.dto;

import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Postulacion;
import lombok.Data;
import java.util.List;
@Data
public class PostulacionRequest {
    private Postulacion postulacion;
    private Candidato candidato;
    private List<Postulacion.RespuestaFormulario> respuestas;
}
