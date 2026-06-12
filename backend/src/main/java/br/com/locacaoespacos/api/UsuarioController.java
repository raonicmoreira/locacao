package br.com.locacaoespacos.api;

import br.com.locacaoespacos.api.dto.request.AtualizarPerfilRequest;
import br.com.locacaoespacos.api.dto.request.CriarUsuarioRequest;
import br.com.locacaoespacos.api.dto.request.VerificarEmailRequest;
import br.com.locacaoespacos.api.dto.response.UsuarioResponse;
import br.com.locacaoespacos.api.dto.response.VerificarEmailResponse;
import br.com.locacaoespacos.config.SessaoUtils;
import br.com.locacaoespacos.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(usuarioService.listar());
    }

    @PostMapping("/verificar-email")
    public ResponseEntity<VerificarEmailResponse> verificarEmail(@Valid @RequestBody VerificarEmailRequest req) {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(usuarioService.verificarEmail(req.getEmail()));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody CriarUsuarioRequest req) {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(usuarioService.criar(req));
    }

    @PostMapping("/{idUsuario}/perfil")
    public ResponseEntity<Void> atualizarPerfil(
            @PathVariable String idUsuario,
            @Valid @RequestBody AtualizarPerfilRequest req) {
        SessaoUtils.validarProprietario();
        usuarioService.atualizarPerfil(idUsuario, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{idUsuario}")
    public ResponseEntity<Void> remover(@PathVariable String idUsuario) {
        SessaoUtils.validarProprietario();
        usuarioService.remover(idUsuario);
        return ResponseEntity.ok().build();
    }
}
