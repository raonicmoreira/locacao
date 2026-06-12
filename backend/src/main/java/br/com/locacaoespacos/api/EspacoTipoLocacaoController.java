package br.com.locacaoespacos.api;

import br.com.locacaoespacos.api.dto.request.EspacoTipoLocacaoRequest;
import br.com.locacaoespacos.api.dto.response.EspacoTipoLocacaoResponse;
import br.com.locacaoespacos.config.SessaoUtils;
import br.com.locacaoespacos.service.EspacoTipoLocacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tipos-locacao")
@RequiredArgsConstructor
public class EspacoTipoLocacaoController {

    private final EspacoTipoLocacaoService espacoTipoLocacaoService;

    @GetMapping
    public ResponseEntity<List<EspacoTipoLocacaoResponse>> listar() {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(espacoTipoLocacaoService.listar());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<EspacoTipoLocacaoResponse>> listarAtivos() {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(espacoTipoLocacaoService.listarAtivos());
    }

    @PostMapping
    public ResponseEntity<EspacoTipoLocacaoResponse> criar(
            @Valid @RequestBody EspacoTipoLocacaoRequest req) {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(espacoTipoLocacaoService.criar(req));
    }

    @PostMapping("/{id}")
    public ResponseEntity<EspacoTipoLocacaoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody EspacoTipoLocacaoRequest req) {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(espacoTipoLocacaoService.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        SessaoUtils.validarProprietario();
        espacoTipoLocacaoService.excluir(id);
        return ResponseEntity.ok().build();
    }
}
