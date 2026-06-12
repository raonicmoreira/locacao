package br.com.locacaoespacos.repository;

import br.com.locacaoespacos.domain.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, UUID> {
    List<Grupo> findByEmpresaSistemaId(UUID empresaSistemaId);
    List<Grupo> findByEmpresaSistemaIdAndStatus(UUID empresaSistemaId, Integer status);
    Optional<Grupo> findByIdAndEmpresaSistemaId(UUID id, UUID empresaSistemaId);
    long countByIdAndEmpresaSistemaId(UUID id, UUID empresaSistemaId);
}
