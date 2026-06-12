package br.com.locacaoespacos.repository;

import br.com.locacaoespacos.domain.Espaco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EspacoRepository extends JpaRepository<Espaco, UUID> {
    List<Espaco> findByEmpresaSistemaId(UUID empresaSistemaId);
    Optional<Espaco> findByIdAndEmpresaSistemaId(UUID id, UUID empresaSistemaId);
    long countByGrupoId(UUID grupoId);
    long countByEspacoTipoLocacaoId(UUID espacoTipoLocacaoId);
    boolean existsByIdAndEmpresaSistemaId(UUID id, UUID empresaSistemaId);
}
