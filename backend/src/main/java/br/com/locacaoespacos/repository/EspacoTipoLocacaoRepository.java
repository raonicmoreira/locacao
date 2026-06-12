package br.com.locacaoespacos.repository;

import br.com.locacaoespacos.domain.EspacoTipoLocacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EspacoTipoLocacaoRepository extends JpaRepository<EspacoTipoLocacao, UUID> {
    List<EspacoTipoLocacao> findByEmpresaSistemaId(UUID empresaSistemaId);
    List<EspacoTipoLocacao> findByEmpresaSistemaIdAndStatus(UUID empresaSistemaId, Integer status);
    Optional<EspacoTipoLocacao> findByIdAndEmpresaSistemaId(UUID id, UUID empresaSistemaId);
}
