package br.com.locacaoespacos.service;

import br.com.locacaoespacos.api.dto.request.EspacoRequest;
import br.com.locacaoespacos.api.dto.response.EspacoResponse;
import br.com.locacaoespacos.config.SessaoUtils;
import br.com.locacaoespacos.domain.Espaco;
import br.com.locacaoespacos.domain.EmpresaSistema;
import br.com.locacaoespacos.domain.Grupo;
import br.com.locacaoespacos.domain.EspacoTipoLocacao;
import br.com.locacaoespacos.exception.RecursoNaoEncontradoException;
import br.com.locacaoespacos.repository.EmpresaSistemaRepository;
import br.com.locacaoespacos.repository.EspacoRepository;
import br.com.locacaoespacos.repository.EspacoTipoLocacaoRepository;
import br.com.locacaoespacos.repository.GrupoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EspacoService {

    private final EspacoRepository espacoRepository;
    private final GrupoRepository grupoRepository;
    private final EspacoTipoLocacaoRepository espacoTipoLocacaoRepository;
    private final EmpresaSistemaRepository empresaSistemaRepository;

    public List<EspacoResponse> listar() {
        SessaoUtils.validarProprietario();
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        return espacoRepository.findByEmpresaSistemaId(idEmpresaSistema)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EspacoResponse criar(EspacoRequest req) {
        SessaoUtils.validarProprietario();
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();

        EmpresaSistema empresaSistema = empresaSistemaRepository.findById(idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Empresa não encontrada."));

        Grupo grupo = grupoRepository.findByIdAndEmpresaSistemaId(req.getIdGrupo(), idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Grupo não encontrado ou não pertence à empresa."));

        EspacoTipoLocacao tipo = espacoTipoLocacaoRepository.findByIdAndEmpresaSistemaId(req.getIdEspacoTipoLocacao(), idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de locação não encontrado ou não pertence à empresa."));

        Espaco espaco = Espaco.builder()
                .empresaSistema(empresaSistema)
                .grupo(grupo)
                .espacoTipoLocacao(tipo)
                .descricao(req.getDescricao())
                .status(req.getStatus())
                .valor(req.getValor())
                .endereco(req.getEndereco())
                .observacoes(req.getObservacoes())
                .build();

        return toResponse(espacoRepository.save(espaco));
    }

    public EspacoResponse atualizar(UUID id, EspacoRequest req) {
        SessaoUtils.validarProprietario();
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();

        Espaco espaco = espacoRepository.findByIdAndEmpresaSistemaId(id, idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Espaço não encontrado."));

        Grupo grupo = grupoRepository.findByIdAndEmpresaSistemaId(req.getIdGrupo(), idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Grupo não encontrado ou não pertence à empresa."));

        EspacoTipoLocacao tipo = espacoTipoLocacaoRepository.findByIdAndEmpresaSistemaId(req.getIdEspacoTipoLocacao(), idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de locação não encontrado ou não pertence à empresa."));

        espaco.setGrupo(grupo);
        espaco.setEspacoTipoLocacao(tipo);
        espaco.setDescricao(req.getDescricao());
        espaco.setStatus(req.getStatus());
        espaco.setValor(req.getValor());
        espaco.setEndereco(req.getEndereco());
        espaco.setObservacoes(req.getObservacoes());

        return toResponse(espacoRepository.save(espaco));
    }

    public void excluir(UUID id) {
        SessaoUtils.validarProprietario();
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        Espaco espaco = espacoRepository.findByIdAndEmpresaSistemaId(id, idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Espaço não encontrado."));
        espacoRepository.deleteById(espaco.getId());
    }

    private EspacoResponse toResponse(Espaco espaco) {
        return EspacoResponse.builder()
                .id(espaco.getId())
                .idGrupo(espaco.getGrupo().getId())
                .grupoDescricao(espaco.getGrupo().getDescricao())
                .idEspacoTipoLocacao(espaco.getEspacoTipoLocacao().getId())
                .tipoLocacaoDescricao(espaco.getEspacoTipoLocacao().getDescricao())
                .descricao(espaco.getDescricao())
                .status(espaco.getStatus())
                .statusDescricao(espaco.getStatus() == 1 ? "ATIVO" : "INATIVO")
                .valor(espaco.getValor())
                .endereco(espaco.getEndereco())
                .observacoes(espaco.getObservacoes())
                .atualizadoEm(espaco.getAtualizadoEm().toString())
                .build();
    }
}
