# EcoMove 2.0

Plataforma de mobilidade sustentável: conecta motoristas e passageiros com trajetos semelhantes em Sorocaba e região, incentivando caronas e veículos elétricos.

Projeto de extensão UPX V, Centro Universitário FACENS, 2026. Grupo 8: Marcos Vinicius Oliveira Lima (backend), Murillo dos Santos Freitas (frontend), Priscila Justi Rouco Rodrigues Rosa (requisitos e documentação).

## Estrutura

```
EcoMove-Front/   frontend React + Vite (web app responsivo)
upx_backend/     backend Flask + SQLAlchemy (API REST)
docs/            contrato da API e documentação técnica
```

## Frontend

Requisitos: Node.js 18 ou superior.

```bash
cd EcoMove-Front
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:5173`.

O arquivo `.env` controla a conexão com a API:

| Variável | Uso |
|---|---|
| `VITE_API_URL` | URL do backend Flask (padrão `http://127.0.0.1:5000`) |
| `VITE_USE_MOCK` | `true` simula a API no navegador, sem backend; `false` usa o backend real |

Com `VITE_USE_MOCK=true` os dados ficam no `localStorage` e existem dois usuários de demonstração, ambos com senha `123456`: `camila@exemplo.com` (motorista) e `lucas@exemplo.com` (passageiro). Para voltar ao estado inicial, apague a chave `ecomove_mock_db` no DevTools (Application, Local Storage).

Outros comandos: `npm run lint` (análise estática) e `npm run build` (gera a pasta `dist/`).

## Backend

Requisitos: Python 3.10 ou superior.

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux e macOS
pip install -r upx_backend/requirements.txt
python -m upx_backend.app
```

A API sobe em `http://127.0.0.1:5000`. As rotas, campos e regras de segurança que o backend deve seguir estão em [docs/api-contrato.md](docs/api-contrato.md).

## Fluxo de trabalho

- Ninguém commita direto na `main`. Cada tarefa nasce em uma branch (`feature/...` ou `fix/...`) e entra por Pull Request com título e descrição.
- Arquivos `.env` não vão para o repositório. Use `.env.example` como modelo.
