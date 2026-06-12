package br.com.locacaoespacos.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String[] parts = token.split("\\.");
                if (parts.length == 3) {
                    // Decodifica o payload JWT (base64url decode da segunda parte, sem verificar assinatura)
                    String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
                    JsonNode payload = objectMapper.readTree(payloadJson);

                    String email = payload.has("sub") ? payload.get("sub").asText() : null;
                    String idEmpresaSistemaStr = payload.has("idEmpresaSistema")
                            ? payload.get("idEmpresaSistema").asText() : null;
                    String perfil = payload.has("perfil")
                            ? payload.get("perfil").asText() : "LOCATARIO";

                    if (email != null && idEmpresaSistemaStr != null) {
                        UUID idEmpresaSistema = UUID.fromString(idEmpresaSistemaStr);
                        SessaoUsuario sessao = SessaoUsuario.builder()
                                .token(token)
                                .email(email)
                                .idEmpresaSistema(idEmpresaSistema)
                                .perfil(perfil)
                                .autenticado(true)
                                .build();
                        SecurityContextHolder.getContext().setAuthentication(sessao);
                    }
                }
            } catch (Exception ignored) {
                // Token inválido — SecurityContext permanece sem autenticação
            }
        }
        filterChain.doFilter(request, response);
    }
}
