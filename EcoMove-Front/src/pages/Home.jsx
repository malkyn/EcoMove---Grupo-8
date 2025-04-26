import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <body>

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
        <h1 className="lista">Principais Funcionalidades</h1>
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
        <h1 className='lista'>Como Funciona a Plataforma de Mobilidade Sustentavel</h1>
        <p>A Eco Move conecta tecnologia, sustentabilidade e mobilidade urbana em um só lugar. De forma simples e intuitiva, ela ajuda as pessoas a se locomoverem pela cidade de forma mais eficiente, econômica e amiga do meio ambiente.</p>
        
        <div className="feature">
          <h2>1. Acesse a Plataforma</h2>
          <p>Você pode usar a versão web ou baixar o app no seu celular. Basta criar uma conta para começar a explorar.</p>
        </div>

        <div className="feature">
          <h2>2. Escolha seu Roteiro Sustentável</h2>
          <p>Informe seu destino e descubra as melhores rotas:</p>
          <br />
          <p> 🚲 Para bicicletas ciclovias, trechos planos e seguros </p>
          <br />
          <p>🚌 Para transporte público com horários em tempo real </p>
          <br />
          <p>🚶‍♀️ Para caminhadas rotas rápidas, seguras e sombreadas </p>
          <br />
          <p>🚗 Para veículos elétricos com paradas de recarga no caminho</p>
         </div>

          <div className="feature">
            <h2>3. Encontre ou Ofereça uma Carona</h2>
            <p>A plataforma conecta usuários com rotas semelhantes, permitindo que compartilhem caronas com segurança, reduzindo custos e emissões.</p>
          </div>

          <div className="feature">
            <h2>4. Localize Estações de Recarga Elétrica</h2>
            <p>Se você dirige um veículo elétrico, é possível visualizar os pontos de recarga próximos, ver sua disponibilidade em tempo real e até agendar um horário.</p>
          </div>

          <div className="feature">
            <h2>5. Acompanhe seu Impacto Ambiental</h2>
            <p>O sistema calcula automaticamente quanto CO₂ você economizou, quantos quilômetros sustentáveis percorreu e oferece um ranking ecológico com recompensas.</p>
          </div>

          <div className="feature">
            <h2>6. Ganhe Recompensas Verdes</h2>
            <p>Cada escolha sustentável vira ponto. Com eles, você pode resgatar descontos em produtos ecológicos, participar de sorteios ou ganhar brindes exclusivos.</p>
          </div>
       </section>

       <section className="compartilhar">
        <h1>Pronto para compartilhar o seu caminho?</h1>
        <p>Junte-se à Eco Move e faça parte de uma comunidade que economiza recursos e conecta pessoas. </p>
        <div className="hero-buttons">
          <Link to="/usuarios">
            <button>Cadastre-se Agora</button>
          </Link>
        </div>
       </section>
    </div>
      
    </body>
  );
}

export default Home;
