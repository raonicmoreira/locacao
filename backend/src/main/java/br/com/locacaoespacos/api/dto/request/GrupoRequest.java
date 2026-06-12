package br.com.locacaoespacos.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GrupoRequest {

    @NotBlank
    private String descricao;

    private Integer status; // null = usa padrão ATIVO (1) na criação
}
