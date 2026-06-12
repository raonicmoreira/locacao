package br.com.locacaoespacos.api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Builder
@Getter
@JsonInclude(NON_NULL)
public class EspacoTipoLocacaoResponse {

    private UUID id;
    private String descricao;
    private Integer modalidadeLocacao;
    private String modalidadeDescricao;        // "MES", "DIA" ou "HORA"
    private Integer diasSemana;                // bitmask raw
    private List<String> diasSemanaDescricao; // ["Dom","Seg",...] derivado do bitmask
    private String horaInicio;
    private String horaFim;
    private Integer status;
    private String statusDescricao;
    private String atualizadoEm;
}
