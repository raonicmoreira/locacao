package br.com.locacaoespacos.service;

import br.com.locacaoespacos.api.dto.request.AtualizarPerfilRequest;
import br.com.locacaoespacos.api.dto.request.CriarUsuarioRequest;
import br.com.locacaoespacos.api.dto.response.UsuarioResponse;
import br.com.locacaoespacos.api.dto.response.VerificarEmailResponse;
import br.com.locacaoespacos.client.ControleAcessoClient;
import br.com.locacaoespacos.client.dto.MsUsuarioResponse;
import br.com.locacaoespacos.config.SessaoUtils;
import br.com.locacaoespacos.exception.NegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final ControleAcessoClient controleAcessoClient;

    @Value("${app.sistema-codigo}")
    private String sistemaCodigo;

    @Value("${app.url}")
    private String appUrl;

    // -------------------------------------------------------------------------
    // GET /api/usuarios
    // -------------------------------------------------------------------------

    public List<UsuarioResponse> listar() {
        String codigoEmpresa = SessaoUtils.getIdEmpresaSistema().toString();

        return controleAcessoClient.listarUsuariosPorEmpresa(sistemaCodigo, codigoEmpresa)
                .stream()
                .map(this::toUsuarioResponse)
                .toList();
    }

    // -------------------------------------------------------------------------
    // POST /api/usuarios/verificar-email
    // -------------------------------------------------------------------------

    public VerificarEmailResponse verificarEmail(String email) {
        Optional<MsUsuarioResponse> usuarioOpt = controleAcessoClient.buscarPorEmail(email);

        if (usuarioOpt.isPresent()) {
            MsUsuarioResponse usuario = usuarioOpt.get();
            return VerificarEmailResponse.builder()
                    .existe(true)
                    .id(usuario.getId())
                    .nome(usuario.getNome())
                    .email(usuario.getEmail())
                    .build();
        }

        return VerificarEmailResponse.builder()
                .existe(false)
                .email(email)
                .build();
    }

    // -------------------------------------------------------------------------
    // POST /api/usuarios
    // -------------------------------------------------------------------------

    public UsuarioResponse criar(CriarUsuarioRequest req) {
        String codigoEmpresa = SessaoUtils.getIdEmpresaSistema().toString();
        String urlAtivacao = appUrl + "/ativar";

        Optional<MsUsuarioResponse> usuarioOpt = controleAcessoClient.buscarPorEmail(req.getEmail());

        MsUsuarioResponse usuario;
        if (usuarioOpt.isEmpty()) {
            usuario = controleAcessoClient.criarUsuario(req.getNome(), req.getEmail(), urlAtivacao);
        } else {
            usuario = usuarioOpt.get();
        }

        controleAcessoClient.associarPerfil(usuario.getId(), sistemaCodigo, codigoEmpresa, req.getIdPerfil());

        return toUsuarioResponse(usuario);
    }

    // -------------------------------------------------------------------------
    // POST /api/usuarios/{idUsuario}/perfil
    // -------------------------------------------------------------------------

    public void atualizarPerfil(String idUsuario, AtualizarPerfilRequest req) {
        String codigoEmpresa = SessaoUtils.getIdEmpresaSistema().toString();
        controleAcessoClient.associarPerfil(idUsuario, sistemaCodigo, codigoEmpresa, req.getIdPerfil());
    }

    // -------------------------------------------------------------------------
    // DELETE /api/usuarios/{idUsuario}
    // -------------------------------------------------------------------------

    public void remover(String idUsuario) {
        throw new NegocioException("Funcionalidade não disponível nesta versão.");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private UsuarioResponse toUsuarioResponse(MsUsuarioResponse ms) {
        return UsuarioResponse.builder()
                .id(ms.getId())
                .nome(ms.getNome())
                .email(ms.getEmail())
                .status(ms.getStatus())
                .build();
    }
}
