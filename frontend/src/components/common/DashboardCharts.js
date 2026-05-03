import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardCharts = ({ items = [], alerts = [] }) => {
  // Prepare data for stock levels chart
  const stockData = items.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    stock: item.current_stock,
    minStock: item.min_stock_level,
  }));

  // Prepare data for category distribution pie chart
  const categoryData = items.reduce((acc, item) => {
    const category = item.category_id || 'غير مصنف';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
      {/* Stock Levels Bar Chart */}
      <div style={{ background: 'var(--color-card-background)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>مستويات المخزون</h3>
        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis stroke="var(--color-text-secondary)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-md)',
              }}
            />
            <Bar dataKey="stock" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="minStock" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution Pie Chart */}
      <div style={{ background: 'var(--color-card-background)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>توزيع الفئات</h3>
        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-md)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;