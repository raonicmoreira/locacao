CREATE TABLE espaco_tipo_locacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_empresa_sistema UUID NOT NULL REFERENCES empresa_sistema(id),
    descricao VARCHAR(100) NOT NULL,
    modalidade_locacao INTEGER NOT NULL,
    dias_semana INTEGER,
    hora_inicio TIME,
    hora_fim TIME,
    status INTEGER NOT NULL DEFAULT 1,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_espaco_tipo_locacao_empresa_sistema ON espaco_tipo_locacao(id_empresa_sistema);
CREATE INDEX idx_espaco_tipo_locacao_status ON espaco_tipo_locacao(status);
