# Recomendação de caronas

Requisito 11 da documentação: "utilizar Inteligência Artificial para identificar rotas compatíveis e recomendar opções de carona". Esta versão implementa um **sistema de recomendação por pontuação explicável**, roda inteiramente no frontend (`src/utils/recomendacao.js`) e não depende do backend. Cada carona candidata recebe uma pontuação de 0 a 100 e uma lista de motivos legíveis, que o app mostra ao usuário. Não há caixa-preta: cada ponto tem uma origem que dá para explicar na apresentação.

## Onde aparece

1. **Caronas compatíveis** (`/app/caronas`): a lista já vem filtrada pela API por proximidade e horário; o modelo reordena da mais para a menos indicada. A primeira, se tiver 60 pontos ou mais, ganha o selo "Recomendada para você". Cada card lista até três motivos.
2. **Início do passageiro** ("Sugeridas para você"): sem o usuário pedir nada, o app compara as caronas futuras com o histórico dele (caronas reservadas e corridas concluídas) e sugere até duas que se pareçam com viagens anteriores, com botão de reservar.

## Fatores e pesos (busca por trajeto)

| Fator | Peso máximo | Como pontua |
|---|---|---|
| Proximidade da saída | 25 | 100% até 0,5 km, 80% até 1,5 km, 50% até 3 km, 20% até 5 km |
| Proximidade da chegada | 25 | mesma escala |
| Horário | 20 | agendado: 100% até 15 min de diferença, 70% até 45, 40% até 90. "Agora": 100% se sai em até 2 h, 70% até 6 h, 40% até 24 h |
| Histórico | 15 (+5) | +15 se o trajeto é praticamente o mesmo de uma viagem anterior (semelhança ≥ 0,8); +5 se já viajou com o motorista |
| Reputação do motorista | 8 | média ≥ 4,5: 100%; ≥ 4,0: 60% |
| Veículo | 7 | 100% elétrico: 100%; híbrido: 50% |

A semelhança entre dois trajetos é a média das proximidades de saída e de chegada (distância em linha reta, fórmula de Haversine), variando de 0 a 1.

## Sugestões pelo histórico (Início)

Pontuação = semelhança com a viagem anterior mais parecida × 60, + 20 se cai na mesma faixa de horário (até 1 h de diferença no relógio, em qualquer dia), + 10 se o motorista é conhecido, + 10 se o veículo é 100% elétrico. Só entram sugestões com 50 pontos ou mais.

## Por que não um modelo aprendido

Com a base de dados de um projeto acadêmico (dezenas de viagens), não há volume para treinar um modelo estatístico com ganho real, e um modelo opaco seria difícil de justificar aos usuários. A pontuação explicável entrega o comportamento esperado de um recomendador (personalização pelo histórico, ranqueamento, justificativa) e pode evoluir depois: os mesmos fatores viram atributos de entrada para um modelo treinado quando houver dados de aceitação (quais recomendações viraram reservas).

## Evolução possível no backend

O backend pode expor `GET /recomendacoes?id_usuario=` aplicando exatamente estas regras sobre a base completa, o que permitiria usar o histórico de todos os usuários (por exemplo, "pessoas com trajetos parecidos com o seu costumam ir com este motorista"). O contrato atual não exige isso.
