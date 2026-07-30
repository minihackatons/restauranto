import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MessageCircle, 
  FileX2, 
  Table2, 
  PackageX, 
  Link as LinkIcon, 
  Clock4, 
  User, 
  BookOpen, 
  ShoppingBag, 
  DollarSign, 
  Box, 
  BarChart2, 
  CheckCircle2, 
  ListOrdered, 
  Book, 
  Link2, 
  Wallet, 
  Package, 
  PieChart, 
  XCircle 
} from "lucide-react";
import './css/LandingPage.css';

const LandingPage: React.FC = () => {
  useEffect(() => {
    // Scroll Animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((elem) => {
      observer.observe(elem);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container nav-container">
          <div className="logo">
            <img src="/assets/Logo.svg" alt="Restauranto Logo" style={{ height: "32px" }} />
          </div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link 
              to="/login" 
              style={{ fontWeight: 500, transition: "color 0.3s" }} 
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary)")} 
              onMouseOut={(e) => (e.currentTarget.style.color = "inherit")}
            >
              Entrar
            </Link>
            <Link to="/register" className="btn btn-primary">Começar agora</Link>
          </div>
        </div>
      </header>

      {/* 1. Hero */}
      <section className="hero" id="hero">
        <div className="landing-container">
          <h1 className="text-gradient">Menos tempo organizando.<br />Mais tempo vendendo.</h1>
          <p>Automatize as tarefas do dia a dia do seu negócio e concentre seu tempo naquilo que realmente importa: atender seus clientes e produzir.</p>
          
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Começar agora <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary">Ver demonstração</Link>
          </div>

          <div className="hero-image-wrapper animate-on-scroll">
            <div className="glow"></div>
            {/* Mockup of Dashboard + Cellphone */}
            <img src="/assets/app_preview.png" alt="Interface do Restauranto mostrando painel financeiro e cardápio digital" />
          </div>
        </div>
      </section>

      {/* 6. Feito para pequenos negócios (Nicho) */}
      <section id="nicho" className="nicho-section">
        <div className="landing-container">
          <h2 className="section-title">Feito para quem vende comida todos os dias.</h2>
          
          <div className="niche-container animate-on-scroll">
            <div className="niche-badge">🍰 Confeitarias</div>
            <div className="niche-badge">🍔 Hamburguerias</div>
            <div className="niche-badge">🥪 Lanchonetes</div>
            <div className="niche-badge">☕ Cafeterias</div>
            <div className="niche-badge">🍕 Pizzarias</div>
            <div className="niche-badge">🥗 Marmitas</div>
            <div className="niche-badge">🚚 Food Trucks</div>
            <div className="niche-badge">🏠 Produção em casa</div>
          </div>
        </div>
      </section>

      {/* 2. O Problema */}
      <section id="problema">
        <div className="landing-container">
          <h2 className="section-title">Seu negócio cresceu. A bagunça também.</h2>
          <p className="section-subtitle">O cenário comum de quem tenta gerenciar tudo sozinho.</p>

          <div className="grid-cards">
            <div className="glass-card problem-card animate-on-scroll">
              <div className="problem-icon"><MessageCircle /></div>
              <div>
                <h3>Pedidos espalhados no WhatsApp</h3>
                <p>Mensagens perdidas, áudios longos e confusão nos detalhes.</p>
              </div>
            </div>
            
            <div className="glass-card problem-card animate-on-scroll">
              <div className="problem-icon"><FileX2 /></div>
              <div>
                <h3>Cardápio desatualizado</h3>
                <p>PDFs antigos circulando com preços que já mudaram.</p>
              </div>
            </div>

            <div className="glass-card problem-card animate-on-scroll">
              <div className="problem-icon"><Table2 /></div>
              <div>
                <h3>Financeiro em planilhas</h3>
                <p>Horas perdidas digitando valores e conferindo comprovantes.</p>
              </div>
            </div>

            <div className="glass-card problem-card animate-on-scroll">
              <div className="problem-icon"><PackageX /></div>
              <div>
                <h3>Estoque no caderno</h3>
                <p>Surpresas desagradáveis no meio da produção por falta de ingredientes.</p>
              </div>
            </div>

            <div className="glass-card problem-card animate-on-scroll">
              <div className="problem-icon"><LinkIcon /></div>
              <div>
                <h3>Links espalhados</h3>
                <p>Ifood, WhatsApp, Instagram... o cliente não sabe onde clicar.</p>
              </div>
            </div>

            <div className="glass-card problem-card animate-on-scroll">
              <div className="problem-icon"><Clock4 /></div>
              <div>
                <h3>Muito tempo organizando</h3>
                <p>O tempo que deveria ser gasto inovando, gasto na burocracia.</p>
              </div>
            </div>
          </div>

          <div className="conclusion-box animate-on-scroll">
            <h3>Você abriu um negócio para vender, não para passar horas administrando.</h3>
          </div>
        </div>
      </section>

      {/* 3. A Solução (Fluxo) */}
      <section id="solucao" className="solucao-section">
        <div className="landing-container">
          <h2 className="section-title">O Restauranto organiza tudo em um só lugar.</h2>
          <p className="section-subtitle">Tudo acontece automaticamente, do primeiro clique ao fechamento do caixa.</p>

          <div className="flow-container animate-on-scroll">
            <div className="flow-line"></div>
            
            <div className="flow-step">
              <div className="flow-icon"><User /></div>
              <span>Cliente</span>
            </div>
            
            <div className="flow-step">
              <div className="flow-icon"><BookOpen /></div>
              <span>Cardápio Digital</span>
            </div>

            <div className="flow-step">
              <div className="flow-icon"><ShoppingBag /></div>
              <span>Pedido</span>
            </div>

            <div className="flow-step">
              <div className="flow-icon"><DollarSign /></div>
              <span>Financeiro</span>
            </div>

            <div className="flow-step">
              <div className="flow-icon"><Box /></div>
              <span>Estoque</span>
            </div>

            <div className="flow-step">
              <div className="flow-icon"><BarChart2 /></div>
              <span>Relatórios</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Enquanto você trabalha */}
      <section id="enquanto-trabalha">
        <div className="landing-container">
          <h2 className="section-title">Enquanto você prepara os pedidos...</h2>
          <p className="section-subtitle">O sistema trabalha como seu gerente invisível.</p>

          <div className="sync-grid">
            <div className="glass-card sync-card animate-on-scroll">
              <div className="sync-icon"><CheckCircle2 /></div>
              <h3>O cliente consulta o cardápio sozinho</h3>
            </div>
            <div className="glass-card sync-card animate-on-scroll">
              <div className="sync-icon"><CheckCircle2 /></div>
              <h3>Os links ficam todos organizados</h3>
            </div>
            <div className="glass-card sync-card animate-on-scroll">
              <div className="sync-icon"><CheckCircle2 /></div>
              <h3>Os pedidos ficam registrados no sistema</h3>
            </div>
            <div className="glass-card sync-card animate-on-scroll">
              <div className="sync-icon"><CheckCircle2 /></div>
              <h3>O estoque é atualizado em tempo real</h3>
            </div>
            <div className="glass-card sync-card animate-on-scroll">
              <div className="sync-icon"><CheckCircle2 /></div>
              <h3>O financeiro acompanha cada venda</h3>
            </div>
            <div className="glass-card sync-card animate-on-scroll">
              <div className="sync-icon"><CheckCircle2 /></div>
              <h3>Você visualiza tudo em um painel claro</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Funcionalidades (Bento) */}
      <section id="features" className="features-section">
        <div className="landing-container">
          <h2 className="section-title">Tudo o que seu negócio precisa</h2>
          <p className="section-subtitle">Cada recurso foi desenhado para resolver uma dor real do seu dia a dia.</p>

          <div className="bento-grid">
            <div className="glass-card bento-item large animate-on-scroll">
              <div className="bento-header">
                <ListOrdered className="bento-icon" size={32} />
                <h3 className="bento-title">Pedidos</h3>
                <p className="bento-desc">Pare de se perder no WhatsApp. Organize pedidos do início ao fim em um painel visual e intuitivo.</p>
              </div>
            </div>

            <div className="glass-card bento-item animate-on-scroll">
              <div className="bento-header">
                <Book className="bento-icon" size={32} />
                <h3 className="bento-title">Cardápio Digital</h3>
                <p className="bento-desc">Pare de enviar PDFs desatualizados. Atualize preços e itens em segundos.</p>
              </div>
            </div>

            <div className="glass-card bento-item animate-on-scroll">
              <div className="bento-header">
                <Link2 className="bento-icon" size={32} />
                <h3 className="bento-title">Link na Bio</h3>
                <p className="bento-desc">Compartilhe tudo com um único link. Reúna todos os seus canais facilmente.</p>
              </div>
            </div>

            <div className="glass-card bento-item animate-on-scroll">
              <div className="bento-header">
                <Wallet className="bento-icon" size={32} />
                <h3 className="bento-title">Financeiro</h3>
                <p className="bento-desc">Saiba quanto você vendeu hoje. Veja exatamente quanto entrou e saiu.</p>
              </div>
            </div>

            <div className="glass-card bento-item animate-on-scroll">
              <div className="bento-header">
                <Package className="bento-icon" size={32} />
                <h3 className="bento-title">Estoque</h3>
                <p className="bento-desc">Descubra antes quando um ingrediente está acabando. Evite surpresas ruins.</p>
              </div>
            </div>
          </div>

          <div className="glass-card bento-item animate-on-scroll" style={{ marginTop: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PieChart className="bento-icon" size={32} />
            <h3 className="bento-title">Analytics</h3>
            <p className="bento-desc" style={{ maxWidth: "600px" }}>Veja de onde vêm seus clientes. Descubra quais canais realmente trazem retorno para o seu negócio.</p>
          </div>
        </div>
      </section>

      {/* 7. Crescimento (Consequência) */}
      <section id="crescimento" className="crescimento-section">
        <div className="landing-container">
          <h2 className="section-title">Cresça sem aumentar a bagunça</h2>
          <p className="section-subtitle">O que acontece quando chegam mais pedidos no seu negócio hoje?</p>

          <div className="comparison-container">
            {/* Sem Restauranto */}
            <div className="comp-box bad glass-card animate-on-scroll">
              <h3>No cenário antigo...</h3>
              <ul className="comp-list">
                <li><XCircle /> mais mensagens acumuladas</li>
                <li><XCircle /> mais contas para calcular à mão</li>
                <li><XCircle /> mais descontrole de estoque</li>
                <li><XCircle /> mais tempo gasto organizando</li>
              </ul>
            </div>

            {/* Com Restauranto */}
            <div className="comp-box good glass-card animate-on-scroll">
              <h3 className="text-primary">Com o Restauranto...</h3>
              <ul className="comp-list">
                <li><CheckCircle2 /> tudo continua organizado.</li>
                <li><CheckCircle2 /> clientes pedem sozinhos.</li>
                <li><CheckCircle2 /> métricas prontas no painel.</li>
                <li><CheckCircle2 /> você foca só em crescer mais.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Chamada Final */}
      <section className="cta-section animate-on-scroll">
        <div className="landing-container">
          <h2 className="text-gradient">Seu negócio merece mais tempo para crescer.</h2>
          <p>Automatize as tarefas do dia a dia e foque no que você faz de melhor.</p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: "1.25rem", padding: "1rem 3rem" }}>Criar minha conta</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <p>&copy; 2026 Restauranto. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
