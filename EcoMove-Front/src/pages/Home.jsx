import React, { useRef } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import FotoHero from "./icons/hero-carona.webp";
import FotoCarroEletrico from "./icons/carro-eletrico.webp";
import FotoMoto from "./icons/moto-eletrica.webp";
import FotoCorridaApp from "./icons/corrida-app.webp";
import Ilustracao from "./icons/ilustracao-app.webp";
import { getUsuarioLogado } from "../services/auth";
import useRevelarAoRolar from "../hooks/useRevelarAoRolar";
import MapaAnimado from "../components/MapaAnimado";
import {
  IconeAlvo,
  IconeCarro,
  IconeEstrela,
  IconeFaisca,
  IconeFolha,
  IconeRaio,
  IconeRelogio,
  IconeRota,
} from "../components/Icones";

/** Celular desenhado em CSS mostrando a tela "Para onde?" do app. */
function CelularDemo() {
  return (
    <div className="lp-fone" aria-hidden="true">
      <div className="lp-fone-tela">
        <div className="lp-fone-topo">
          <span className="lp-fone-marca">EcoMove</span>
          <span className="lp-fone-demo">demo</span>
        </div>
        <div className="lp-fone-mapa">
          <svg viewBox="0 0 220 150" className="lp-fone-rota">
            <path
              d="M28 118 C 60 100, 70 70, 110 72 S 170 60, 192 34"
              fill="none"
              stroke="#036141"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="28" cy="118" r="7" fill="#036141" stroke="#fff" strokeWidth="3" />
            <circle cx="192" cy="34" r="7" fill="#d9480f" stroke="#fff" strokeWidth="3" />
            <circle cx="150" cy="105" r="5" fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
            <circle cx="70" cy="40" r="5" fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
        <div className="lp-fone-folha">
          <div className="lp-fone-campo">
            <span className="lp-fone-campo-rotulo">Destino</span>
            <span>Centro Universitário FACENS</span>
          </div>
          <div className="lp-fone-resumo">
            <strong>13 km</strong> · 16 min
          </div>
          <div className="lp-fone-comparativo">
            <div className="lp-fone-opcao">
              <span>Corrida individual</span>
              <strong>R$ 39,05</strong>
            </div>
            <div className="lp-fone-opcao lp-fone-opcao-destaque">
              <span>Carona EcoMove</span>
              <strong>R$ 7,95</strong>
              <small>economize 80%</small>
            </div>
          </div>
          <div className="lp-fone-co2">
            <IconeFolha tamanho={14} /> 1,6 kg de CO₂ evitados
          </div>
          <div className="lp-fone-botao">Ver caronas compatíveis</div>
        </div>
        <div className="lp-fone-abas">
          <span className="ativa">Início</span>
          <span>Viagens</span>
          <span>Perfil</span>
        </div>
      </div>
    </div>
  );
}

const perguntas = [
  {
    pergunta: "Qual a diferença entre carona e corrida?",
    resposta:
      "Na carona, o motorista publica um trajeto com data e hora e os passageiros reservam vagas, dividindo o custo. Na corrida, o passageiro pede agora, e um motorista online por perto aceita, como nos apps de transporte.",
  },
  {
    pergunta: "Que veículos podem participar?",
    resposta:
      "Somente carros e motos 100% elétricos ou híbridos. É a regra do EcoMove: mobilidade compartilhada e de baixa emissão andam juntas.",
  },
  {
    pergunta: "Como é o pagamento?",
    resposta:
      "Nesta versão não há cobrança. Os valores mostrados são estimativas para comparação, e o acerto entre as pessoas é combinado diretamente. Pagamento pelo app é uma evolução futura.",
  },
  {
    pergunta: "Preciso instalar alguma coisa?",
    resposta:
      "Não. O EcoMove é um web app: abre no navegador do celular e pode ser adicionado à tela inicial, funcionando como um aplicativo, sem loja e sem download.",
  },
];

function Home() {
  const usuario = getUsuarioLogado();
  const destinoCadastro = usuario ? "/app" : "/loginForm";
  const raiz = useRef(null);
  useRevelarAoRolar(raiz);

  return (
    <div className="lp" ref={raiz}>
      {/* ===== Topo: foto à esquerda, texto solto sobre a foto desfocada à direita ===== */}
      <section className="lp-hero">
        <img
          className="lp-hero-foto"
          src={FotoHero}
          alt="Mulher sorrindo com o celular na mão, encostada em um carro elétrico que está carregando"
          width="1600"
          height="1067"
          fetchPriority="high"
        />
        <div className="lp-hero-vidro" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="lp-hero-sombra" aria-hidden="true" />
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-vazio" aria-hidden="true" />
          <div className="lp-hero-texto">
            <p className="lp-chapeu">Sorocaba e região · só veículos elétricos e híbridos</p>
            <h1>
              Compartilhe o caminho, <span className="lp-destaque">conecte pessoas</span>
            </h1>
            <p className="lp-hero-sub">
              Caronas agendadas com quem faz o mesmo trajeto que você, ou uma corrida agora com
              motoristas parceiros. Custo dividido e CO₂ evitado na tela.
            </p>
            <div className="lp-botoes">
              {usuario ? (
                <Link to="/app" className="lp-btn lp-btn-primario">
                  Abrir o app
                </Link>
              ) : (
                <>
                  <Link to="/loginForm" className="lp-btn lp-btn-primario">
                    Criar conta grátis
                  </Link>
                  <Link to="/entrar" className="lp-btn lp-btn-vazado">
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Números: uma linha, alinhada à esquerda ===== */}
      <section className="lp-numeros" aria-label="Números do EcoMove">
        <div className="lp-wrap lp-numeros-linha" data-revelar="lista">
          <div>
            <strong>80%</strong>
            <span>mais barato que uma corrida individual*</span>
          </div>
          <div>
            <strong>1,6 kg</strong>
            <span>de CO₂ evitados em 13 km de carro elétrico*</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>dos veículos elétricos ou híbridos</span>
          </div>
          <p className="lp-nota">*Estimativas com as tarifas de referência do app.</p>
        </div>
      </section>

      {/* ===== Vantagens: selo, título, parágrafo, detalhe e foto em moldura inclinada ===== */}
      <section className="lp-vitrine lp-vitrine-clara" id="funcionalidades">
        <div className="lp-wrap lp-vitrine-grid">
          <div className="lp-vitrine-texto" data-revelar>
            <span className="lp-selo">Economia</span>
            <h2>Economize até 80% por trajeto</h2>
            <p>
              Antes de decidir, você vê o preço de uma corrida individual e o da carona lado a
              lado, com a diferença em reais e em porcentagem.
            </p>
            <p className="lp-vitrine-detalhe">
              Num trajeto de 13 km em Sorocaba, a estimativa fica em R$ 39 na corrida sozinho e
              R$ 8 na carona.
            </p>
          </div>
          <div className="lp-vitrine-visual" data-revelar="direita">
            <div className="lp-vitrine-moldura">
              <img
                src={FotoCorridaApp}
                alt="Celular mostrando o mapa de um aplicativo de transporte"
                loading="lazy"
                width="900"
                height="1228"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="lp-vitrine lp-vitrine-verde lp-vitrine-invertida">
        <div className="lp-wrap lp-vitrine-grid">
          <div className="lp-vitrine-texto" data-revelar>
            <span className="lp-selo">Impacto</span>
            <h2>CO₂ evitado em cada viagem</h2>
            <p>
              Só veículos elétricos e híbridos entram no EcoMove. Ao fim de cada viagem, o app
              mostra quanto CO₂ deixou de ir para o ar em relação a um carro a combustão.
            </p>
            <p className="lp-vitrine-detalhe">
              Um carro a combustão emite cerca de 120 g de CO₂ por quilômetro. Um elétrico, zero no
              escapamento. Um híbrido, cerca da metade.
            </p>
          </div>
          <div className="lp-vitrine-visual" data-revelar="esquerda">
            <div className="lp-vitrine-moldura">
              <img
                src={FotoCarroEletrico}
                alt="Mão conectando o cabo de recarga em um carro elétrico branco"
                loading="lazy"
                width="1200"
                height="800"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="lp-vitrine lp-vitrine-escura">
        <div className="lp-wrap lp-vitrine-grid">
          <div className="lp-vitrine-texto" data-revelar>
            <span className="lp-selo">2 rodas ou 4</span>
            <h2>Carro ou moto, do seu jeito</h2>
            <p>
              Motoristas cadastram carros e motos elétricos ou híbridos, com placa e CNH validadas.
              Passageiros escolhem a opção que combina com o trajeto e o horário.
            </p>
            <p className="lp-vitrine-detalhe">
              Na moto vai um passageiro por vez. No carro, até oito vagas por carona.
            </p>
          </div>
          <div className="lp-vitrine-visual" data-revelar="direita">
            <div className="lp-vitrine-moldura">
              <img
                src={FotoMoto}
                alt="Pessoa pilotando uma moto elétrica em uma estrada"
                loading="lazy"
                width="1200"
                height="800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Recursos: título à esquerda, lista corrida à direita ===== */}
      <section className="lp-recursos">
        <div className="lp-wrap lp-recursos-grid">
          <h2 className="lp-recursos-titulo" data-revelar>
            O que mais vem no app
          </h2>
          <ul className="lp-recursos-lista" data-revelar="lista">
            <li>
              <IconeRota tamanho={22} />
              <div>
                <strong>Rota e tempo no mapa</strong>
                <p>Endereço, traçado, distância e duração antes de reservar.</p>
              </div>
            </li>
            <li>
              <IconeAlvo tamanho={22} />
              <div>
                <strong>Match por proximidade</strong>
                <p>Caronas com saída e chegada a poucos quilômetros de você, no seu horário.</p>
              </div>
            </li>
            <li>
              <IconeEstrela tamanho={22} />
              <div>
                <strong>Avaliações e reputação</strong>
                <p>Motorista e passageiro se avaliam ao fim da viagem.</p>
              </div>
            </li>
            <li>
              <IconeFaisca tamanho={22} />
              <div>
                <strong>Recomendação</strong>
                <p>Sugestões pelo seu histórico, sempre com o motivo explicado.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== Faixa verde: celular à esquerda, texto à direita ===== */}
      <section className="lp-faixa" id="modos">
        <div className="lp-wrap lp-faixa-grid">
          <div className="lp-faixa-visual" data-revelar="zoom">
            <CelularDemo />
          </div>
          <div className="lp-faixa-texto" data-revelar="direita">
            <p className="lp-chapeu lp-chapeu-claro">Dois modos no mesmo app</p>
            <h2>Carona agendada ou corrida agora</h2>
            <div className="lp-modos" data-revelar="lista">
              <div className="lp-modo">
                <IconeRelogio tamanho={22} />
                <div>
                  <strong>Carona agendada</strong>
                  <p>Para o trajeto de todo dia. O motorista publica, você reserva e divide o custo.</p>
                </div>
              </div>
              <div className="lp-modo">
                <IconeRaio tamanho={22} />
                <div>
                  <strong>Corrida agora</strong>
                  <p>Para quando não dá para esperar. Um motorista online por perto aceita o seu pedido.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Como funciona: passageiro em linha, motorista em cartão escuro ===== */}
      <section className="lp-secao" id="como-funciona">
        <div className="lp-wrap">
          <div className="lp-passos-topo" data-revelar>
            <h2>Como funciona</h2>
            <p>Três passos para o passageiro. Três para o motorista.</p>
          </div>

          <ol className="lp-passos-linha" data-revelar="lista">
            <li>
              <span className="lp-passo-num">1</span>
              <strong>Crie sua conta</strong>
              <p>Cadastro em um minuto, com validação dos dados.</p>
            </li>
            <li>
              <span className="lp-passo-num">2</span>
              <strong>Diga para onde vai</strong>
              <p>Endereço, horário, e o comparativo de custo aparece na hora.</p>
            </li>
            <li>
              <span className="lp-passo-num">3</span>
              <strong>Reserve ou peça</strong>
              <p>Escolha uma carona compatível ou peça uma corrida para agora.</p>
            </li>
          </ol>

          <div className="lp-passos-motorista" data-revelar>
            <div className="lp-passos-motorista-titulo">
              <IconeCarro tamanho={24} />
              <span>E para quem dirige</span>
            </div>
            <ol data-revelar="lista">
              <li>
                <strong>Cadastre o veículo</strong>
                <p>Carro ou moto, elétrico ou híbrido, com placa e CNH validadas.</p>
              </li>
              <li>
                <strong>Ofereça caronas ou fique online</strong>
                <p>Publique seu trajeto com vagas, ou receba pedidos de corrida por perto.</p>
              </li>
              <li>
                <strong>Divida o custo e some reputação</strong>
                <p>Contribuição sugerida por passageiro e avaliação ao fim de cada viagem.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ===== Sustentabilidade: mesmo padrão das vantagens, com as ODS no lugar do detalhe ===== */}
      <section className="lp-vitrine lp-vitrine-verde lp-vitrine-quadrada" id="sustentabilidade">
        <div className="lp-wrap lp-vitrine-grid">
          <div className="lp-vitrine-texto" data-revelar>
            <span className="lp-selo">Projeto de extensão FACENS</span>
            <h2>Menos carros na rua, menos CO₂ no ar</h2>
            <p>
              O EcoMove nasceu como projeto de extensão universitária em Sorocaba e se alinha a
              quatro Objetivos de Desenvolvimento Sustentável da ONU.
            </p>
            <ul className="lp-ods" data-revelar="lista">
              <li>
                <strong>7</strong> Energia limpa
              </li>
              <li>
                <strong>9</strong> Inovação e infraestrutura
              </li>
              <li>
                <strong>12</strong> Consumo responsável
              </li>
              <li>
                <strong>13</strong> Ação climática
              </li>
            </ul>
          </div>
          <div className="lp-vitrine-visual" data-revelar="direita">
            <div className="lp-vitrine-moldura">
              <img
                src={Ilustracao}
                alt="Ilustração de pessoas usando o celular para compartilhar viagens em veículos elétricos"
                width="900"
                height="900"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Perguntas em duas colunas ===== */}
      <section className="lp-secao lp-secao-clara" id="perguntas">
        <div className="lp-wrap lp-faq-grid">
          <div className="lp-faq-titulo" data-revelar>
            <h2>Perguntas frequentes</h2>
            <p>O essencial para começar. Dúvidas maiores, fale com a gente pelo rodapé.</p>
          </div>
          <div className="lp-faq-lista" data-revelar="lista">
            {perguntas.map((item) => (
              <details key={item.pergunta} className="lp-faq-item">
                <summary>{item.pergunta}</summary>
                <p>{item.resposta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Chamada final: texto e botão à esquerda, mapa animado à direita ===== */}
      <section className="lp-secao lp-secao-final">
        <div className="lp-wrap lp-cta" data-revelar>
          <div className="lp-cta-texto">
            <h2>Pronto para compartilhar o seu caminho?</h2>
            <p>Crie sua conta e instale o EcoMove na tela inicial do celular.</p>
            <Link to={destinoCadastro} className="lp-btn lp-btn-primario">
              {usuario ? "Abrir o app" : "Começar agora"}
            </Link>
          </div>
          <MapaAnimado />
        </div>
      </section>

      {/* Botão fixo no celular, como nos apps de transporte */}
      {!usuario && (
        <div className="lp-cta-fixa">
          <Link to="/loginForm" className="lp-btn lp-btn-primario">
            Criar conta grátis
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
