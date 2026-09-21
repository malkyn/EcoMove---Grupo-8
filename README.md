# EcoMove 2.0

Plataforma de mobilidade sustentável: conecta motoristas e passageiros com trajetos semelhantes em Sorocaba e região, em dois modos, **carona agendada** e **corrida sob demanda**, sempre em veículos 100% elétricos ou híbridos. Web app instalável no celular (PWA), com mapa, estimativa de custo, CO₂ evitado, avaliações e recomendação de caronas.

Projeto de extensão UPX V, Centro Universitário FACENS, 2026. Grupo 8: Marcos Vinicius Oliveira Lima (backend), Murillo dos Santos Freitas (frontend), Priscila Justi Rouco Rodrigues Rosa (requisitos e documentação).

## Estrutura

```
EcoMove-Front/   frontend React + Vite (web app responsivo, PWA)
upx_backend/     backend Flask + SQLAlchemy (API REST)
docs/            contrato da API, modelo de recomendação, segurança
```

Documentos: [contrato da API](docs/api-contrato.md) · [recomendação de caronas](docs/recomendacao.md) · [segurança](docs/seguranca.md)

## Frontend

Requisitos: Node.js 18 ou superior.

```bash
cd EcoMove-Front
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:5173`. Para testar no celular na mesma rede Wi-Fi, use o endereço "Network" que o Vite mostra.

| Variável do `.env` | Uso |
|---|---|
| `VITE_API_URL` | URL do backend Flask (padrão `http://127.0.0.1:5000`) |
| `VITE_USE_MOCK` | `true` simula a API no navegador, sem backend; `false` usa o backend real |

Outros comandos: `npm run lint` (análise estática), `npm run build` (gera `dist/` com manifesto, service worker e política de segurança) e `npm run preview` (serve o build).

### Modo demonstração (`VITE_USE_MOCK=true`)

Os dados ficam no `localStorage` do navegador. Contas prontas, ambas com senha `123456`:

| Conta | Perfil |
|---|---|
| `camila@exemplo.com` | Motorista, com um Chevrolet Bolt EV e caronas cadastradas |
| `lucas@exemplo.com` | Passageiro, com histórico de viagens |

Para voltar ao estado inicial, apague a chave `ecomove_mock_db` no DevTools (Application, Local Storage).

### Roteiro de demonstração

1. **Landing page** (`/`): proposta, funcionalidades e "Cadastre-se".
2. **Cadastro** como motorista ou passageiro, com validação de CPF, CNH e senha; depois **login**.
3. **Passageiro (Lucas):** Início com mapa e motoristas online por perto; "Sugeridas para você" com caronas parecidas com o histórico; "Para onde?" com busca de endereço, rota, distância, e o comparativo **corrida individual × carona** com economia e CO₂ evitado; "Ver caronas compatíveis" ordenadas pela recomendação; reservar vaga; "Pedir corrida agora".
4. **Motorista (Camila):** Perfil > Meus veículos (carro ou moto, elétrico ou híbrido); "Oferecer carona" com rota e contribuição sugerida; "Ficar online" e aceitar um pedido de corrida; iniciar e concluir; resumo com CO₂.
5. **Viagens e avaliações:** histórico de caronas e corridas; avaliar a outra pessoa com estrelas; reputação ao lado dos nomes.
6. **Instalar no celular:** Perfil > "Instalar o app" (Android) ou Compartilhar > Adicionar à Tela de Início (iPhone).

## Backend

Requisitos: Python 3.10 ou superior.

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux e macOS
pip install -r upx_backend/requirements.txt
python -m upx_backend.app
```

A API sobe em `http://127.0.0.1:5000`. As rotas, campos e regras que o backend deve seguir estão em [docs/api-contrato.md](docs/api-contrato.md). Com o backend no ar, coloque `VITE_USE_MOCK=false` no `.env` do front e reinicie o `npm run dev`.

## Fluxo de trabalho

- Ninguém commita direto na `main`. Cada tarefa nasce em uma branch (`feature/...` ou `fix/...`) e entra por Pull Request com título e descrição.
- Antes do PR: `npm run lint` e `npm run build` sem erros.
- Arquivos `.env` não vão para o repositório. Use `.env.example` como modelo.
