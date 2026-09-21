import React from "react";
import PaginaLegal from "../components/PaginaLegal";

const ATUALIZADO_EM = "21 de setembro de 2026";

const resumo = [
  "Coletamos só o necessário para criar sua conta, casar trajetos e manter a comunidade segura.",
  "Outros usuários veem apenas o que precisam para a viagem: primeiro nome, avaliação e, no caso do motorista, o veículo e a placa.",
  "Sua localização só é usada quando você autoriza no navegador, e você pode desligar quando quiser.",
  "Não vendemos seus dados nem usamos para publicidade. Não usamos cookies de rastreamento.",
  "Você pode acessar, corrigir ou excluir seus dados pelo e-mail de contato, com resposta em até 15 dias.",
];

const secoes = [
  {
    id: "quem-somos",
    titulo: "Quem somos e como falar com a gente",
    itens: [
      "O EcoMove é um projeto de extensão universitária (UPX V) do Centro Universitário FACENS, em Sorocaba, SP, desenvolvido pelo Grupo 8. A equipe do projeto é a responsável pelo tratamento dos seus dados pessoais, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).",
      "Para qualquer assunto sobre seus dados, escreva para contato@ecomove.com.br.",
    ],
  },
  {
    id: "dados-coletados",
    titulo: "Quais dados coletamos",
    itens: [
      "No cadastro:",
      { lista: [
        "Nome completo, e-mail, celular, data de nascimento e CPF.",
        "Gênero, se você quiser informar.",
        "Para motoristas: número da CNH e os dados do veículo (tipo, modelo, placa e se é elétrico ou híbrido).",
      ] },
      "No uso da plataforma:",
      { lista: [
        "Origem, destino, data e horário das caronas e corridas que você publica, reserva ou pede.",
        "Sua localização aproximada, apenas quando você autoriza no navegador.",
        "Avaliações que você faz e recebe.",
        "Dados técnicos mínimos para o serviço funcionar, como o tipo de navegador.",
      ] },
      "Não pedimos dados sensíveis, como saúde, religião ou orientação sexual, e não coletamos dados de pagamento, porque nesta versão não há cobrança pelo app.",
    ],
  },
  {
    id: "finalidades",
    titulo: "Para que usamos",
    itens: [
      { lista: [
        "Criar, proteger e manter sua conta, inclusive confirmar que cada conta é de uma pessoa real.",
        "Encontrar caronas compatíveis com o seu trajeto e horário, e motoristas próximos para corridas.",
        "Mostrar rota, distância, tempo, estimativa de custo e CO₂ evitado.",
        "Permitir o contato entre motorista e passageiro depois de uma reserva ou aceite.",
        "Manter o sistema de avaliações e a reputação dos usuários.",
        "Sugerir caronas com base no seu histórico, sempre explicando o motivo da sugestão.",
        "Prevenir fraudes e abusos e cumprir obrigações legais.",
      ] },
      "Não usamos seus dados para publicidade nem os vendemos a terceiros.",
    ],
  },
  {
    id: "base-legal",
    titulo: "Base legal",
    itens: [
      "Tratamos seus dados com fundamento na execução do serviço que você pediu ao criar a conta (art. 7º, V, da LGPD), no seu consentimento para a localização, que pode ser retirado a qualquer momento, no legítimo interesse de manter a comunidade segura e prevenir fraudes, e no cumprimento de obrigações legais.",
    ],
  },
  {
    id: "compartilhamento",
    titulo: "Com quem compartilhamos",
    itens: [
      "Com outros usuários, só o necessário para a viagem:",
      { lista: [
        "Primeiro nome e média de avaliações, visíveis para quem procura uma carona ou corrida.",
        "Para motoristas: modelo, tipo e placa do veículo, para o passageiro reconhecer o carro ou a moto.",
        "Celular, para os dois lados, apenas depois que a reserva ou a corrida é confirmada.",
      ] },
      "CPF, CNH, data de nascimento e e-mail nunca aparecem para outros usuários.",
      "Com serviços de mapa: para buscar endereços e traçar rotas usamos o OpenStreetMap (Nominatim e OSRM). Eles recebem os endereços pesquisados, sem seu nome ou seus dados de conta.",
      "Com autoridades, somente quando exigido por lei ou ordem judicial.",
    ],
  },
  {
    id: "localizacao",
    titulo: "Localização",
    itens: [
      "A localização só é acessada quando você autoriza no navegador. Ela serve para mostrar sua posição no mapa, sugerir sua origem e encontrar motoristas por perto.",
      "Você pode negar ou retirar a permissão nas configurações do navegador a qualquer momento. Sem ela, o EcoMove continua funcionando: basta digitar o endereço.",
    ],
  },
  {
    id: "seguranca",
    titulo: "Armazenamento e segurança",
    itens: [
      { lista: [
        "Sua senha é guardada apenas como hash, um código que não permite recuperar a senha original. Nem a equipe consegue vê-la.",
        "A comunicação usa HTTPS, e a aplicação aplica uma política de segurança de conteúdo (CSP) para reduzir riscos de scripts maliciosos.",
        "O acesso aos dados é restrito à equipe do projeto, apenas para operar e dar suporte ao serviço.",
        "Na versão de demonstração (modo mock), os dados ficam somente no seu navegador e não são enviados a nenhum servidor.",
      ] },
      "Nenhum sistema é totalmente seguro. Se identificarmos um incidente com seus dados, vamos avisar você e a autoridade competente conforme a lei.",
    ],
  },
  {
    id: "retencao",
    titulo: "Por quanto tempo guardamos",
    itens: [
      "Mantemos seus dados enquanto sua conta existir. Quando você pede a exclusão, removemos seus dados pessoais; caronas e avaliações passadas ficam sem identificação. Guardamos apenas o que a lei exigir, pelo prazo que ela determinar.",
    ],
  },
  {
    id: "direitos",
    titulo: "Seus direitos",
    itens: [
      "A LGPD garante a você, a qualquer momento:",
      { lista: [
        "Confirmar se tratamos seus dados e acessá-los.",
        "Corrigir dados incompletos, inexatos ou desatualizados.",
        "Pedir a exclusão dos seus dados e da sua conta.",
        "Receber seus dados em formato legível (portabilidade).",
        "Retirar o consentimento para a localização.",
        "Saber com quem compartilhamos seus dados.",
      ] },
      "Para exercer qualquer um deles, escreva para contato@ecomove.com.br. Respondemos em até 15 dias. Se não ficar satisfeito, você pode recorrer à Autoridade Nacional de Proteção de Dados (ANPD).",
    ],
  },
  {
    id: "cookies",
    titulo: "Cookies e armazenamento no navegador",
    itens: [
      "Não usamos cookies de rastreamento nem ferramentas de publicidade. O navegador guarda apenas sua sessão e preferências (por exemplo, se você já está logado) para o app funcionar. Ao sair da conta, essas informações são apagadas.",
    ],
  },
  {
    id: "menores",
    titulo: "Menores de idade",
    itens: [
      "O EcoMove é para pessoas a partir de 16 anos, e motoristas precisam ter 18 ou mais. Não coletamos conscientemente dados de menores de 16 anos. Se souber de um cadastro assim, avise a equipe para que ele seja removido.",
    ],
  },
  {
    id: "alteracoes",
    titulo: "Alterações nesta política",
    itens: [
      "Podemos atualizar esta política. A data no topo mostra a versão em vigor e, em mudanças relevantes, avisaremos na plataforma.",
    ],
  },
];

function Privacidade() {
  return (
    <PaginaLegal
      chapeu="Documento"
      titulo="Política de Privacidade"
      atualizadoEm={ATUALIZADO_EM}
      resumo={resumo}
      secoes={secoes}
      nota="Este documento foi elaborado pela equipe do projeto para a versão acadêmica do EcoMove. Antes de uma operação comercial, deve ser revisado por profissional habilitado."
      outro={{ to: "/termos", rotulo: "Termos de Uso" }}
    />
  );
}

export default Privacidade;
