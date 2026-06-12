package br.com.locacaoespacos.api;

import br.com.locacaoespacos.api.dto.request.AtivarContaRequest;
import br.com.locacaoespacos.api.dto.request.LoginRequest;
import br.com.locacaoespacos.api.dto.response.LoginResponse;
import br.com.locacaoespacos.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/ativar")
    public ResponseEntity<Void> ativarConta(@Valid @RequestBody AtivarContaRequest req) {
        authService.ativarConta(req);
        return ResponseEntity.ok().build();
    }
}
