import React from 'react'
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

// Organ Demand Bar Chart
const OrgDemandBar = ({ data = [] }) => {
  // Map backend format if available
  const chartData = data.length > 0 ? data.map(item => ({
    organ: item._id,
    demand: item.count
  })) : [
    { organ: 'Heart', demand: 0 },
    { organ: 'Kidney', demand: 0 },
    { organ: 'Liver', demand: 0 }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="organ" stroke="#64748b" fontSize={11} tick={{ fill: '#64748b' }} />
        <YAxis stroke="#64748b" fontSize={11} tick={{ fill: '#64748b' }} />
        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
        <Bar dataKey="demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Hospital Status Distribution Pie Chart
const HospitalPie = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { name: 'Approved', value: 0 },
    { name: 'Pending', value: 0 },
    { name: 'Suspended', value: 0 }
  ]
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#94a3b8']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Monthly Transplants Line Chart
const MonthlyLine = ({ data = [] }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Create base data for all months
  const chartData = months.map((m, idx) => {
    const found = data.find(d => d._id === (idx + 1))
    return {
      month: m,
      transplants: found ? found.count : 0
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
        <YAxis stroke="#64748b" fontSize={11} />
        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
        <Line type="monotone" dataKey="transplants" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export { OrgDemandBar, HospitalPie, MonthlyLine }
