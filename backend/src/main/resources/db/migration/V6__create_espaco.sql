CREATE TABLE espaco (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_empresa_sistema UUID NOT NULL REFERENCES empresa_sistema(id),
    id_grupo UUID NOT NULL REFERENCES grupo(id),
    id_espaco_tipo_locacao UUID NOT NULL REFERENCES espaco_tipo_locacao(id),
    descricao VARCHAR(200) NOT NULL,
    status INTEGER NOT NULL DEFAULT 1,
    valor NUMERIC(10, 2) NOT NULL,
    endereco TEXT,
    observacoes TEXT,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_espaco_empresa_sistema ON espaco(id_empresa_sistema);
CREATE INDEX idx_espaco_grupo ON espaco(id_grupo);
CREATE INDEX idx_espaco_tipo_locacao ON espaco(id_espaco_tipo_locacao);
CREATE INDEX idx_espaco_status ON espaco(status);
