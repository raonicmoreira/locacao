package br.com.locacaoespacos.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EspacoTipoLocacaoRequest {

    @NotBlank
    private String descricao;

    @NotNull
    private Integer modalidadeLocacao; // 0=MES, 1=DIA, 2=HORA

    private Integer diasSemana;  // bitmask, nullable

    private String horaInicio;   // "HH:mm", nullable

    private String horaFim;      // "HH:mm", nullable

    private Integer status;      // null = ATIVO (1) na criação
}
