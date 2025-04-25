import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page" style={{ paddingTop: '110px' }}>
      <section className="hero">
        <h1>Compartilhe o caminho, conecte pessoas</h1>
        <img src="" alt="Imagem ilustrativa" />
        <p>
          A Eco Move é uma solução inteligente que conecta pessoas a meios de transporte sustentáveis, como bicicletas, caronas compartilhadas, veículos elétricos e rotas integradas com transporte público. Tudo isso com tecnologia e impacto positivo para o planeta.
        </p>
        <div className="hero-buttons">
          <Link to="/usuarios">
            <button>Cadastre-se Agora</button>
          </Link>
          <Link to="/como-funciona">
            <button>Como Funciona</button>
          </Link>
        </div>
      </section>

      <section className="funcionabilidades">
        <h1 className="listra">Principais Funcionalidades</h1>
        <p>
          Nossa plataforma foi desenvolvida para tornar o compartilhamento de caronas uma experiência simples, segura e agradável.
        </p>

        <div className="feature">
          <h2>🚗 Rotas Sustentáveis Inteligentes</h2>
          <p>Motoristas e passageiros se cadastram rapidamente, com validação de informações para garantir mais segurança.</p>
        </div>

        <div className="feature">
          <h2>🔌 Localização de Estações de Recarga</h2>
          <p>Visualize e publique viagens facilmente. Encontre opções com base na origem e destino.</p>
        </div>

        <div className="feature">
          <h2>🤝 Caronas Compartilhadas e Seguras</h2>
          <p>Conexão rápida entre usuários por meio de grupos regionais, organizando caronas em tempo real.</p>
        </div>

        <div className="feature">
          <h2>🌱 Monitoramento do Impacto Ambiental</h2>
          <p>Após cada viagem, motoristas e passageiros podem avaliar a experiência, aumentando a confiabilidade.</p>
        </div>

        <div className="feature">
          <h2>🏆 Sistema de Recompensas Ecológicas</h2>
          <p>Ganhe recompensas por usar meios de transporte sustentáveis.</p>
        </div>

        <div className="feature">
          <h2>📱 Interface Intuitiva e Acessível</h2>
          <p>Design pensado para todos, com fácil navegação e acessibilidade garantida.</p>
        </div>
      </section>

      <section className="comofunciona">
        
      </section>
    </div>
  );
}

export default Home;
