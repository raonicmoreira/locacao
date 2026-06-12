package br.com.locacaoespacos.service;

import br.com.locacaoespacos.api.dto.request.EspacoTipoLocacaoRequest;
import br.com.locacaoespacos.api.dto.response.EspacoTipoLocacaoResponse;
import br.com.locacaoespacos.config.SessaoUtils;
import br.com.locacaoespacos.domain.EspacoTipoLocacao;
import br.com.locacaoespacos.enums.DiaSemanaEnum;
import br.com.locacaoespacos.enums.ModalidadeLocacaoEnum;
import br.com.locacaoespacos.exception.ConflitoDependenciaException;
import br.com.locacaoespacos.exception.NegocioException;
import br.com.locacaoespacos.exception.RecursoNaoEncontradoException;
import br.com.locacaoespacos.repository.EmpresaSistemaRepository;
import br.com.locacaoespacos.repository.EspacoRepository;
import br.com.locacaoespacos.repository.EspacoTipoLocacaoRepository;
import br.com.locacaoespacos.util.BitmaskUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EspacoTipoLocacaoService {

    private final EspacoTipoLocacaoRepository espacoTipoLocacaoRepository;
    private final EspacoRepository espacoRepository;
    private final EmpresaSistemaRepository empresaSistemaRepository;

    public List<EspacoTipoLocacaoResponse> listar() {
        SessaoUtils.validarProprietario();
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        return espacoTipoLocacaoRepository.findByEmpresaSistemaId(idEmpresaSistema)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EspacoTipoLocacaoResponse> listarAtivos() {
        SessaoUtils.validarProprietario();
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        return espacoTipoLocacaoRepository.findByEmpresaSistemaIdAndStatus(idEmpresaSistema, 1)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EspacoTipoLocacaoResponse criar(EspacoTipoLocacaoRequest req) {
        SessaoUtils.validarProprietario();
        validarCamposPorModalidade(req);

        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        var empresaSistema = empresaSistemaRepository.findById(idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Empresa não encontrada."));

        EspacoTipoLocacao entity = EspacoTipoLocacao.builder()
                .empresaSistema(empresaSistema)
                .descricao(req.getDescricao())
                .modalidadeLocacao(req.getModalidadeLocacao())
                .diasSemana(req.getDiasSemana())
                .horaInicio(parseHora(req.getHoraInicio()))
                .horaFim(parseHora(req.getHoraFim()))
                .status(req.getStatus() != null ? req.getStatus() : 1)
                .build();

        return toResponse(espacoTipoLocacaoRepository.save(entity));
    }

    public EspacoTipoLocacaoResponse atualizar(UUID id, EspacoTipoLocacaoRequest req) {
        SessaoUtils.validarProprietario();
        validarCamposPorModalidade(req);

        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        EspacoTipoLocacao entity = espacoTipoLocacaoRepository.findByIdAndEmpresaSistemaId(id, idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de locação não encontrado."));

        entity.setDescricao(req.getDescricao());
        entity.setModalidadeLocacao(req.getModalidadeLocacao());
        entity.setDiasSemana(req.getDiasSemana());
        entity.setHoraInicio(parseHora(req.getHoraInicio()));
        entity.setHoraFim(parseHora(req.getHoraFim()));
        if (req.getStatus() != null) {
            entity.setStatus(req.getStatus());
        }

        return toResponse(espacoTipoLocacaoRepository.save(entity));
    }

    public void excluir(UUID id) {
        SessaoUtils.validarProprietario();
        UUID idEmpresaSistema = SessaoUtils.getIdEmpresaSistema();
        EspacoTipoLocacao entity = espacoTipoLocacaoRepository.findByIdAndEmpresaSistemaId(id, idEmpresaSistema)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de locação não encontrado."));

        if (espacoRepository.countByEspacoTipoLocacaoId(id) > 0) {
            throw new ConflitoDependenciaException(
                    "Não é possível excluir o tipo de locação pois há espaços associados a ele.");
        }

        espacoTipoLocacaoRepository.deleteById(entity.getId());
    }

    public void validarCamposPorModalidade(EspacoTipoLocacaoRequest req) {
        ModalidadeLocacaoEnum modalidade = ModalidadeLocacaoEnum.fromValor(req.getModalidadeLocacao());

        switch (modalidade) {
            case MES -> {
                if (req.getDiasSemana() != null) {
                    throw new NegocioException(
                            "Modalidade MES não permite informar dias da semana.");
                }
                if (req.getHoraInicio() != null && !req.getHoraInicio().isBlank()) {
                    throw new NegocioException(
                            "Modalidade MES não permite informar horário de início.");
                }
                if (req.getHoraFim() != null && !req.getHoraFim().isBlank()) {
                    throw new NegocioException(
                            "Modalidade MES não permite informar horário de fim.");
                }
            }
            case DIA -> {
                if (req.getDiasSemana() == null || req.getDiasSemana() <= 0) {
                    throw new NegocioException(
                            "Modalidade DIA exige que os dias da semana sejam informados.");
                }
                if (req.getHoraInicio() != null && !req.getHoraInicio().isBlank()) {
                    throw new NegocioException(
                            "Modalidade DIA não permite informar horário de início.");
                }
                if (req.getHoraFim() != null && !req.getHoraFim().isBlank()) {
                    throw new NegocioException(
                            "Modalidade DIA não permite informar horário de fim.");
                }
            }
            case HORA -> {
                if (req.getDiasSemana() == null || req.getDiasSemana() <= 0) {
                    throw new NegocioException(
                            "Modalidade HORA exige que os dias da semana sejam informados.");
                }
                if (req.getHoraInicio() == null || req.getHoraInicio().isBlank()) {
                    throw new NegocioException(
                            "Modalidade HORA exige que o horário de início seja informado.");
                }
                if (req.getHoraFim() == null || req.getHoraFim().isBlank()) {
                    throw new NegocioException(
                            "Modalidade HORA exige que o horário de fim seja informado.");
                }
            }
        }
    }

    private LocalTime parseHora(String hora) {
        if (hora == null || hora.isBlank()) {
            return null;
        }
        return LocalTime.parse(hora);
    }

    private EspacoTipoLocacaoResponse toResponse(EspacoTipoLocacao entity) {
        ModalidadeLocacaoEnum modalidade = ModalidadeLocacaoEnum.fromValor(entity.getModalidadeLocacao());

        List<String> diasDescricao = entity.getDiasSemana() != null
                ? BitmaskUtils.fromMask(entity.getDiasSemana())
                        .stream()
                        .sorted(java.util.Comparator.comparingInt(DiaSemanaEnum::getBit))
                        .map(DiaSemanaEnum::getLabel)
                        .toList()
                : null;

        return EspacoTipoLocacaoResponse.builder()
                .id(entity.getId())
                .descricao(entity.getDescricao())
                .modalidadeLocacao(entity.getModalidadeLocacao())
                .modalidadeDescricao(modalidade.name())
                .diasSemana(entity.getDiasSemana())
                .diasSemanaDescricao(diasDescricao)
                .horaInicio(entity.getHoraInicio() != null ? entity.getHoraInicio().toString() : null)
                .horaFim(entity.getHoraFim() != null ? entity.getHoraFim().toString() : null)
                .status(entity.getStatus())
                .statusDescricao(entity.getStatus() == 1 ? "ATIVO" : "INATIVO")
                .atualizadoEm(entity.getAtualizadoEm().toString())
                .build();
    }
}
