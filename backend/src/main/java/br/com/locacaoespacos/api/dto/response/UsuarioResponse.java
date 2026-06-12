package br.com.locacaoespacos.api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Builder
@Getter
@JsonInclude(NON_NULL)
public class UsuarioResponse {

    private String id;
    private String nome;
    private String email;
    private Integer status;
}
