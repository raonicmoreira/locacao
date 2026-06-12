package br.com.locacaoespacos.enums;

import lombok.Getter;

@Getter
public enum ModalidadeLocacaoEnum {

    MES(0),
    DIA(1),
    HORA(2);

    private final int valor;

    ModalidadeLocacaoEnum(int valor) {
        this.valor = valor;
    }

    public static ModalidadeLocacaoEnum fromValor(int valor) {
        for (ModalidadeLocacaoEnum modalidade : values()) {
            if (modalidade.valor == valor) {
                return modalidade;
            }
        }
        throw new IllegalArgumentException("Valor inválido para ModalidadeLocacaoEnum: " + valor);
    }
}
