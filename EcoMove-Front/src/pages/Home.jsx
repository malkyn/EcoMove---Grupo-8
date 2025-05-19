import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Logo from "../pages/icons/seguro-de-automovel.svg";
import Info from "./icons/informacoes.svg";

function Home() {
  return (
    <div className="home-container">
      <div className="content-wrapper">
        {/* Seção Hero Banner */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <span className="badge">Disponível em Sorocaba e região</span>
              <h1>
                Compartilhe o caminho, <br />
                <span className="highlight">Conecte Pessoas</span>
              </h1>
              <p>
                A Eco Move é uma solução inteligente que conecta pessoas a meios
                de transporte sustentáveis, como bicicletas, caronas
                compartilhadas, veículos elétricos e transporte público. Tudo
                isso com tecnologia e impacto positivo para o planeta.
              </p>
              <div className="buttons">
                <Link to="/loginForm" className="btn-primary">
                  Cadastre-se Agora
                </Link>
                <a href="#como-funciona" className="btn-secondary">
                  Como Funciona
                </a>
              </div>
            </div>
            <div className="hero-image">
              <img
                src={Info}
                alt="Ilustração mostrando pessoas compartilhando caronas e usando transporte sustentável"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Seção de Funcionalidades */}
        <section className="features-section">
          <div className="section-header">
            <h2>Principais Funcionalidades</h2>
            <p className="subtitle">
              Nossa plataforma foi desenvolvida para tornar o compartilhamento
              de caronas uma experiência simples, segura e agradável.
            </p>
          </div>

          <div className="features-grid">
            {/* Cartão de Funcionalidade 1 */}
            <div className="feature-card">
              <img src={Logo} alt="Ícone de rota sustentável" />
              <h3>Rotas Sustentáveis Inteligentes</h3>
              <p>
                Motoristas e passageiros se cadastram rapidamente, com validação
                de informações para garantir mais segurança.
              </p>
            </div>

            {/* Cartão de Funcionalidade 2 */}
            <div className="feature-card">
              <img src={Logo} alt="Ícone de estação de recarga" />
              <h3>Localização de Estações de Recarga</h3>
              <p>
                Visualize e publique viagens facilmente. Encontre opções com
                base na origem e destino.
              </p>
            </div>

            {/* Cartão de Funcionalidade 3 */}
            <div className="feature-card">
              <img src={Logo} alt="Ícone de carona compartilhada" />
              <h3>Caronas Compartilhadas e Seguras</h3>
              <p>
                Conexão rápida entre usuários por meio de grupos regionais,
                organizando caronas em tempo real.
              </p>
            </div>

            {/* Cartão de Funcionalidade 4 */}
            <div className="feature-card">
              <img src={Logo} alt="Ícone de monitoramento ambiental" />
              <h3>Monitoramento do Impacto Ambiental</h3>
              <p>
                Após cada viagem, motoristas e passageiros podem avaliar a
                experiência, aumentando a confiabilidade.
              </p>
            </div>

            {/* Cartão de Funcionalidade 5 */}
            <div className="feature-card">
              <img src={Logo} alt="Ícone de recompensas ecológicas" />
              <h3>Sistema de Recompensas Ecológicas</h3>
              <p>
                Verificação de identidade e normas claras para uma comunidade
                respeitosa e confiável.
              </p>
            </div>

            {/* Cartão de Funcionalidade 6 */}
            <div className="feature-card">
              <img src={Logo} alt="Ícone de interface acessível" />
              <h3>Interface Intuitiva e Acessível</h3>
              <p>
                Design pensado para todos os usuários, com navegação simples e
                recursos de acessibilidade.
              </p>
            </div>
          </div>
        </section>

        {/* Seção de Como Funciona */}
        <section className="how-it-works">
          <div className="section-header">
            <h2>Como Funciona a Plataforma de Mobilidade Sustentável?</h2>
            <p>
              A Eco Move conecta tecnologia, sustentabilidade e mobilidade
              urbana em um só lugar. De forma simples e intuitiva, ela ajuda as
              pessoas a se locomoverem pela cidade de forma mais eficiente,
              econômica e amiga do meio ambiente.
            </p>
          </div>

          <div className="steps-grid">
            {/* Passo 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Acesse a Plataforma</h4>
              <p>Registre-se em minutos e comece a usar</p>
            </div>

            {/* Passo 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Escolha seu Roteiro Sustentável</h4>
              <p>Encontre a melhor opção para seu trajeto</p>
            </div>

            {/* Passo 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Encontre ou Ofereça uma Carona</h4>
              <p>Conecte-se com outros usuários</p>
            </div>

            {/* Passo 4 */}
            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Localize Estações de Recarga Elétrica</h4>
              <p>Para veículos elétricos e híbridos</p>
            </div>

            {/* Passo 5 */}
            <div className="step-card">
              <div className="step-number">5</div>
              <h4>Acompanhe seu Impacto Ambiental</h4>
              <p>Veja quanto CO² você está economizando</p>
            </div>

            {/* Passo 6 */}
            <div className="step-card">
              <div className="step-number">6</div>
              <h4>Ganhe Recompensas Verdes</h4>
              <p>Benefícios por usar transporte sustentável</p>
            </div>
          </div>
        </section>

        {/* Seção CTA (Call to Action) */}
        <section className="cta-section">
          <h2>Pronto para compartilhar o seu caminho?</h2>
          <p>
            Junte-se à Eco Move e faça parte de uma comunidade que economiza
            recursos e conecta pessoas.
          </p>
          <Link to="/loginForm" className="cta-button">
            Cadastre-se Agora
          </Link>
        </section>
      </div>
    </div>
  );
}

export default Home;
