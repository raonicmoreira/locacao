package br.com.locacaoespacos.config;

import br.com.locacaoespacos.exception.AcessoNegadoException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SessaoUtils {

    private SessaoUtils() {
        // utilitário estático — não deve ser instanciado
    }

    public static SessaoUsuario getSessaoAtual() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof SessaoUsuario sessao) {
            return sessao;
        }
        throw new AcessoNegadoException("Usuário não autenticado.");
    }

    public static UUID getIdEmpresaSistema() {
        return getSessaoAtual().getIdEmpresaSistema();
    }

    public static String getPerfil() {
        return getSessaoAtual().getPerfil();
    }

    public static void validarProprietario() {
        if (!"PROPRIETARIO".equals(getPerfil())) {
            throw new AcessoNegadoException("Acesso restrito a proprietários.");
        }
    }
}
