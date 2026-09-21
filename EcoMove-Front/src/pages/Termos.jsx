import React from "react";
import PaginaLegal from "../components/PaginaLegal";

const ATUALIZADO_EM = "21 de setembro de 2026";

const resumo = [
  "O EcoMove conecta motoristas e passageiros com trajetos parecidos, só em veículos elétricos ou híbridos. Não é uma empresa de transporte.",
  "Passageiros a partir de 16 anos; motoristas a partir de 18, com CNH válida.",
  "Nesta versão não há pagamento pelo app: a divisão de custos é combinada entre as pessoas, e os valores mostrados são estimativas.",
  "Respeito e segurança são obrigatórios. Contas com dados falsos ou uso abusivo podem ser suspensas.",
  "Você pode excluir sua conta quando quiser.",
];

const secoes = [
  {
    id: "sobre",
    titulo: "Sobre o EcoMove",
    itens: [
      "O EcoMove é uma plataforma de mobilidade compartilhada desenvolvida como projeto de extensão universitária (UPX V) do Centro Universitário FACENS, em Sorocaba, SP. Ela conecta motoristas e passageiros que fazem trajetos semelhantes, em dois modos: carona agendada, em que o motorista publica um trajeto com data, hora e vagas, e corrida agora, em que o passageiro pede um deslocamento imediato e um motorista online por perto aceita.",
      "Só participam veículos 100% elétricos ou híbridos, carros ou motos. Essa é uma regra do produto e não pode ser contornada no cadastro do veículo.",
      "O EcoMove não é uma empresa de transporte, não emprega motoristas e não intermedia pagamentos. Ele oferece o meio para pessoas se encontrarem e combinarem o deslocamento.",
      "Ao criar uma conta ou usar a plataforma, você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não use o serviço.",
    ],
  },
  {
    id: "quem-pode-usar",
    titulo: "Quem pode usar",
    itens: [
      { lista: [
        "Passageiros: pessoas com 16 anos ou mais.",
        "Motoristas: pessoas com 18 anos ou mais, com CNH válida na categoria do veículo e um carro ou moto elétrica ou híbrida em condições de circular.",
        "Uma conta por pessoa, com dados verdadeiros e atualizados. Não é permitido criar contas para terceiros nem usar documentos de outra pessoa.",
      ] },
      "Podemos pedir a confirmação de dados (por exemplo, CNH e placa) e recusar ou suspender cadastros que não atendam a estes requisitos.",
    ],
  },
  {
    id: "conta",
    titulo: "Sua conta e sua senha",
    itens: [
      "A senha é pessoal e intransferível. Você é responsável por tudo o que for feito com a sua conta, então não a compartilhe e escolha uma senha forte, com letras e números.",
      "Se suspeitar de acesso indevido, troque a senha e avise a equipe pelo e-mail de contato. Nunca pediremos sua senha por e-mail, telefone ou mensagem.",
      "Podemos suspender ou encerrar contas com dados falsos, uso abusivo, fraude, desrespeito a outros usuários ou descumprimento destes termos, com aviso quando possível.",
    ],
  },
  {
    id: "caronas-e-corridas",
    titulo: "Caronas e corridas",
    itens: [
      "Na carona agendada, o motorista define trajeto, horário, vagas e uma contribuição sugerida por passageiro. O passageiro reserva a vaga e combina os detalhes com o motorista.",
      "Na corrida agora, o passageiro informa origem e destino, vê a estimativa e envia o pedido. Um motorista online por perto pode aceitar. Até a aceitação, qualquer um dos lados pode desistir sem custo.",
      "Nesta versão, a plataforma não cobra nem repassa valores. A divisão dos custos da viagem (energia, pedágio, desgaste) é combinada diretamente entre motorista e passageiro. Os valores exibidos, inclusive o comparativo com uma corrida individual, são estimativas para ajudar na decisão, não um preço contratado.",
      "Cancelamentos devem ser feitos com a maior antecedência possível, pelo app, para não prejudicar quem contava com a viagem. Cancelamentos repetidos de última hora podem levar à suspensão da conta.",
      "A quantidade de passageiros não pode exceder os assentos com cinto do veículo. Na moto, vai um passageiro por vez, com capacete.",
    ],
  },
  {
    id: "conduta",
    titulo: "Regras de conduta",
    itens: [
      { lista: [
        "Trate todas as pessoas com respeito. Não são tolerados discriminação, assédio, ameaças ou violência de qualquer tipo.",
        "Motoristas devem cumprir as leis de trânsito, não dirigir sob efeito de álcool ou outras substâncias e manter o veículo em condições seguras.",
        "Passageiros devem estar no ponto combinado no horário, usar cinto ou capacete e respeitar as regras do veículo.",
        "Não use a plataforma para transporte remunerado profissional, propaganda, golpes ou qualquer atividade ilegal.",
        "Não publique conteúdo ofensivo, falso ou que exponha dados de terceiros, inclusive nas avaliações.",
      ] },
      "Denúncias podem ser feitas pelo e-mail de contato. Vamos analisar e tomar as medidas cabíveis, que podem incluir a suspensão da conta.",
    ],
  },
  {
    id: "avaliacoes",
    titulo: "Avaliações e reputação",
    itens: [
      "Ao fim de cada viagem, motorista e passageiro podem avaliar um ao outro com estrelas e um comentário curto. A média das avaliações fica visível ao lado do nome, para ajudar as pessoas a decidir com quem viajar.",
      "As avaliações devem ser honestas e relacionadas à viagem. Podemos remover avaliações ofensivas, falsas ou que violem estes termos.",
    ],
  },
  {
    id: "responsabilidades",
    titulo: "Responsabilidades e limites",
    itens: [
      "O EcoMove conecta pessoas. Cada usuário responde pelos próprios atos durante a viagem, pelo cumprimento das leis e pelas combinações feitas com a outra parte.",
      "Não garantimos que haverá motoristas ou passageiros disponíveis, que as viagens acontecerão no horário nem a conduta de qualquer usuário. As estimativas de tempo, custo e CO₂ evitado são aproximações calculadas com dados públicos de mapas e tarifas de referência.",
      "O serviço é fornecido como está, em versão acadêmica, sem garantia de disponibilidade contínua. Podemos alterar, pausar ou encerrar funcionalidades a qualquer momento.",
    ],
  },
  {
    id: "propriedade",
    titulo: "Propriedade intelectual",
    itens: [
      "O nome EcoMove, o código, o desenho das telas e os textos pertencem à equipe do projeto e ao Centro Universitário FACENS. As fotos da página inicial vêm do Unsplash, sob a licença do Unsplash. Os mapas usam dados do OpenStreetMap, sob a licença ODbL.",
      "Você pode usar a plataforma para o fim a que se destina. Não é permitido copiar, modificar ou distribuir partes dela sem autorização.",
    ],
  },
  {
    id: "alteracoes",
    titulo: "Alterações e encerramento",
    itens: [
      "Podemos atualizar estes termos. Quando isso acontecer, a data no topo muda e, em alterações relevantes, avisaremos na plataforma. Continuar usando o EcoMove depois do aviso significa concordar com a nova versão.",
      "Você pode excluir sua conta a qualquer momento pelo e-mail de contato. A exclusão remove seus dados pessoais, como descrito na Política de Privacidade.",
    ],
  },
  {
    id: "legislacao",
    titulo: "Legislação, foro e contato",
    itens: [
      "Estes termos seguem as leis brasileiras, em especial o Código de Defesa do Consumidor, o Marco Civil da Internet e a Lei Geral de Proteção de Dados (LGPD). Fica eleito o foro da comarca de Sorocaba, SP, para resolver qualquer questão.",
      "Dúvidas e pedidos: contato@ecomove.com.br.",
    ],
  },
];

function Termos() {
  return (
    <PaginaLegal
      chapeu="Documento"
      titulo="Termos de Uso"
      atualizadoEm={ATUALIZADO_EM}
      resumo={resumo}
      secoes={secoes}
      nota="Este documento foi elaborado pela equipe do projeto para a versão acadêmica do EcoMove. Antes de uma operação comercial, deve ser revisado por profissional habilitado."
      outro={{ to: "/privacidade", rotulo: "Política de Privacidade" }}
    />
  );
}

export default Termos;
