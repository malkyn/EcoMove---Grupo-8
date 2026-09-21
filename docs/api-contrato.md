# Contrato da API EcoMove

Este documento define as rotas que o frontend (`EcoMove-Front`) consome. O backend (`upx_backend`) deve implementá-las exatamente com estes caminhos, campos e códigos de resposta. Enquanto o backend não estiver pronto, o frontend roda com `VITE_USE_MOCK=true`, que simula todas estas rotas no navegador.

Qualquer mudança aqui precisa ser combinada entre front e back antes de ser feita.

## 1. Convenções

- **Base URL:** definida pelo front em `VITE_API_URL` (desenvolvimento: `http://127.0.0.1:5000`).
- **Formato:** requisições e respostas em JSON (`Content-Type: application/json`).
- **Erros:** sempre `{ "erro": "mensagem para o usuário" }` com o código HTTP adequado.
- **Sucesso com criação:** `201` e o objeto criado dentro da resposta.
- **Códigos usados:** `200` ok · `201` criado · `400` dados inválidos ou faltando · `401` não autenticado · `403` sem permissão · `404` não encontrado · `409` conflito (duplicidade, sem vagas) · `500` erro interno.
- **Ids:** inteiros. Chaves em `snake_case`, como já está nos modelos.
- **Datas e horários:** ISO 8601 sem fuso, no horário local: `"2026-10-20T07:30"`.
- **CORS:** liberar apenas as origens do front (`http://localhost:5173`, `http://127.0.0.1:5173` e a URL de produção no Render).
- **Autenticação hoje:** nenhuma. O front envia `id_usuario` no corpo das requisições. Isso é aceitável só para desenvolvimento.
- **Autenticação alvo (antes da entrega):** cookie de sessão `httpOnly` emitido no login (Flask `session` com `SECRET_KEY` vindo de variável de ambiente). Com isso o backend passa a ignorar `id_usuario` do corpo e usa o usuário da sessão. Ver seção 9.

## 2. Perfis

| id_perfil | nome |
|---|---|
| 1 | Motorista |
| 2 | Passageiro |

A tabela `perfil_usuario` deve ser populada com estes dois registros na criação do banco.

## 3. Usuários

### POST `/usuarios/` — cadastro

Requisição:
```json
{
  "nome": "Camila Ferreira",
  "email": "camila@exemplo.com",
  "senha": "senhaForte123",
  "id_perfil": 1,
  "telefone": "(15) 99999-0001",
  "cpf": "12345678900",
  "rg": "",
  "cnh": "12345678900",
  "genero": "feminino",
  "data_nascimento": "1994-03-10"
}
```
Obrigatórios: `nome`, `email`, `senha`, `id_perfil`. Os demais são opcionais.

Regras: e-mail normalizado (`trim` + minúsculas) e único; senha com no mínimo 6 caracteres, armazenada com hash (`werkzeug.security.generate_password_hash`); `id_perfil` deve ser 1 ou 2.

Resposta `201`:
```json
{ "mensagem": "Usuário criado com sucesso!", "usuario": { "id_usuario": 1, "nome": "Camila Ferreira", "email": "camila@exemplo.com", "id_perfil": 1, "perfil": "Motorista", "telefone": "(15) 99999-0001" } }
```
Erros: `400` campo faltando ou inválido · `409` e-mail já cadastrado.

**O campo `senha` nunca aparece em nenhuma resposta, nem com hash.**

### POST `/usuarios/login`

Requisição: `{ "email": "camila@exemplo.com", "senha": "senhaForte123" }`

Resposta `200`:
```json
{ "mensagem": "Login realizado com sucesso!", "usuario": { "id_usuario": 1, "nome": "Camila Ferreira", "email": "camila@exemplo.com", "id_perfil": 1, "perfil": "Motorista", "telefone": "(15) 99999-0001" } }
```
Erros: `400` e-mail ou senha não informados · `401` `"E-mail ou senha inválidos"`.

Regra de segurança: a mensagem do `401` é **a mesma** para e-mail inexistente e para senha errada. Mensagens diferentes permitem descobrir quais e-mails estão cadastrados. Comparar com `check_password_hash`, nunca com `==`.

### GET `/usuarios/` — lista (uso administrativo)
Resposta `200`: lista de usuários no formato público acima.

### GET `/usuarios/{id}`
Resposta `200`: usuário no formato público. `404` se não existir.

### GET `/usuarios/{id}/reservas`
Caronas em que o usuário reservou vaga. Resposta `200`: lista de caronas no formato completo (seção 5).

### GET `/usuarios/{id}/avaliacoes`
Resposta `200`:
```json
{ "media": 4.7, "total": 3, "avaliacoes": [ { "id_avaliacao": 1, "id_carona": 2, "id_avaliador": 2, "avaliador": "Lucas Almeida", "id_avaliado": 1, "nota": 5, "comentario": "Pontual e educada.", "criada_em": "2026-10-21T08:10" } ] }
```
`media` é `null` quando não há avaliações.

### DELETE `/usuarios/{id}`
Resposta `200`: `{ "mensagem": "Usuário deletado com sucesso!" }`. `404` se não existir. Deve remover em cascata veículos, caronas e reservas do usuário.

## 4. Veículos

Somente motoristas (`id_perfil = 1`) cadastram veículos. Duas modalidades, e **apenas veículos 100% elétricos ou híbridos** (regra do produto: combustão é recusada com `400`):

| Campo | Valores | Observação |
|---|---|---|
| `categoria` | `carro`, `moto` | Moto leva no máximo 1 passageiro por carona |
| `propulsao` | `eletrico`, `hibrido` | Qualquer outro valor é recusado |

### GET `/veiculos/?id_usuario={id}`
`id_usuario` é opcional; sem ele, lista todos. Resposta `200`:
```json
[ { "id_veiculo": 1, "id_usuario": 1, "modelo": "Chevrolet Bolt EV", "placa": "BRA2E19", "categoria": "carro", "propulsao": "eletrico", "cor": "Branco" } ]
```
Observação: a coluna no modelo chama-se `id_placa`, mas o JSON usa `placa`. Os campos `categoria` e `propulsao` são novos e substituem o antigo `tipo` livre.

### POST `/veiculos/`
Requisição: `{ "modelo": "Chevrolet Bolt EV", "placa": "BRA1D23", "categoria": "carro", "propulsao": "eletrico", "cor": "Branco", "id_usuario": 1 }`

Obrigatórios: `modelo`, `placa`, `categoria`, `propulsao`, `id_usuario`. A placa é normalizada (maiúsculas, sem hífen), deve seguir o padrão Mercosul `ABC1D23` ou o antigo `ABC1234`, e é única.

Resposta `201`: `{ "mensagem": "Veículo cadastrado com sucesso!", "veiculo": { ...formato acima } }`
Erros: `400` campo faltando, placa, categoria ou propulsão inválida · `403` usuário não é motorista · `404` usuário inexistente · `409` placa já cadastrada.

### DELETE `/veiculos/{id}`
Resposta `200`: `{ "mensagem": "Veículo deletado com sucesso!" }`. `404` se não existir · `409` se houver caronas vinculadas.

## 5. Caronas

### Formato completo de carona (usado em todas as respostas)
```json
{
  "id_carona": 1,
  "id_usuario": 1,
  "motorista": { "id_usuario": 1, "nome": "Camila Ferreira" },
  "id_veiculo": 1,
  "veiculo": { "id_veiculo": 1, "modelo": "Chevrolet Bolt EV", "placa": "BRA2E19", "categoria": "carro", "propulsao": "eletrico" },
  "origem": "Parque Campolim, Sorocaba",
  "destino": "Centro Universitário FACENS, Sorocaba",
  "origem_lat": -23.5199, "origem_lng": -47.4642,
  "destino_lat": -23.4706, "destino_lng": -47.4295,
  "horario": "2026-10-20T07:30",
  "vagas_disponiveis": 3,
  "vagas_restantes": 2,
  "distancia_km": 10.2,
  "preco_estimado": 6.12,
  "passageiros": [ { "id_usuario": 2, "nome": "Lucas Almeida" } ],
  "compatibilidade": { "distancia_origem_km": 0.8, "distancia_destino_km": 0.3 }
}
```
`vagas_restantes` = `vagas_disponiveis` menos o número de reservas. `preco_estimado` = contribuição sugerida por passageiro, calculada da `distancia_km` (R$ 0,60/km, mínimo R$ 3,00; mesma regra de `utils/estimativas.js` no front). `compatibilidade` só aparece na busca por proximidade (abaixo). Isso exige o relacionamento `Carona.veiculo` e `Carona.usuario` no modelo (hoje ausente, o que faz o `GET /caronas/` atual quebrar).

### GET `/caronas/` — listagem e busca de caronas compatíveis
Todos os filtros são opcionais e combináveis:

| Parâmetro | Efeito |
|---|---|
| `origem`, `destino` | busca parcial no texto, sem diferenciar maiúsculas |
| `data` | `AAAA-MM-DD`, filtra pelo dia |
| `id_usuario` | caronas de um motorista |
| `excluir_usuario` | remove as caronas desse motorista (o passageiro não vê as próprias) |
| `horario_de`, `horario_ate` | janela de horário, formato ISO local |
| `com_vagas=true` | só caronas com `vagas_restantes > 0` |
| `origem_lat`, `origem_lng`, `destino_lat`, `destino_lng`, `raio_km` | **match por proximidade**: só caronas cuja saída está a até `raio_km` (padrão 3) do ponto de origem pedido **e** cuja chegada está a até `raio_km` do destino pedido (distância em linha reta, fórmula de Haversine). Cada item ganha `compatibilidade` e a lista vem ordenada pela soma das duas distâncias |

Sem proximidade, ordenar por `horario` crescente. Resposta `200`: lista no formato completo.

O front, na tela "Caronas compatíveis", chama com: coordenadas de origem e destino, `raio_km=3`, `com_vagas=true`, `excluir_usuario` do passageiro, e janela de horário: "agora" = das próximas 24 h; "agendar" = ±90 min do horário escolhido.

### POST `/caronas/`
Requisição:
```json
{ "origem": "Parque Campolim, Sorocaba", "destino": "Centro Universitário FACENS, Sorocaba",
  "origem_lat": -23.5199, "origem_lng": -47.4642, "destino_lat": -23.4706, "destino_lng": -47.4295,
  "horario": "2026-10-20T07:30", "vagas_disponiveis": 3, "distancia_km": 10.2,
  "id_usuario": 1, "id_veiculo": 1 }
```

Obrigatórios: `origem`, `destino`, `horario`, `vagas_disponiveis`, `id_usuario`, `id_veiculo`. As coordenadas e `distancia_km` são opcionais, mas sem coordenadas a carona não aparece na busca por proximidade. `vagas_disponiveis` inteiro de 1 a 8 (máximo 1 se o veículo for moto). `horario` no formato ISO acima e no futuro.

Resposta `201`: `{ "mensagem": "Carona publicada com sucesso!", "carona": { ...formato completo } }`
Erros: `400` inválido · `403` usuário não é motorista ou veículo não pertence a ele · `404` usuário ou veículo inexistente.

### GET `/caronas/{id}`
Resposta `200`: formato completo. `404` se não existir.

### DELETE `/caronas/{id}`
Resposta `200`: `{ "mensagem": "Carona cancelada com sucesso!" }`. Remove as reservas junto. `404` se não existir.

## 6. Reservas (novo)

Passageiro reserva uma vaga em uma carona. Tabela nova `reserva`: `id_carona`, `id_usuario`, `criada_em`, com chave única em (`id_carona`, `id_usuario`).

### POST `/caronas/{id}/reservas`
Requisição: `{ "id_usuario": 2 }`

Resposta `201`: `{ "mensagem": "Vaga reservada com sucesso!", "carona": { ...formato completo } }`
Erros: `400` sem `id_usuario` · `403` motorista tentando reservar a própria carona · `404` carona ou usuário inexistente · `409` usuário já reservou, ou sem vagas.

### DELETE `/caronas/{id}/reservas/{id_usuario}`
Resposta `200`: `{ "mensagem": "Reserva cancelada com sucesso!" }`. `404` se não existir.

## 7. Avaliações (novo)

Depois de uma viagem (carona que já aconteceu ou corrida concluída), quem participou avalia a outra pessoa com nota de 1 a 5 e comentário opcional.

Tabela nova `avaliacao`: `id_avaliacao`, `id_carona` (nulo se for corrida), `id_corrida` (nulo se for carona), `id_avaliador`, `id_avaliado`, `nota` (1 a 5), `comentario` (até 300 caracteres), `criada_em`. Chave única em (`id_carona`, `id_corrida`, `id_avaliador`, `id_avaliado`).

**Reputação nos resumos de usuário:** onde a API devolve um usuário resumido (`motorista` e `passageiros` da carona, `motorista` e `passageiro` da corrida), incluir `media_avaliacao` (média com 1 casa, ou `null`) e `total_avaliacoes`. O front mostra "★ 4,8 (3)" ao lado do nome.

### POST `/avaliacoes/`
Requisição: `{ "id_carona": 4, "id_avaliador": 2, "id_avaliado": 1, "nota": 5, "comentario": "Pontual e educada." }` ou, para corrida, `{ "id_corrida": 1, ... }`. Exatamente um de `id_carona`/`id_corrida`.

Regras: avaliador e avaliado precisam ter participado da viagem (motorista ou passageiro com reserva; passageiro ou motorista da corrida); carona só depois do `horario`; corrida só com status `concluida`; uma avaliação por par (avaliador, avaliado) por viagem.

Resposta `201`: `{ "mensagem": "Avaliação registrada. Obrigado!", "avaliacao": { ...campos acima } }`
Erros: `400` nota fora de 1 a 5, avaliador igual ao avaliado, campo faltando ou os dois ids informados · `403` não participou da viagem · `404` viagem ou usuário inexistente · `409` viagem ainda não aconteceu, ou já avaliou este usuário nesta viagem.

### GET `/avaliacoes/?id_avaliador=&id_avaliado=&id_carona=&id_corrida=`
Filtros opcionais e combináveis. Resposta `200`: lista de avaliações com `avaliador` e `avaliado` (nomes). O front usa `id_avaliador` = usuário logado para saber o que ele já avaliou.

## 7.1 Corridas sob demanda (novo)

Modo "99/Uber": o passageiro pede uma corrida para agora, motoristas online por perto veem o pedido e um deles aceita. Sem pagamento nesta versão: `preco_estimado` é só referência.

Estados: `pendente` (procurando motorista) → `aceita` (motorista a caminho) → `em_andamento` → `concluida`. O passageiro pode cancelar em `pendente` ou `aceita` (vira `cancelada`). Se o motorista desistir em `aceita`, a corrida volta para `pendente` sem motorista.

Tabela nova `corrida`: `id_corrida`, `id_passageiro`, `id_motorista` (nulo até aceitar), `id_veiculo` (nulo até aceitar), `origem`, `destino`, `origem_lat`, `origem_lng`, `destino_lat`, `destino_lng`, `distancia_km`, `duracao_min`, `preco_estimado`, `status`, `criada_em`, `aceita_em`, `iniciada_em`, `concluida_em`, `cancelada_por`.

### Formato completo de corrida
```json
{
  "id_corrida": 1, "status": "aceita",
  "id_passageiro": 2, "passageiro": { "id_usuario": 2, "nome": "Lucas Almeida", "telefone": "(15) 99999-0002" },
  "id_motorista": 1, "motorista": { "id_usuario": 1, "nome": "Camila Ferreira", "telefone": "(15) 99999-0001" },
  "id_veiculo": 1, "veiculo": { "id_veiculo": 1, "modelo": "Chevrolet Bolt EV", "placa": "BRA2E19", "categoria": "carro", "propulsao": "eletrico", "cor": "Branco" },
  "origem": "Parque Campolim, Sorocaba", "destino": "Centro Universitário FACENS, Sorocaba",
  "origem_lat": -23.5199, "origem_lng": -47.4642, "destino_lat": -23.4706, "destino_lng": -47.4295,
  "distancia_km": 13.0, "duracao_min": 16, "preco_estimado": 39.05,
  "criada_em": "2026-10-20T07:30", "aceita_em": "2026-10-20T07:31", "iniciada_em": null, "concluida_em": null, "cancelada_por": null
}
```
`preco_estimado` = bandeirada R$ 5,00 + R$ 2,20/km + R$ 0,30/min, mínimo R$ 8,00 (mesma regra de `utils/estimativas.js`). Na busca por proximidade, cada item ganha `distancia_ate_voce_km`.

### POST `/corridas/` — passageiro pede
Requisição: `{ "id_passageiro": 2, "origem": "...", "destino": "...", "origem_lat", "origem_lng", "destino_lat", "destino_lng", "distancia_km": 13.0, "duracao_min": 16 }`. Coordenadas obrigatórias; distância e duração opcionais (o backend estima se faltarem).
Resposta `201`: `{ "mensagem": "Corrida solicitada! Procurando motorista...", "corrida": { ... } }`.
Erros: `400` · `403` usuário não é passageiro · `404` · `409` já tem corrida ativa.

### GET `/corridas/` — listagem
Filtros opcionais: `status` (um ou vários separados por vírgula), `id_usuario` (corridas em que participa, como passageiro ou motorista), `ativas=true` (só `pendente`, `aceita`, `em_andamento`), e proximidade `lat`, `lng`, `raio_km` (padrão 10): só corridas cuja origem está a até `raio_km`, com `distancia_ate_voce_km`, ordenadas pela distância. Sem proximidade, ordenar por `criada_em` decrescente.

O motorista online consulta `GET /corridas/?status=pendente&lat=&lng=&raio_km=10` a cada 4 s. A tela de acompanhamento consulta `GET /corridas/{id}` a cada 3 s enquanto a corrida estiver ativa.

### GET `/corridas/{id}`
Resposta `200`: formato completo. `404` se não existir.

### POST `/corridas/{id}/aceitar` — motorista aceita
Requisição: `{ "id_motorista": 1, "id_veiculo": 1 }`.
Resposta `200`: `{ "mensagem": "Corrida aceita! Vá até o passageiro.", "corrida": { ... } }`.
Erros: `403` não é motorista ou veículo não é dele · `404` · `409` corrida já aceita/encerrada, ou motorista já está em outra corrida.

### POST `/corridas/{id}/status` — muda o estado
Requisição: `{ "status": "em_andamento" | "concluida" | "cancelada", "id_usuario": 1 }`.
Regras: `em_andamento` e `concluida` só pelo motorista da corrida, na ordem `aceita` → `em_andamento` → `concluida`. `cancelada` pelo passageiro (em `pendente` ou `aceita`) encerra; pelo motorista (em `aceita`) devolve a corrida a `pendente` sem motorista.
Resposta `200`: `{ "mensagem": "...", "corrida": { ... } }`. Erros: `400` status inválido · `403` não participa ou não pode fazer essa transição · `409` estado não permite.

## 7.2 Motoristas online (novo)

Tabela nova `motorista_online`: `id_usuario` (único), `id_veiculo`, `lat`, `lng`, `atualizado_em`. Um registro por motorista; sair de online remove o registro.

### POST `/motoristas/online`
Requisição: `{ "id_usuario": 1, "online": true, "lat": -23.50, "lng": -47.45, "id_veiculo": 1 }` (com `online: false`, os demais campos são ignorados).
Resposta `200`: `{ "mensagem": "Você está online e receberá pedidos próximos.", "online": true }`.
Erros: `400` sem coordenadas ou veículo inválido · `403` não é motorista · `404`.

### GET `/motoristas/online?lat=&lng=&raio_km=&id_usuario=`
Resposta `200`: `[ { "id_usuario": 1, "nome": "Camila Ferreira", "lat": -23.50, "lng": -47.45, "atualizado_em": "...", "veiculo": { "modelo": "...", "categoria": "carro", "propulsao": "eletrico" }, "distancia_km": 2.1 } ]`. Com `lat`/`lng`, filtra por `raio_km` (padrão 15) e ordena pela distância. Com `id_usuario`, devolve só aquele motorista (o front usa para saber se ele está online). O passageiro consulta a cada 10 s para mostrar os motoristas no mapa.

Recomendação para o backend: descartar registros com `atualizado_em` mais antigo que 10 minutos (motorista que fechou o app sem ficar offline).

## 8. Alterações necessárias no modelo atual

| Onde | O que |
|---|---|
| `Usuario` | adicionar `telefone`, `genero`, `data_nascimento`; `senha` para `String(255)` (o hash é longo); relacionamentos `veiculos`, `caronas` |
| `Veiculo` | trocar `tipo` por `categoria` (`carro`/`moto`) e adicionar `propulsao` (`eletrico`/`hibrido`), ambos `String(20)` `nullable=False`; `id_usuario` `nullable=False`; relacionamento `caronas` |
| `Carona` | adicionar `origem_lat`, `origem_lng`, `destino_lat`, `destino_lng`, `distancia_km` (Float, opcionais); relacionamentos `usuario`, `veiculo` e `reservas` |
| `Reserva` | tabela nova (seção 6) |
| `Avaliacao` | tabela nova (seção 7), com `id_carona` ou `id_corrida` |
| `Corrida` | tabela nova (seção 7.1) |
| `MotoristaOnline` | tabela nova (seção 7.2) |
| `PerfilUsuario` | popular com Motorista (1) e Passageiro (2) no `create_all` |

Como o banco é SQLite de desenvolvimento, apagar o arquivo `.db` e deixar o `create_all` recriar é suficiente. O caminho do banco deve ser relativo ao projeto (`os.path`), nunca um caminho fixo de uma máquina.

## 9. Segurança (obrigatório antes da entrega)

1. Senha com `generate_password_hash` no cadastro e `check_password_hash` no login. Nunca texto puro, nunca `==`.
2. `senha` nunca sai em resposta nenhuma.
3. Mensagem única no `401` do login.
4. Validar todo campo no backend (tipo, tamanho, obrigatoriedade). A validação do front é só conforto para o usuário.
5. Erros `500` devolvem `{ "erro": "Erro interno" }`. Nunca `str(e)` nem stack trace para o cliente. Registrar o detalhe em log no servidor.
6. `CORS` restrito às origens do front. Nunca `*`.
7. `SECRET_KEY` e URL do banco lidas de variáveis de ambiente. Nada de segredo commitado.
8. `debug=False` em produção.
9. Limite de tentativas no login (por exemplo, 5 por minuto por IP) com `Flask-Limiter`, para dificultar força bruta.
10. Sessão com cookie `httpOnly`, `SameSite=Lax` e `Secure` em produção. Rotas que criam ou apagam dados devem usar o usuário da sessão, não o `id_usuario` do corpo.

## 10. Como o front consome

- URL da API em `EcoMove-Front/.env` (`VITE_API_URL`).
- Com `VITE_USE_MOCK=true`, o arquivo `src/services/mock.js` responde a todas as rotas deste documento, guardando dados no `localStorage`. Usuários de demonstração: `camila@exemplo.com` (motorista) e `lucas@exemplo.com` (passageiro), ambos com senha `123456`.
- Para testar contra o backend real: `VITE_USE_MOCK=false` e reiniciar o `npm run dev`.
