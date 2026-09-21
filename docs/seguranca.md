# Segurança no EcoMove

Registro do que o frontend já faz, do que depende do backend e do que fica para versões futuras. Serve de base para a parte de Cibersegurança do relatório.

## O que o frontend já faz

| Medida | Onde | Contra o quê |
|---|---|---|
| Senha só transita no corpo de um `POST`, nunca em URL nem em `console.log` | `Entrar.jsx`, `CadastroUsuario.jsx` | vazamento em histórico do navegador e logs |
| Mensagem única para e-mail inexistente e senha errada | contrato de login, simulador | enumeração de usuários |
| Erros `5xx` viram texto genérico; só `4xx` mostra a mensagem do servidor | `utils/erros.js` | vazamento de detalhes internos (stack trace, nomes de tabela) |
| Toda saída de dados passa pelo React, que escapa HTML; `dangerouslySetInnerHTML` não é usado | todas as telas | XSS refletido e armazenado |
| Validação de entrada no cliente (CPF com dígito verificador, placa, senha forte, limites de tamanho) | cadastro, veículos, caronas | dados malformados e erros de digitação; **não substitui** a validação no backend |
| Sessão no navegador guarda só id, nome, e-mail e perfil, com lista explícita de campos e verificação ao ler | `services/auth.js` | vazamento de senha/token via XSS; corrupção do storage |
| Rotas protegidas por sessão e por perfil (motorista/passageiro) | `RotaProtegida.jsx` | acesso a telas indevidas pela interface (o backend precisa reforçar) |
| `.env` fora do Git; nenhuma chave de API no código (mapas e rotas usam serviços públicos) | `.gitignore`, `services/geo.js` | vazamento de segredos em repositório público |
| Content Security Policy no build de produção: scripts só do próprio site, conexões só à API e ao OpenStreetMap, sem `object`, sem `base` externo | `vite.config.js` | XSS por script externo, exfiltração de dados para domínios estranhos |
| Service worker nunca intercepta rotas da API | `vite.config.js` (`navigateFallbackDenylist`) | respostas da API servidas do cache |
| Dependências auditadas com `npm audit` a cada instalação | fluxo de trabalho | pacotes com vulnerabilidades conhecidas |
| Simulador (`VITE_USE_MOCK`) claramente marcado como "demo" e documentado como inadequado para produção | `AppShell`, `mock.js` | uso indevido de dados de teste |

## O que depende do backend (contrato, seção 9)

1. Hash de senha (`generate_password_hash`) e comparação segura.
2. Validação de todos os campos no servidor.
3. Permissões por rota (só motorista cadastra veículo e aceita corrida; só participante avalia).
4. CORS restrito às origens do front.
5. `SECRET_KEY` e URL do banco por variável de ambiente; `debug=False` em produção.
6. Limite de tentativas de login (`Flask-Limiter`).
7. Sessão por cookie `httpOnly` + `SameSite=Lax` + `Secure`. Quando entrar, o front deixa de mandar `id_usuario` no corpo e passa a usar `withCredentials`, e o backend passa a emitir e validar um token anti-CSRF nas requisições que alteram dados.

## Riscos conhecidos desta versão

- **Identidade vem do cliente.** Enquanto não houver sessão no backend, qualquer requisição pode informar outro `id_usuario`. Aceitável só em desenvolvimento e na demonstração com simulador.
- **Dados pessoais sensíveis.** CPF e CNH ficam no banco. Pela LGPD, coletar só o necessário, informar a finalidade (os links "Termos de Uso" e "Política de Privacidade" ainda não têm conteúdo) e permitir exclusão da conta.
- **Telefone visível à outra parte da corrida.** É intencional para o contato, mas deve ser mostrado só depois do aceite, como já ocorre.
- **Serviços públicos do OpenStreetMap** têm limite de uso e sem garantia de disponibilidade. Para produção, hospedar Nominatim/OSRM próprios ou contratar um provedor.
- **Localização do usuário** só é lida com permissão explícita do navegador e não é armazenada além do estado "online" do motorista.

## Como verificar

- `npm audit` sem vulnerabilidades altas.
- `npm run build` gera `dist/index.html` com a meta `Content-Security-Policy`; no navegador, o console não pode mostrar violações de CSP.
- Tentar abrir `/app/veiculos` como passageiro: volta ao Início com aviso.
- No DevTools, a chave `ecomove_usuario` do `localStorage` nunca contém senha.
