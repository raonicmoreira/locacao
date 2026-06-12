package br.com.locacaoespacos.client;

import br.com.locacaoespacos.client.dto.*;
import br.com.locacaoespacos.exception.IntegracaoException;
import br.com.locacaoespacos.exception.NegocioException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;

@Service
public class ControleAcessoClient {

    private final WebClient webClient;

    public ControleAcessoClient(WebClient controleAcessoWebClient) {
        this.webClient = controleAcessoWebClient;
    }

    // -------------------------------------------------------------------------
    // POST /usuarios/login
    // -------------------------------------------------------------------------

    public MsLoginResponse login(String email, String senha, String codigoSistema) {
        MsLoginRequest request = MsLoginRequest.builder()
                .email(email)
                .senha(senha)
                .codigoSistema(codigoSistema)
                .build();

        try {
            return webClient.post()
                    .uri("/usuarios/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(status -> status.value() == HttpStatus.UNAUTHORIZED.value()
                                    || status.value() == HttpStatus.FORBIDDEN.value(),
                            response -> Mono.error(new NegocioException("Credenciais inválidas.")))
                    .onStatus(status -> status.is4xxClientError(),
                            response -> response.bodyToMono(JsonNode.class)
                                    .map(body -> {
                                        String msg = body.has("erros") && body.get("erros").size() > 0
                                                ? body.get("erros").get(0).get("descricao").asText()
                                                : "Erro ao processar requisição.";
                                        return new NegocioException(msg);
                                    }))
                    .bodyToMono(MsLoginResponse.class)
                    .block();
        } catch (WebClientRequestException e) {
            throw new IntegracaoException("Serviço de autenticação temporariamente indisponível.", e);
        }
    }

    // -------------------------------------------------------------------------
    // POST /usuarios/ativar
    // -------------------------------------------------------------------------

    public void ativarConta(String token, String senha) {
        MsAtivarContaRequest request = MsAtivarContaRequest.builder()
                .token(token)
                .senha(senha)
                .build();

        try {
            webClient.post()
                    .uri("/usuarios/ativar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(status -> status.value() == HttpStatus.UNAUTHORIZED.value()
                                    || status.value() == HttpStatus.FORBIDDEN.value(),
                            response -> Mono.error(new NegocioException("Credenciais inválidas.")))
                    .onStatus(status -> status.is4xxClientError(),
                            response -> response.bodyToMono(JsonNode.class)
                                    .map(body -> {
                                        String msg = body.has("erros") && body.get("erros").size() > 0
                                                ? body.get("erros").get(0).get("descricao").asText()
                                                : "Erro ao processar requisição.";
                                        return new NegocioException(msg);
                                    }))
                    .toBodilessEntity()
                    .block();
        } catch (WebClientRequestException e) {
            throw new IntegracaoException("Serviço de autenticação temporariamente indisponível.", e);
        }
    }

    // -------------------------------------------------------------------------
    // GET /usuarios/email/{email}
    // -------------------------------------------------------------------------

    public Optional<MsUsuarioResponse> buscarPorEmail(String email) {
        try {
            MsUsuarioResponse response = webClient.get()
                    .uri("/usuarios/email/{email}", email)
                    .retrieve()
                    .onStatus(status -> status.value() == HttpStatus.NOT_FOUND.value(),
                            r -> Mono.empty())
                    .onStatus(status -> status.value() == HttpStatus.UNAUTHORIZED.value()
                                    || status.value() == HttpStatus.FORBIDDEN.value(),
                            r -> Mono.error(new NegocioException("Credenciais inválidas.")))
                    .onStatus(status -> status.is4xxClientError(),
                            r -> r.bodyToMono(JsonNode.class)
                                    .map(body -> {
                                        String msg = body.has("erros") && body.get("erros").size() > 0
                                                ? body.get("erros").get(0).get("descricao").asText()
                                                : "Erro ao processar requisição.";
                                        return new NegocioException(msg);
                                    }))
                    .bodyToMono(MsUsuarioResponse.class)
                    .block();

            return Optional.ofNullable(response);
        } catch (WebClientRequestException e) {
            throw new IntegracaoException("Serviço de autenticação temporariamente indisponível.", e);
        }
    }

    // -------------------------------------------------------------------------
    // GET /usuarios/sistema/{codigoSistema}/empresa/{codigoEmpresa}
    // -------------------------------------------------------------------------

    public List<MsUsuarioResponse> listarUsuariosPorEmpresa(String codigoSistema, String codigoEmpresa) {
        try {
            return webClient.get()
                    .uri("/usuarios/sistema/{codigoSistema}/empresa/{codigoEmpresa}",
                            codigoSistema, codigoEmpresa)
                    .retrieve()
                    .onStatus(status -> status.value() == HttpStatus.UNAUTHORIZED.value()
                                    || status.value() == HttpStatus.FORBIDDEN.value(),
                            response -> Mono.error(new NegocioException("Credenciais inválidas.")))
                    .onStatus(status -> status.is4xxClientError(),
                            response -> response.bodyToMono(JsonNode.class)
                                    .map(body -> {
                                        String msg = body.has("erros") && body.get("erros").size() > 0
                                                ? body.get("erros").get(0).get("descricao").asText()
                                                : "Erro ao processar requisição.";
                                        return new NegocioException(msg);
                                    }))
                    .bodyToMono(new ParameterizedTypeReference<List<MsUsuarioResponse>>() {})
                    .block();
        } catch (WebClientRequestException e) {
            throw new IntegracaoException("Serviço de autenticação temporariamente indisponível.", e);
        }
    }

    // -------------------------------------------------------------------------
    // POST /usuarios
    // -------------------------------------------------------------------------

    public MsUsuarioResponse criarUsuario(String nome, String email, String urlAtivacao) {
        MsCriarUsuarioRequest request = MsCriarUsuarioRequest.builder()
                .nome(nome)
                .email(email)
                .urlAtivacao(urlAtivacao)
                .build();

        try {
            return webClient.post()
                    .uri("/usuarios")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(status -> status.value() == HttpStatus.UNAUTHORIZED.value()
                                    || status.value() == HttpStatus.FORBIDDEN.value(),
                            response -> Mono.error(new NegocioException("Credenciais inválidas.")))
                    .onStatus(status -> status.is4xxClientError(),
                            response -> response.bodyToMono(JsonNode.class)
                                    .map(body -> {
                                        String msg = body.has("erros") && body.get("erros").size() > 0
                                                ? body.get("erros").get(0).get("descricao").asText()
                                                : "Erro ao processar requisição.";
                                        return new NegocioException(msg);
                                    }))
                    .bodyToMono(MsUsuarioResponse.class)
                    .block();
        } catch (WebClientRequestException e) {
            throw new IntegracaoException("Serviço de autenticação temporariamente indisponível.", e);
        }
    }

    // -------------------------------------------------------------------------
    // POST /usuarios/{idUsuario}/sistema/{codigoSistema}/empresa/{codigoEmpresa}/perfil
    // -------------------------------------------------------------------------

    public void associarPerfil(String idUsuario, String codigoSistema, String codigoEmpresa, String idPerfil) {
        MsAssociarPerfilRequest request = MsAssociarPerfilRequest.builder()
                .idPerfil(idPerfil)
                .build();

        try {
            webClient.post()
                    .uri("/usuarios/{idUsuario}/sistema/{codigoSistema}/empresa/{codigoEmpresa}/perfil",
                            idUsuario, codigoSistema, codigoEmpresa)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(status -> status.value() == HttpStatus.UNAUTHORIZED.value()
                                    || status.value() == HttpStatus.FORBIDDEN.value(),
                            response -> Mono.error(new NegocioException("Credenciais inválidas.")))
                    .onStatus(status -> status.is4xxClientError(),
                            response -> response.bodyToMono(JsonNode.class)
                                    .map(body -> {
                                        String msg = body.has("erros") && body.get("erros").size() > 0
                                                ? body.get("erros").get(0).get("descricao").asText()
                                                : "Erro ao processar requisição.";
                                        return new NegocioException(msg);
                                    }))
                    .toBodilessEntity()
                    .block();
        } catch (WebClientRequestException e) {
            throw new IntegracaoException("Serviço de autenticação temporariamente indisponível.", e);
        }
    }
}
