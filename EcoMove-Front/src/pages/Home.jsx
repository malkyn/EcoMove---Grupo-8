import "./Home.css";
import { Link } from "react-router-dom";
import Logo from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/seguro-de-automovel.svg";
import Info from "./icons/informacoes.svg";
function Home() {
  return (
    <div className="home-container" style={{ paddingTop: 200 }}>
      <div className="content-wrapper">
        <section class="hero">
          <div class="hero-content">
            <div class="hero-text">
              <span class="badge">Disponível em Sorocaba e região</span>
              <h1>
                Compartilhe o caminho, <br />
                <span class="highlight">conecte pessoas</span>
              </h1>
              <p>
                A Eco Move é uma solução inteligente que conecta pessoas a meios
                de transporte sustentáveis, como bicicletas, caronas
                compartilhadas, veículos elétricos e transporte público. Tudo
                isso com tecnologia e impacto positivo para o planeta.
              </p>
              <div class="buttons">
                <a href="./loginForm" class="btn-primary">
                  Cadastre-se Agora
                </a>
                <a href="#como-funciona" class="btn-secondary">
                  Como Funciona
                </a>
              </div>
            </div>
            <div class="hero-image">
              <img src={Info} alt="Eco Move Ilustração" />
            </div>
          </div>
        </section>
        <section className="funcionalidades">
          <div className="principais-funcionalidades"></div>
          <h2 className="features-title">Principais Funcionalidades</h2>
          <p className="features-subtitle">
            Nossa plataforma foi desenvolvida para tornar o compartilhamento de
            caronas uma experiência simples, segura e agradável.
          </p>
          <div className="features-cards">
            <div className="feature-card">
              <img src={Logo} alt="Ícone" />
              <h3>Rotas Sustentáveis Inteligentes</h3>
              <p>
                Motoristas e passageiros se cadastram rapidamente, com validação
                de informações para garantir mais segurança.
              </p>
            </div>

            <div className="feature-card">
              <img src={Logo} alt="Ícone" />
              <h3>Localização de Estações de Recarga</h3>
              <p>
                Visualize e publique viagens facilmente. Encontre opções com
                base na origem e destino.
              </p>
            </div>

            <div className="feature-card">
              <img src={Logo} alt="Ícone" />
              <h3>Caronas Compartilhadas e Seguras</h3>
              <p>
                Conexão rápida entre usuários por meio de grupos regionais,
                organizando caronas em tempo real.
              </p>
            </div>

            <div className="feature-card">
              <img src={Logo} alt="Ícone" />
              <h3>Monitoramento do Impacto Ambiental</h3>
              <p>
                Após cada viagem, motoristas e passageiros podem avaliar a
                experiência, aumentando a confiabilidade.
              </p>
            </div>

            <div className="feature-card">
              <img src={Logo} alt="Ícone" />
              <h3>Sistema de Recompensas Ecológicas</h3>
              <p>
                Verificação de identidade e normas claras para uma comunidade
                respeitosa e confiável.
              </p>
            </div>

            <div className="feature-card">
              <img src={Logo} alt="Ícone" />
              <h3>Interface Intuitiva e Acessível</h3>
              <p>
                Verificação de identidade e normas claras para uma comunidade
                respeitosa e confiável.
              </p>
            </div>
          </div>
        </section>

        <section className="steps-section">
          <div className="steps-beg">
            <h1>Como Funciona a Plataforma de Mobilidade Sustentável?</h1>
          </div>
          <p className="steps-description">
            A Eco Move conecta tecnologia, sustentabilidade e mobilidade urbana
            em um só lugar. De forma simples e intuitiva, ela ajuda as pessoas a
            se locomoverem pela cidade de forma mais eficiente, econômica e
            amiga do meio ambiente.
          </p>

          <div className="steps-cards">
            <div className="step-card">
              <h4>1. Acesse a Plataforma</h4>
            </div>
            <div className="step-card">2. Escolha seu Roteiro Sustentável</div>
            <div className="step-card">3. Encontre ou Ofereça uma Carona</div>
            <div className="step-card">
              4. Localize Estações de Recarga Elétrica
            </div>
            <div className="step-card">5. Acompanhe seu Impacto Ambiental</div>
            <div className="step-card">6. Ganhe Recompensas Verdes</div>
          </div>

          <div className="extra-info"></div>
        </section>

        <section className="cta-section">
          <h2>Pronto para compartilhar o seu caminho?</h2>
          <p>
            Junte-se à Eco Move e faça parte de uma comunidade que economiza
            recursos e conecta pessoas.
          </p>
          <div className="cta-button">
            <Link to="/loginForm">Cadastre-se Agora</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
