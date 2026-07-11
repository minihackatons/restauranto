import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from '../../pages/css/FinancePage.module.css';
import type { Transaction } from './RecentTransactionsList';

interface FinanceChartProps {
  data: Transaction[];
  range: 'week' | 'month';
  formatCurrency: (val: number) => string;
}

const ChartTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const inValue = Number(payload[0]?.value) || 0;
    const outValue = Number(payload[1]?.value) || 0;
    
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <div className={styles.tooltipItem} style={{ color: '#4cd964' }}>
          <div className={styles.tooltipColor} style={{ backgroundColor: '#4cd964' }}></div>
          <span>Receitas (Vendas): {formatCurrency(inValue)}</span>
        </div>
        <div className={styles.tooltipItem} style={{ color: '#ff3b30' }}>
          <div className={styles.tooltipColor} style={{ backgroundColor: '#ff3b30' }}></div>
          <span>Despesas (Custos): {formatCurrency(outValue)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const FinanceChart = ({ data, range, formatCurrency }: FinanceChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const groupedData: Record<string, { name: string; in: number; out: number }> = {};

    for (const transaction of data) {
      const date = new Date(transaction.createdAt);
      
      const options: Intl.DateTimeFormatOptions = range === 'week' 
        ? { weekday: 'short' } 
        : { day: '2-digit', month: '2-digit' };
        
      let formattedDate = date.toLocaleDateString('pt-BR', options).replace('.', '');
      formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      if (!groupedData[formattedDate]) {
        groupedData[formattedDate] = { 
          name: formattedDate, 
          in: 0, 
          out: 0 
        };
      }

      const value = Number(transaction.value) || 0;
      
      if (transaction.type === 'INCOME') {
        groupedData[formattedDate].in += value;
      } else if (transaction.type === 'EXPENSE') {
        groupedData[formattedDate].out += value;
      }
    }

    return Object.values(groupedData);
  }, [data, range]);

  const handleBarLeave = () => setActiveIndex(null);

  if (!chartData || chartData.length === 0) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <span className={styles.chartTitle}>Visão de Receitas vs Despesas</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320, color: '#8e8e93' }}>
          Nenhum dado financeiro encontrado para este período.
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>Visão de Receitas vs Despesas</span>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
            onMouseMove={(state: any) => {
              if (state?.activeTooltipIndex !== undefined) {
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
            <Tooltip content={<ChartTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            <Bar dataKey="in" radius={[4, 4, 0, 0]} barSize={range === 'week' ? 32 : 12}>
              {data.map((_, index) => (
                <Cell 
                  key={`cell-in-${index}`} 
                  fill={activeIndex === null || activeIndex === index ? '#4cd964' : 'rgba(76, 217, 100, 0.3)'} 
                  style={{ transition: 'fill 0.2s' }}
                />
              ))}
            </Bar>
            <Bar dataKey="out" radius={[4, 4, 0, 0]} barSize={range === 'week' ? 32 : 12}>
              {data.map((_, index) => (
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
  );
};
