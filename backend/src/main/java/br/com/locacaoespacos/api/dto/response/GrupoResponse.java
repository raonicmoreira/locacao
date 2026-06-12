package br.com.locacaoespacos.api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Builder
@Getter
@JsonInclude(NON_NULL)
public class GrupoResponse {

    private UUID id;
    private String descricao;
    private Integer status;
    private String statusDescricao; // "ATIVO" ou "INATIVO"
    private String atualizadoEm;    // ISO string
}
