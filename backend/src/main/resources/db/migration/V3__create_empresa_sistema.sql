CREATE TABLE empresa_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sistema UUID NOT NULL REFERENCES sistema(id),
    id_empresa UUID NOT NULL REFERENCES empresa(id),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_empresa_sistema UNIQUE (id_sistema, id_empresa)
);

CREATE INDEX idx_empresa_sistema_sistema ON empresa_sistema(id_sistema);
CREATE INDEX idx_empresa_sistema_empresa ON empresa_sistema(id_empresa);
