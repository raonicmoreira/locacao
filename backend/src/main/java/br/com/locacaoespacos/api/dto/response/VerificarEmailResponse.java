package br.com.locacaoespacos.api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Builder
@Getter
@JsonInclude(NON_NULL)
public class VerificarEmailResponse {

    private boolean existe;
    private String id;    // null se não existe
    private String nome;  // null se não existe
    private String email;
}
