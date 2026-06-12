CREATE TABLE grupo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_empresa_sistema UUID NOT NULL REFERENCES empresa_sistema(id),
    descricao VARCHAR(200) NOT NULL,
    status INTEGER NOT NULL DEFAULT 1,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grupo_empresa_sistema ON grupo(id_empresa_sistema);
CREATE INDEX idx_grupo_status ON grupo(status);
