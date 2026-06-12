package br.com.locacaoespacos.api;

import br.com.locacaoespacos.api.dto.request.GrupoRequest;
import br.com.locacaoespacos.api.dto.response.GrupoResponse;
import br.com.locacaoespacos.config.SessaoUtils;
import br.com.locacaoespacos.service.GrupoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/grupos")
@RequiredArgsConstructor
public class GrupoController {

    private final GrupoService grupoService;

    @GetMapping
    public ResponseEntity<List<GrupoResponse>> listar() {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(grupoService.listar());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<GrupoResponse>> listarAtivos() {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(grupoService.listarAtivos());
    }

    @PostMapping
    public ResponseEntity<GrupoResponse> criar(@Valid @RequestBody GrupoRequest req) {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(grupoService.criar(req));
    }

    @PostMapping("/{id}")
    public ResponseEntity<GrupoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody GrupoRequest req) {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(grupoService.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        SessaoUtils.validarProprietario();
        grupoService.excluir(id);
        return ResponseEntity.ok().build();
    }
}
