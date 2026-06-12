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
public class AtivarContaRequest {

    @NotBlank
    private String token;

    @NotBlank
    private String senha;
}
