# Afiliado em Foco

# DESENVOLVIMENTO DE UMA PLATAFORMA SaaS DE AUTOMAÇÃO DE MARKETING DE AFILIADOS PARA WHATSAPP

## 1. Visão geral do projeto

Quero desenvolver uma plataforma SaaS (Software as a Service) para automação de marketing de afiliados, inicialmente focada em WhatsApp.

A plataforma será acessada diretamente pelo navegador, por meio de uma aplicação web responsiva, e permitirá que usuários organizem, gerenciem e automatizem a divulgação de produtos, promoções, cupons, códigos de desconto e links de afiliados em diversos grupos de WhatsApp.

A principal referência funcional e comercial é:

https://www.afiliadointeligente.com.br/

Não quero copiar a identidade visual ou a marca da referência. Quero desenvolver um produto próprio, utilizando como inspiração os recursos, fluxos e funcionalidades que foram identificados na plataforma de referência.

O objetivo é construir uma solução profissional, simples de utilizar, escalável e preparada para atender desde pessoas que administram poucos grupos até operações que trabalham com centenas ou milhares de grupos.

## 2. Objetivo principal

Desenvolver uma plataforma que permita ao usuário centralizar sua operação de divulgação de ofertas em um único painel.

O usuário deverá conseguir:

- Conectar e administrar seus canais de comunicação, começando pelo WhatsApp.
- Cadastrar e organizar vários grupos.
- Cadastrar produtos, promoções e cupons.
- Gerar e administrar links de afiliados.
- Criar mensagens promocionais automaticamente.
- Programar mensagens para datas e horários específicos.
- Criar filas de envio com intervalos configuráveis.
- Enviar ofertas manualmente ou automaticamente.
- Distribuir uma mesma oferta para vários grupos selecionados.
- Criar regras de automação.
- Utilizar recursos básicos de inteligência artificial para auxiliar na criação de mensagens e respostas.
- Acompanhar o histórico e o status dos envios.

A plataforma deverá ter uma arquitetura preparada para crescer sem precisar ser reconstruída quando o número de grupos e usuários aumentar.

## 3. Público-alvo

A plataforma será destinada a:

- Afiliados da Shopee.
- Afiliados do Mercado Livre.
- Afiliados da Amazon.
- Afiliados do Magazine Luiza.
- Afiliados de outras lojas e marketplaces.
- Administradores de grupos de ofertas.
- Criadores de conteúdo que trabalham com cupons e promoções.
- Pessoas e empresas que administram comunidades de compras e descontos.
- Profissionais que trabalham com marketing de afiliados.

O sistema deverá ser fácil de utilizar mesmo por pessoas sem conhecimento técnico.

## 4. Escalabilidade e capacidade

A plataforma deverá ser projetada para suportar diferentes volumes de operação.

Considerar como referências de capacidade:

- 10 grupos.
- 50 grupos.
- 100 grupos.
- 500 grupos.
- 1.000 grupos ou mais.

Esses números representam objetivos de capacidade e possibilidades de planos comerciais, não uma garantia de que a integração com WhatsApp permitirá todos esses grupos desde o primeiro lançamento.

A arquitetura deverá permitir que os limites sejam configurados por plano e que a capacidade seja ampliada conforme a infraestrutura e as integrações forem validadas.

## 5. Estrutura geral da aplicação

A aplicação deverá possuir duas áreas principais:

### 5.1. Área pública

Criar páginas públicas para apresentação e comercialização do SaaS:

- Página inicial.
- Página de funcionalidades.
- Página de planos e preços.
- Página de perguntas frequentes.
- Página de contato e suporte.
- Página de login.
- Página de cadastro.
- Termos de uso.
- Política de privacidade.

A página inicial deverá apresentar claramente a proposta de valor: automatizar a divulgação de ofertas e links de afiliados em grupos de WhatsApp.

### 5.2. Painel do usuário

Após realizar login, o usuário deverá acessar um painel administrativo com menu lateral, dashboard e módulos independentes.

O painel deverá ter aparência profissional, moderna e intuitiva, com navegação simples.

Sugestão de menu:

1. Dashboard.
2. Conexões.
3. Meus grupos.
4. Produtos e ofertas.
5. Gerador de links.
6. Criador de mensagens.
7. Disparo manual.
8. Filas e agendamentos.
9. Automações.
10. Inteligência artificial.
11. Histórico de envios.
12. Relatórios.
13. Configurações.
14. Meu plano.
15. Suporte e tutoriais.

## 6. Funcionalidades detalhadas

### 6.1. Dashboard

Criar uma tela inicial com visão geral da operação do usuário.

Apresentar indicadores como:

- Total de grupos cadastrados.
- Total de grupos conectados.
- Total de campanhas criadas.
- Mensagens enviadas.
- Mensagens agendadas.
- Mensagens pendentes.
- Mensagens com falha.
- Automações ativas.
- Próximos envios programados.

Adicionar uma área de atividade recente, mostrando as últimas ações realizadas.

Criar também uma visão dos próximos envios e do status das conexões.

Os indicadores deverão utilizar dados reais quando houver integração com o backend. Enquanto as integrações não estiverem implementadas, utilizar dados demonstrativos claramente identificados como demonstração.

### 6.2. Conexões com WhatsApp

Criar um módulo para gerenciar as conexões do usuário.

O sistema deverá permitir:

- Adicionar uma conexão.
- Visualizar conexões cadastradas.
- Identificar o status de cada conexão.
- Visualizar se está conectada, desconectada ou com erro.
- Consultar informações da conexão.
- Remover uma conexão.
- Reconectar quando necessário.

A interface deverá apresentar o status de maneira visual e clara.

IMPORTANTE: não simular uma conexão real com WhatsApp. A integração deverá ser desenvolvida por meio de uma solução tecnicamente validada, respeitando as possibilidades e políticas aplicáveis da plataforma.

Antes de implementar o envio real para grupos, realizar uma prova de conceito para validar a tecnologia, a disponibilidade de APIs e os limites operacionais.

### 6.3. Gerenciamento de grupos

Criar uma área para cadastrar, visualizar e organizar os grupos do usuário.

Cada grupo deverá possuir, quando essas informações estiverem disponíveis:

- Nome do grupo.
- Identificador do grupo.
- Conexão associada.
- Categoria.
- Descrição.
- Status.
- Data de cadastro.
- Informações de disponibilidade para envio.

Permitir:

- Cadastrar grupos.
- Editar informações.
- Excluir grupos.
- Ativar ou desativar grupos.
- Criar categorias.
- Filtrar grupos por categoria.
- Pesquisar grupos pelo nome.
- Selecionar vários grupos simultaneamente.
- Selecionar todos os grupos de uma categoria.
- Visualizar o total de grupos cadastrados.

Criar uma tabela com seleção múltipla e ações em lote.

O sistema deverá permitir organizar grupos por interesses, por exemplo:

- Eletrônicos.
- Casa e decoração.
- Moda.
- Beleza.
- Ofertas gerais.
- Promoções Shopee.
- Promoções Mercado Livre.

### 6.4. Cadastro de produtos e ofertas

Criar um módulo para cadastrar e gerenciar produtos que serão divulgados.

Cada produto deverá possuir:

- Nome do produto.
- Descrição.
- Imagem.
- Loja ou marketplace.
- Preço original.
- Preço promocional.
- Cupom de desconto.
- Código promocional.
- Link original.
- Link de afiliado.
- Categoria.
- Data de cadastro.
- Status.

Permitir cadastrar, editar, excluir e pesquisar produtos.

O usuário deverá conseguir reutilizar produtos cadastrados em diferentes campanhas.

O cadastro manual deverá funcionar mesmo antes de existirem integrações automáticas com marketplaces.

### 6.5. Gerador de links de afiliados

Criar uma ferramenta para transformar links de produtos em links de afiliados.

Fluxo esperado:

1. O usuário informa o link do produto.
2. O sistema identifica a loja, quando possível.
3. O usuário seleciona ou informa sua identificação de afiliado.
4. O sistema processa o link utilizando uma integração compatível.
5. O sistema apresenta o link gerado.
6. O usuário pode copiar e salvar o resultado.

Priorizar inicialmente as seguintes lojas:

- Shopee.
- Mercado Livre.
- Amazon.
- Magazine Luiza.

Preparar a arquitetura para futuras integrações com outras lojas.

IMPORTANTE: não inventar links de afiliados nem apenas modificar URLs de forma superficial. A geração precisa respeitar as regras e os mecanismos oficiais de cada programa de afiliados.

Quando não houver integração disponível, permitir que o usuário informe manualmente o próprio link de afiliado.

### 6.6. Criador de mensagens promocionais

Criar uma ferramenta para gerar mensagens de divulgação de produtos.

O usuário deverá conseguir preencher ou selecionar:

- Nome do produto.
- Preço original.
- Preço promocional.
- Cupom.
- Link de afiliado.
- Loja.
- Informações adicionais.

O sistema deverá montar uma mensagem pronta para divulgação.

Exemplo:

🔥 OFERTA IMPERDÍVEL!

Fone Bluetooth com cancelamento de ruído

De R$ 199,90 por apenas R$ 129,90!

🎟️ Cupom: DESCONTO10

🛒 Aproveite aqui:
[LINK DO PRODUTO]

Permitir:

- Editar o texto gerado.
- Criar diferentes versões da mensagem.
- Utilizar emojis.
- Adicionar chamadas para ação.
- Copiar a mensagem.
- Salvar modelos de mensagens.

### 6.7. Disparo manual

Criar um módulo para enviar ofertas manualmente.

Fluxo esperado:

1. O usuário seleciona um produto cadastrado ou cria uma nova oferta.
2. Escolhe a mensagem que deseja enviar.
3. Seleciona um ou vários grupos.
4. Visualiza uma prévia da mensagem.
5. Confirma a operação.
6. O sistema registra a solicitação e acompanha o resultado do envio.

A interface deverá permitir selecionar grupos individualmente ou por categoria.

O usuário deverá conseguir visualizar o resultado de cada envio.

### 6.8. Filas e agendamentos

Criar um sistema de filas para organizar mensagens que serão enviadas posteriormente.

O usuário deverá conseguir:

- Criar uma fila.
- Adicionar produtos à fila.
- Selecionar os grupos de destino.
- Definir data de início.
- Definir horário de envio.
- Configurar intervalos entre mensagens.
- Programar vários envios.
- Pausar uma fila.
- Retomar uma fila.
- Cancelar uma fila.
- Editar mensagens ainda não enviadas.

Exemplo de configuração:

- Produto A: 09h00.
- Produto B: 09h15.
- Produto C: 09h30.
- Produto D: 09h45.

Criar uma visualização dos próximos envios, com status:

- Aguardando.
- Agendado.
- Em processamento.
- Enviado.
- Falhou.
- Cancelado.

Permitir configurar intervalos personalizados e horários de funcionamento.

A aplicação deverá utilizar um mecanismo de processamento em segundo plano para executar os agendamentos, sem depender de o usuário manter o navegador aberto.

### 6.9. Divulgador automático

Criar um módulo de divulgação automática de ofertas.

A proposta é permitir que o usuário configure uma rotina de divulgação contínua.

Configurações desejadas:

- Ativar ou desativar o divulgador.
- Selecionar produtos.
- Selecionar grupos.
- Definir horário inicial.
- Definir horário final.
- Definir intervalo entre ofertas.
- Definir dias da semana.
- Configurar quantidade de ofertas por período.
- Pausar a operação.
- Retomar a operação.

A referência comercial apresenta uma vitrine de ofertas com funcionamento 24 horas e intervalos configuráveis de 1 a 30 minutos. Esses valores são uma referência de interface, não limites obrigatórios para o nosso produto.

O sistema deverá respeitar os limites técnicos, as políticas da integração e as configurações de cada usuário.

### 6.10. Regras de automação

Criar um módulo para o usuário montar automações personalizadas.

A estrutura deverá seguir o conceito:

GATILHO → CONDIÇÃO → AÇÃO.

Exemplos:

- Quando uma nova oferta for cadastrada, adicionar à fila.
- Quando chegar o horário programado, processar o envio.
- Quando uma oferta for marcada como inativa, impedir novos envios.
- Quando uma mensagem apresentar falha, registrar o erro.
- Quando uma campanha for pausada, interromper os próximos envios.
- Quando uma oferta pertencer a determinada categoria, direcionar para os grupos correspondentes.

Permitir ativar, desativar, editar e excluir regras.

Criar uma interface visual simples para configuração das regras, sem exigir conhecimento de programação.

### 6.11. Inteligência artificial

Implementar inicialmente recursos básicos de IA.

A inteligência artificial deverá auxiliar o usuário na criação de textos promocionais e na organização das mensagens.

Funcionalidades desejadas:

- Criar mensagens de ofertas.
- Reescrever textos promocionais.
- Gerar chamadas para ação.
- Criar diferentes versões de uma mesma mensagem.
- Ajustar o tom da comunicação.
- Resumir informações de produtos.
- Sugerir títulos mais chamativos.

Também preparar a estrutura para respostas automáticas inteligentes, respeitando os canais e os eventos que a integração realmente disponibilizar.

A IA deverá ser um recurso auxiliar, e não uma dependência para o funcionamento básico da plataforma.

Não enviar mensagens automaticamente geradas por IA sem que as regras e permissões configuradas pelo usuário permitam essa ação.

### 6.12. Monitoramento de ofertas

Preparar a estrutura para uma funcionalidade futura inspirada no monitoramento da referência.

A ideia é permitir que o usuário acompanhe fontes de ofertas autorizadas e utilize essas informações para criar suas próprias divulgações.

Fluxo desejado:

1. Identificar uma nova oferta em uma fonte conectada.
2. Extrair os dados disponíveis.
3. Identificar o produto e o link.
4. Substituir pelo link de afiliado do usuário, quando houver integração válida.
5. Permitir revisar a mensagem.
6. Encaminhar para os destinos selecionados.

Essa funcionalidade deverá ser desenvolvida somente após validar a viabilidade técnica das fontes e integrações utilizadas.

### 6.13. Histórico de envios

Criar um módulo com o histórico completo das operações.

Cada registro deverá apresentar:

- Data e horário.
- Produto divulgado.
- Mensagem utilizada.
- Grupo de destino.
- Campanha ou fila de origem.
- Status.
- Identificador da operação, quando disponível.
- Detalhes de erro, quando houver.

Adicionar filtros por período, grupo, produto, campanha e status.

### 6.14. Relatórios

Criar uma área de relatórios com indicadores da operação.

Indicadores desejados:

- Total de mensagens solicitadas.
- Total de mensagens enviadas com sucesso.
- Total de mensagens com falha.
- Quantidade de campanhas.
- Produtos mais divulgados.
- Grupos mais utilizados.
- Evolução dos envios por período.

Não apresentar cliques, vendas ou comissões como dados reais sem integração e fonte de dados que comprovem esses resultados.

### 6.15. Configurações do usuário

Criar uma área de configurações com:

- Nome.
- E-mail.
- Senha.
- Dados da conta.
- Preferências de notificação.
- Fuso horário.
- Configurações de automação.
- Conexões.
- Plano contratado.

## 7. Planos e limites comerciais

A plataforma deverá ser preparada para trabalhar com planos de assinatura.

Os planos deverão permitir controlar:

- Quantidade máxima de grupos.
- Quantidade de conexões.
- Quantidade de automações.
- Quantidade de agendamentos.
- Recursos disponíveis.
- Limites de uso.

Os limites deverão ser configuráveis pelo administrador da plataforma.

Sugestão de faixas comerciais para estudar:

- Básico: até 10 grupos.
- Intermediário: até 50 grupos.
- Profissional: até 100 grupos.
- Avançado: até 500 grupos.
- Enterprise: 1.000 grupos ou mais, mediante validação técnica.

Essas faixas são propostas iniciais e não representam preços definidos.

Não copiar automaticamente os preços da plataforma de referência.

Preparar a estrutura para integração futura com um gateway de pagamento, permitindo assinatura mensal e anual, controle de vencimentos, cancelamentos e alterações de plano.

## 8. Painel administrativo do proprietário do SaaS

Além do painel dos clientes, criar uma área administrativa exclusiva para o proprietário da plataforma.

O administrador deverá conseguir:

- Visualizar todos os usuários cadastrados.
- Consultar dados de cada usuário.
- Ativar ou suspender contas.
- Consultar planos contratados.
- Alterar limites de uso.
- Criar e editar planos.
- Visualizar volume de utilização.
- Consultar conexões.
- Consultar erros de processamento.
- Acompanhar filas.
- Visualizar campanhas.
- Gerenciar funcionalidades liberadas.
- Consultar indicadores gerais da plataforma.

O painel administrativo deverá ser protegido por permissões específicas.

Um usuário comum nunca poderá acessar dados de outros clientes.

## 9. Arquitetura e estrutura técnica

Quero uma aplicação preparada para evoluir de um MVP para uma plataforma SaaS comercial.

Sugestão inicial de tecnologias:

- Frontend: React com TypeScript.
- Interface: Tailwind CSS e componentes reutilizáveis.
- Backend e banco: Supabase com PostgreSQL, autenticação e políticas de segurança.
- Processamento assíncrono: serviço de filas e tarefas em segundo plano.
- Integrações: APIs e serviços externos, conforme viabilidade técnica.
- Pagamentos: integração futura com Mercado Pago ou outro gateway adequado.

O Lovable deverá priorizar uma arquitetura organizada, modular e segura.

Requisitos técnicos:

- Separação entre frontend e lógica de negócio.
- Banco de dados relacional.
- Autenticação segura.
- Controle de acesso por usuário.
- Isolamento dos dados de cada cliente.
- Validação de formulários.
- Tratamento de erros.
- Registro de operações.
- Proteção de credenciais e tokens.
- Estrutura preparada para processamento em segundo plano.
- Capacidade de ampliar a infraestrutura conforme o crescimento.

Não armazenar tokens ou credenciais sensíveis diretamente no frontend.

## 10. Estrutura inicial do banco de dados

Preparar uma modelagem que contemple, pelo menos, as seguintes entidades:

- users: usuários.
- profiles: informações dos usuários.
- plans: planos comerciais.
- subscriptions: assinaturas.
- connections: conexões externas.
- groups: grupos cadastrados.
- group_categories: categorias de grupos.
- products: produtos.
- affiliate_links: links de afiliados.
- campaigns: campanhas.
- messages: mensagens.
- message_templates: modelos de mensagens.
- schedules: agendamentos.
- queues: filas de envio.
- queue_items: itens das filas.
- automation_rules: regras de automação.
- automation_executions: execuções das automações.
- send_logs: histórico de envios.
- usage_records: utilização e limites.
- notifications: notificações.
- admin_logs: registros administrativos.

As tabelas deverão possuir identificadores, datas de criação e atualização e relacionamentos adequados.

Toda informação pertencente a um cliente deverá estar vinculada ao seu usuário ou à sua organização.

Implementar políticas de segurança no banco para impedir que um cliente consulte ou altere dados de outro.

## 11. Design e experiência do usuário

Quero um design SaaS moderno, profissional e com aparência de produto comercial pronto para ser vendido.

Referências de experiência:

- Painéis administrativos modernos.
- Navegação intuitiva.
- Menu lateral organizado.
- Cards com indicadores.
- Tabelas com filtros e busca.
- Gráficos objetivos.
- Formulários simples.
- Modais de confirmação.
- Notificações de sucesso e erro.
- Estados vazios com instruções.
- Indicadores de carregamento.

A interface deverá ser responsiva, funcionando bem em computadores, tablets e celulares.

A prioridade de experiência deverá ser desktop, sem deixar a versão mobile de lado.

Não quero uma página genérica de dashboard. Quero uma aplicação com identidade visual própria, consistente e bem organizada.

## 12. Segurança, privacidade e conformidade

Implementar:

- Autenticação.
- Autorização por perfil.
- Isolamento dos dados dos clientes.
- Proteção de informações sensíveis.
- Validação de entradas.
- Registro de operações importantes.
- Política de privacidade.
- Termos de uso.
- Cuidados com a LGPD.

As integrações de comunicação deverão respeitar as regras e limitações dos respectivos provedores.

Não desenvolver mecanismos que dependam de práticas não autorizadas sem antes avaliar seus riscos técnicos, operacionais e contratuais.

## 13. Estratégia de desenvolvimento por etapas

Quero desenvolver o projeto em etapas, evitando tentar construir tudo de uma vez.

### ETAPA 1 — Estrutura inicial e MVP visual

Construir:

- Identidade visual.
- Site público.
- Cadastro e login.
- Dashboard.
- Menu lateral.
- Gerenciamento de grupos.
- Cadastro de produtos.
- Gerador de mensagens.
- Gerenciamento de campanhas.
- Disparo manual em modo de demonstração.
- Filas e agendamentos em modo de demonstração.
- Configurações do usuário.
- Painel administrativo inicial.

Nesta etapa, todas as telas deverão possuir navegação funcional e formulários operacionais, mesmo que algumas ações ainda utilizem dados demonstrativos.

### ETAPA 2 — Backend e banco de dados

Implementar:

- Banco de dados.
- Autenticação real.
- Persistência das informações.
- Relacionamentos.
- Controle de acesso.
- Segurança.
- Histórico.
- Limites por plano.

### ETAPA 3 — Integrações e prova de conceito

Antes de liberar o envio real para grupos, validar tecnicamente:

- Qual tecnologia permitirá conectar contas.
- Quais tipos de grupos poderão ser acessados.
- Se será possível enviar mensagens para os grupos desejados.
- Quais limites existem.
- Quais são os riscos de bloqueio e restrições.
- Como funcionará a operação com muitos grupos.

Não considerar a integração concluída até que o teste real seja bem-sucedido.

### ETAPA 4 — Automação real

Implementar:

- Processamento de filas.
- Agendamentos.
- Disparos reais, quando tecnicamente suportados.
- Monitoramento de execução.
- Tratamento de falhas.
- Retentativas controladas.
- Regras de automação.

### ETAPA 5 — IA, planos e expansão

Implementar:

- Recursos de IA.
- Planos e assinaturas.
- Gateway de pagamento.
- Controle automático de limites.
- Relatórios avançados.
- Monitoramento de ofertas.
- Preparação para novos canais, como Telegram e Instagram.

## 14. Orientações importantes para o Lovable

Não quero apenas imagens de telas ou uma demonstração estática.

Quero que a aplicação seja construída com componentes reutilizáveis, navegação funcional e estrutura preparada para receber o backend.

Não criar botões sem ação. Quando uma integração ainda não estiver disponível, mostrar claramente que a funcionalidade está em desenvolvimento ou em modo de demonstração.

Não inventar dados reais de envios, vendas, comissões ou conexões.

Não implementar todas as funcionalidades em uma única etapa sem validar a estrutura.

Priorizar uma experiência visual consistente e uma arquitetura que permita evoluir o sistema sem retrabalho.

Começar pela estrutura geral da aplicação, layout, autenticação, dashboard e módulos principais. Depois evoluir para banco de dados, processamento e integrações.

## 15. Resultado esperado

Quero obter uma plataforma SaaS própria de automação de marketing de afiliados, inicialmente focada em WhatsApp, que permita aos clientes administrar suas ofertas, produtos, links de afiliados, grupos, mensagens, campanhas, filas e automações em um único lugar.

O produto deverá nascer com estrutura profissional, capacidade de expansão e possibilidade de comercialização por assinatura.

A prioridade é entregar primeiro um MVP funcional, com boa experiência de uso, arquitetura organizada e base técnica preparada para integrações reais.

O projeto deverá ser desenvolvido com foco em escalabilidade, segurança, facilidade de manutenção e experiência do usuário.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/de7af5d5-d18c-49d5-89db-f80e745c00e3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
