package br.com.locacaoespacos.config;

import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
public class SessaoUsuario implements Authentication {
    private String token;
    private String email;
    private UUID idEmpresaSistema;
    private String perfil;
    private boolean autenticado;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + perfil));
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getDetails() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return email;
    }

    @Override
    public boolean isAuthenticated() {
        return autenticado;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) {
        this.autenticado = isAuthenticated;
    }

    @Override
    public String getName() {
        return email;
    }
}
