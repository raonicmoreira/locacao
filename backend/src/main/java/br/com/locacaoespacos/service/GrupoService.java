package br.com.locacaoespacos.service;

import br.com.locacaoespacos.api.dto.request.GrupoRequest;
import br.com.locacaoespacos.api.dto.response.GrupoResponse;
import br.com.locacaoespacos.config.SessaoUtils;
import br.com.locacaoespacos.domain.Grupo;
import br.com.locacaoespacos.exception.ConflitoDependenciaException;
import br.com.locacaoespacos.exception.RecursoNaoEncontradoException;
import br.com.locacaoespacos.repository.EmpresaSistemaRepository;
import br.com.locacaoespacos.repository.EspacoRepository;
import br.com.locacaoespacos.repository.GrupoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GrupoService {

    private final GrupoRepository grupoRepository;
    private final EspacoRepository espacoRepository;
    private final EmpresaSistemaRepository empresaSistemaRepository;

    public List<GrupoResponse> listar() {
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        return grupoRepository.findByEmpresaSistemaId(idEmpresaSistema)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<GrupoResponse> listarAtivos() {
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        return grupoRepository.findByEmpresaSistemaIdAndStatus(idEmpresaSistema, 1)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public GrupoResponse criar(GrupoRequest req) {
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        var empresaSistema = empresaSistemaRepository.findById(idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Empresa não encontrada."));

        Grupo grupo = Grupo.builder()
                .empresaSistema(empresaSistema)
                .descricao(req.getDescricao())
                .status(req.getStatus() != null ? req.getStatus() : 1)
                .build();

        return toResponse(grupoRepository.save(grupo));
    }

    public GrupoResponse atualizar(UUID id, GrupoRequest req) {
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        Grupo grupo = grupoRepository.findByIdAndEmpresaSistemaId(id, idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Grupo não encontrado."));

        grupo.setDescricao(req.getDescricao());
        if (req.getStatus() != null) {
            grupo.setStatus(req.getStatus());
        }

        return toResponse(grupoRepository.save(grupo));
    }

    public void excluir(UUID id) {
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        grupoRepository.findByIdAndEmpresaSistemaId(id, idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Grupo não encontrado."));

        if (espacoRepository.countByGrupoId(id) > 0) {
            throw new ConflitoDependenciaException(
                    "Não é possível excluir o grupo pois há espaços vinculados a ele.");
        }

        grupoRepository.deleteById(id);
    }

    private GrupoResponse toResponse(Grupo grupo) {
        return GrupoResponse.builder()
                .id(grupo.getId())
                .descricao(grupo.getDescricao())
                .status(grupo.getStatus())
                .statusDescricao(grupo.getStatus() == 1 ? "ATIVO" : "INATIVO")
                .atualizadoEm(grupo.getAtualizadoEm().toString())
                .build();
    }
}
