package br.com.locacaoespacos.api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Builder
@Getter
@JsonInclude(NON_NULL)
public class EspacoResponse {

    private UUID id;
    private UUID idGrupo;
    private String grupoDescricao;
    private UUID idEspacoTipoLocacao;
    private String tipoLocacaoDescricao;
    private String descricao;
    private Integer status;
    private String statusDescricao;
    private BigDecimal valor;
    private String endereco;
    private String observacoes;
    private String atualizadoEm;
}
