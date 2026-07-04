import React, { useState, useMemo } from 'react';
import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './css/FinancePage.module.css';

const MOCK_DATA_WEEK = [
  { name: 'Seg', in: 1200, out: 400 },
  { name: 'Ter', in: 950, out: 300 },
  { name: 'Qua', in: 1400, out: 800 },
  { name: 'Qui', in: 1100, out: 500 },
  { name: 'Sex', in: 2500, out: 1200 },
  { name: 'Sáb', in: 3200, out: 1500 },
  { name: 'Dom', in: 2800, out: 900 },
];

const MOCK_DATA_MONTH = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}`,
  in: Math.floor(Math.random() * 2000) + 500,
  out: Math.floor(Math.random() * 1000) + 200,
}));

const MOCK_TRANSACTIONS = [
  { id: 1, title: 'Venda Mesa 04', date: 'Hoje, 14:30', amount: 153.00, type: 'in' },
  { id: 2, title: 'Compra de Ingredientes', date: 'Hoje, 10:15', amount: 450.00, type: 'out' },
  { id: 3, title: 'Venda Delivery iFood', date: 'Ontem, 21:00', amount: 89.90, type: 'in' },
  { id: 4, title: 'Venda Balcão', date: 'Ontem, 19:45', amount: 45.00, type: 'in' },
  { id: 5, title: 'Pagamento de Funcionário', date: '25/05/2026', amount: 1200.00, type: 'out' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const inValue = payload[0].value;
    const outValue = payload[1]?.value || 0;
    
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <div className={styles.tooltipItem} style={{ color: '#4cd964' }}>
          <div className={styles.tooltipColor} style={{ backgroundColor: '#4cd964' }}></div>
          <span>Entradas: R$ {inValue.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className={styles.tooltipItem} style={{ color: '#ff3b30' }}>
          <div className={styles.tooltipColor} style={{ backgroundColor: '#ff3b30' }}></div>
          <span>Saídas: R$ {outValue.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>
    );
  }
  return null;
};

const FinancePage: React.FC = () => {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const currentData = range === 'week' ? MOCK_DATA_WEEK : MOCK_DATA_MONTH;

  const { totalIn, totalOut, profit } = useMemo(() => {
    let tIn = 0, tOut = 0;
    currentData.forEach(d => {
      tIn += d.in;
      tOut += d.out;
    });
    return { totalIn: tIn, totalOut: tOut, profit: tIn - tOut };
  }, [currentData]);

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const handleBarHover = (_data: any, index: number) => {
    setActiveIndex(index);
  };

  const handleBarLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <h1>Financeiro</h1>
          <div className={styles.headerIcons}>
            <Bell className={styles.headerIcon} />
            <Link to="/settings" style={{ color: 'inherit', display: 'flex' }}>
              <Settings className={styles.headerIcon} />
            </Link>
          </div>
        </header>
        
        <div className={styles.content}>
          <div className={styles.rangeSelectorContainer}>
            <span className={styles.pageTitle}>Visão Geral</span>
            <div className={styles.segmentedControl}>
              <button 
                className={`${styles.segmentBtn} ${range === 'week' ? styles.activeSegment : ''}`}
                onClick={() => setRange('week')}
              >
                Última Semana
              </button>
              <button 
                className={`${styles.segmentBtn} ${range === 'month' ? styles.activeSegment : ''}`}
                onClick={() => setRange('month')}
              >
                Último Mês
              </button>
            </div>
          </div>

          <div className={styles.dashboardTop}>
            {/* Recharts Container */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <span className={styles.chartTitle}>Entradas vs Saídas</span>
              </div>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentData}
                    margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
                    onMouseMove={(state: any) => {
                      if (state.activeTooltipIndex !== undefined) {
                        setActiveIndex(state.activeTooltipIndex);
                      }
                    }}
                    onMouseLeave={handleBarLeave}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#8e8e93" 
                      tick={{ fill: '#8e8e93', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#8e8e93" 
                      tick={{ fill: '#8e8e93', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                    />
                    <Bar 
                      dataKey="in" 
                      radius={[4, 4, 0, 0]} 
                      barSize={range === 'week' ? 32 : 12}
                    >
                      {currentData.map((entry, index) => (
                        <Cell 
                          key={`cell-in-${index}`} 
                          fill={activeIndex === null || activeIndex === index ? '#4cd964' : 'rgba(76, 217, 100, 0.3)'} 
                          style={{ transition: 'fill 0.2s' }}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="out" 
                      radius={[4, 4, 0, 0]} 
                      barSize={range === 'week' ? 32 : 12}
                    >
                      {currentData.map((entry, index) => (
                        <Cell 
                          key={`cell-out-${index}`} 
                          fill={activeIndex === null || activeIndex === index ? '#ff3b30' : 'rgba(255, 59, 48, 0.3)'} 
                          style={{ transition: 'fill 0.2s' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit Card */}
            <div className={styles.profitCard}>
              <div className={styles.profitTitle}>Resumo do Período</div>
              
              <div>
                <div className={styles.profitStat}>
                  <div className={styles.statLabel}>Entradas</div>
                  <div className={`${styles.statValue} ${styles.green}`}>
                    {formatCurrency(totalIn)}
                  </div>
                </div>
                
                <div className={styles.profitStat}>
                  <div className={styles.statLabel}>Saídas</div>
                  <div className={`${styles.statValue} ${styles.red}`}>
                    {formatCurrency(totalOut)}
                  </div>
                </div>

                <div className={styles.profitTotal}>
                  <div className={styles.statLabel}>Lucro Líquido</div>
                  <div className={`${styles.statValue} ${profit >= 0 ? styles.green : styles.red}`}>
                    {formatCurrency(profit)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className={styles.transactionsSection}>
            <div className={styles.sectionTitle}>Entradas e Saídas Recentes</div>
            <div className={styles.transactionList}>
              {MOCK_TRANSACTIONS.map(tx => (
                <div key={tx.id} className={styles.transactionItem}>
                  <div className={styles.transactionLeft}>
                    <span className={styles.transactionName}>{tx.title}</span>
                    <span className={styles.transactionDate}>{tx.date}</span>
                  </div>
                  <div className={`${styles.transactionAmount} ${tx.type === 'in' ? styles.amountIn : styles.amountOut}`}>
                    {tx.type === 'in' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default FinancePage;
