# Configurar Lojas — relatório de entrega

## Implementado
- Página Lojas no menu do painel, com nove parceiros, busca por nome, filtros de categoria/status e contadores.
- Formulários específicos, carregamento dos identificadores salvos, edição, ativação/desativação e exclusão com confirmação.
- Configurações persistidas por proprietário. Limpar uma loja não exclui produtos, campanhas ou outras configurações.
- Campo Token do Mercado Livre opcional, criptografado no servidor e nunca preenchido novamente no navegador.
- Tutoriais escritos, links oficiais, estrutura para vídeos reais do YouTube e mensagem de indisponibilidade quando não cadastrados.
- Administração de catálogo, campos, categorias, disponibilidade, ordem, logotipos e tutoriais. Indicadores agregados não incluem identificadores ou credenciais.
- Gerador de links reconhece domínios do catálogo, recupera identificadores e oferece acesso direto à configuração. Continua registrando links fornecidos manualmente: não apresenta conversão fictícia.
- Produtos podem usar o catálogo extensível. Campanhas armazenam lojas participantes; disparos demonstrativos e filas verificam essa seleção.

## Banco de dados
- `marketplaces`: catálogo administrável e definições dos formulários e tutoriais.
- `marketplace_configs`: identificadores públicos da configuração, proprietário, ativação e estado de validação.
- `marketplace_credentials`: conteúdo criptografado, sem política de leitura para usuários.
- `campaigns.marketplace_ids`: lojas participantes da campanha; lista vazia mantém a compatibilidade com todas as lojas.
- RPC `save_marketplace_configuration`: gravação atômica, executável somente pelo serviço privilegiado. Os chamadores são autenticados e verificados antes da gravação.

## Segurança
- Leitura das configurações limitada ao proprietário com conta ativa, inclusive para administradores.
- Administração do catálogo protegida por função de papel no banco.
- Credenciais protegidas por AES-GCM, chave gerenciada e associação ao proprietário e à loja.
- Não há retorno de tokens, criptogramas ou valores secretos nos indicadores.
- Ativação significa autorização de uso dos dados salvos, não conexão externa validada. O estado de validação permanece pendente.

## Verificações realizadas
- 19 testes passaram: 12 regras de marketplaces, 6 regras existentes e 1 teste de roteamento.
- Navegador autenticado: busca, cadastro Amazon sem Prime, ativação, recarregamento, edição, desativação, acesso a partir do gerador, cancelamento da exclusão e exclusão confirmada.
- Administração: edição de tutorial, persistência após recarregar e restauração do texto original.
- Computador e celular: página renderizada, grade e formulários funcionais; imagem Amazon carregada.
- Consulta pelo navegador com filtro de outro proprietário não retornou a configuração temporária criada para o teste. A consulta de credenciais não retornou dados. A tentativa de escrita direta foi rejeitada, mas o motivo exato dessa rejeição não foi estabelecido nesse teste.
- Registros temporários foram removidos. Última verificação automática: build OK.

## Dependências e limites desta entrega
- Nenhuma conversão automática, autenticação de marketplace, validação externa ou envio real foi implementado. Esses recursos exigem documentação oficial atual, aprovação dos programas, credenciais de aplicativos quando aplicáveis e prova de conceito real.
- Campos avançados de Magalu e Terabyte foram deliberadamente limitados a links oficiais existentes; nenhum identificador técnico foi inventado. AliExpress e Samsung precisam de confirmação adicional dos requisitos da conta/programa.
- Nenhum vídeo fictício foi cadastrado. A administração pode fornecer vídeos e tutoriais próprios.
- Logotipos iniciais utilizam ícones obtidos das páginas oficiais. Magalu e Terabyte aguardam imagens oficiais; os demais podem ser substituídos por arquivos de marca de maior resolução pela administração.
- Rotinas automáticas continuam em demonstração; a execução futura deverá revalidar configuração ativa e disponibilidade do adaptador no momento de processar cada item.
- Testes completos com duas contas reais, escrita direta corretamente formatada e credenciais existentes continuam necessários antes de liberar integrações externas em produção.