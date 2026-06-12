package br.com.locacaoespacos.api;

import br.com.locacaoespacos.api.dto.request.EspacoRequest;
import br.com.locacaoespacos.api.dto.response.EspacoResponse;
import br.com.locacaoespacos.config.SessaoUtils;
import br.com.locacaoespacos.service.EspacoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/espacos")
@RequiredArgsConstructor
public class EspacoController {

    private final EspacoService espacoService;

    @GetMapping
    public ResponseEntity<List<EspacoResponse>> listar() {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(espacoService.listar());
    }

    @PostMapping
    public ResponseEntity<EspacoResponse> criar(@Valid @RequestBody EspacoRequest req) {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(espacoService.criar(req));
    }

    @PostMapping("/{id}")
    public ResponseEntity<EspacoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody EspacoRequest req) {
        SessaoUtils.validarProprietario();
        return ResponseEntity.ok(espacoService.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        SessaoUtils.validarProprietario();
        espacoService.excluir(id);
        return ResponseEntity.ok().build();
    }
}
