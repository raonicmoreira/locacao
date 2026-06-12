package br.com.locacaoespacos.util;

import br.com.locacaoespacos.enums.DiaSemanaEnum;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public class BitmaskUtils {

    private BitmaskUtils() {
        // utilitário estático
    }

    public static int toMask(Set<DiaSemanaEnum> dias) {
        if (dias == null || dias.isEmpty()) {
            return 0;
        }
        return dias.stream()
                .mapToInt(DiaSemanaEnum::getBit)
                .reduce(0, (a, b) -> a | b);
    }

    public static Set<DiaSemanaEnum> fromMask(Integer mask) {
        if (mask == null || mask == 0) {
            return Set.of();
        }
        return Arrays.stream(DiaSemanaEnum.values())
                .filter(d -> (mask & d.getBit()) != 0)
                .collect(Collectors.toSet());
    }
}
