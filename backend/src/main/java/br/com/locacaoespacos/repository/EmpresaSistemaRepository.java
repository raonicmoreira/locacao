package br.com.locacaoespacos.repository;

import br.com.locacaoespacos.domain.EmpresaSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmpresaSistemaRepository extends JpaRepository<EmpresaSistema, UUID> {
    List<EmpresaSistema> findBySistemaId(UUID sistemaId);
    Optional<EmpresaSistema> findBySistemaIdAndEmpresaId(UUID sistemaId, UUID empresaId);
    boolean existsBySistemaIdAndEmpresaId(UUID sistemaId, UUID empresaId);
}
