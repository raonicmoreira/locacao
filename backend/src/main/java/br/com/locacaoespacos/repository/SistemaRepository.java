package br.com.locacaoespacos.repository;

import br.com.locacaoespacos.domain.Sistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SistemaRepository extends JpaRepository<Sistema, UUID> {
    Optional<Sistema> findByCodigo(Integer codigo);
}
