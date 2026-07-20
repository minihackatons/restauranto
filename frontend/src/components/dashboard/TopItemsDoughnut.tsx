import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './css/TopItemsDoughnut.module.css';

interface TopItem {
  name: string;
  count: number;
}

interface TopItemsDoughnutProps {
  data: TopItem[];
}

const COLORS = ['#6366f1', '#4cd964', '#ffcc00', '#ff3b30', '#8e8e93'];

export const TopItemsDoughnut: React.FC<TopItemsDoughnutProps> = ({ data }) => {
  const hasData = data && data.length > 0;

  return (
    <div className={styles.doughnutContainer}>
      <h3 className={styles.title}>Itens Mais Vendidos</h3>
      {hasData ? (
        <>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  stroke="none"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.legend}>
            {data.map((item, index) => (
              <div key={item.name} className={styles.legendItem}>
                <span className={styles.dot} style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.count}>{item.count}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: '#8e8e93', fontSize: '0.9rem' }}>
          Nenhum dado encontrado.
        </div>
      )}
    </div>
  );
};
