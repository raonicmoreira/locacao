package br.com.locacaoespacos.enums;

import lombok.Getter;

@Getter
public enum StatusEnum {

    INATIVO(0),
    ATIVO(1);

    private final int valor;

    StatusEnum(int valor) {
        this.valor = valor;
    }

    public static StatusEnum fromValor(int valor) {
        for (StatusEnum status : values()) {
            if (status.valor == valor) {
                return status;
            }
        }
        throw new IllegalArgumentException("Valor inválido para StatusEnum: " + valor);
    }
}
