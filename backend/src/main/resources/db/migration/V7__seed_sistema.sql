-- Inserção do registro base do sistema (código será substituído pela variável de ambiente)
-- O código 1 é o valor padrão; ajuste conforme o SISTEMA_CODIGO configurado
INSERT INTO sistema (codigo, descricao) 
VALUES (1, 'Administração de Locações de Espaço')
ON CONFLICT (codigo) DO NOTHING;
