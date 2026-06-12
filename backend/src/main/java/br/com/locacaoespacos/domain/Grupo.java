package br.com.locacaoespacos.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "grupo")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa_sistema", nullable = false)
    private EmpresaSistema empresaSistema;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    @Column(name = "status", nullable = false)
    private Integer status;

    @Column(name = "atualizado_em", columnDefinition = "TIMESTAMP", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }
}
