package com.securehire.backend.dto;

import com.securehire.backend.model.Candidato;
import com.securehire.backend.model.Comentario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidatoConComentariosDTO {
    private Candidato candidato;
    private List<Comentario> comentarios;
} 