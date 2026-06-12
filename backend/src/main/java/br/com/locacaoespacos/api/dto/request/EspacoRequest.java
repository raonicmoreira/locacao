package br.com.locacaoespacos.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EspacoRequest {

    @NotNull
    private UUID idGrupo;

    @NotNull
    private UUID idEspacoTipoLocacao;

    @NotBlank
    private String descricao;

    @NotNull
    private Integer status;

    @NotNull
    private BigDecimal valor;

    private String endereco;

    private String observacoes;
}
