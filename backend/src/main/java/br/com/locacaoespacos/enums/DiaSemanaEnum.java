package br.com.locacaoespacos.enums;

import lombok.Getter;

@Getter
public enum DiaSemanaEnum {

    DOM(1, "Dom"),
    SEG(2, "Seg"),
    TER(4, "Ter"),
    QUA(8, "Qua"),
    QUI(16, "Qui"),
    SEX(32, "Sex"),
    SAB(64, "Sab");

    private final int bit;
    private final String label;

    DiaSemanaEnum(int bit, String label) {
        this.bit = bit;
        this.label = label;
    }

    public static DiaSemanaEnum fromBit(int bit) {
        for (DiaSemanaEnum dia : values()) {
            if (dia.bit == bit) {
                return dia;
            }
        }
        throw new IllegalArgumentException("Bit inválido para DiaSemanaEnum: " + bit);
    }
}
