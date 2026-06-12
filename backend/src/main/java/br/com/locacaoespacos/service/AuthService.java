package br.com.locacaoespacos.service;

import br.com.locacaoespacos.api.dto.request.AtivarContaRequest;
import br.com.locacaoespacos.api.dto.request.LoginRequest;
import br.com.locacaoespacos.api.dto.response.EmpresaResponse;
import br.com.locacaoespacos.api.dto.response.LoginResponse;
import br.com.locacaoespacos.client.ControleAcessoClient;
import br.com.locacaoespacos.client.dto.MsLoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ControleAcessoClient controleAcessoClient;

    @Value("${app.sistema-codigo}")
    private Integer sistemaCodigo;

    public LoginResponse login(LoginRequest req) {
        MsLoginResponse msResponse = controleAcessoClient.login(
                req.getEmail(),
                req.getSenha(),
                String.valueOf(sistemaCodigo)
        );

        List<EmpresaResponse> empresas = msResponse.getEmpresas() == null
                ? List.of()
                : msResponse.getEmpresas().stream()
                        .map(msEmpresa -> EmpresaResponse.builder()
                                .id(msEmpresa.getCodigo())
                                .descricao(msEmpresa.getNome())
                                .build())
                        .toList();

        return LoginResponse.builder()
                .token(msResponse.getToken())
                .nome(msResponse.getNome())
                .email(msResponse.getEmail())
                .empresas(empresas)
                .build();
    }

    public void ativarConta(AtivarContaRequest req) {
        controleAcessoClient.ativarConta(req.getToken(), req.getSenha());
    }
}
