CREATE TABLE sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo INTEGER NOT NULL UNIQUE,
    descricao VARCHAR(100) NOT NULL,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
