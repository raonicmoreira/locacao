package br.com.locacaoespacos.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "espaco")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Espaco {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa_sistema", nullable = false)
    private EmpresaSistema empresaSistema;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_grupo", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_espaco_tipo_locacao", nullable = false)
    private EspacoTipoLocacao espacoTipoLocacao;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    @Column(name = "status", nullable = false)
    private Integer status;

    @Column(name = "valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "endereco")
    private String endereco;

    @Column(name = "observacoes")
    private String observacoes;

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
