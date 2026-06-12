CREATE TABLE empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao VARCHAR(200) NOT NULL,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
