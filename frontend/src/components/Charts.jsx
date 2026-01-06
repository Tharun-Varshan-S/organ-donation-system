import React from 'react'
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

// Organ Demand Bar Chart
const OrgDemandBar = () => {
  const data = [
    { organ: 'Heart', demand: 120 },
    { organ: 'Kidney', demand: 210 },
    { organ: 'Liver', demand: 180 },
    { organ: 'Lung', demand: 95 },
    { organ: 'Pancreas', demand: 65 },
    { organ: 'Cornea', demand: 145 }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="organ" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} />
        <Bar dataKey="demand" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Hospital Performance Pie Chart
const HospitalPie = () => {
  const data = [
    { name: 'Active', value: 45 },
    { name: 'Pending', value: 25 },
    { name: 'Suspended', value: 12 },
    { name: 'Inactive', value: 18 }
  ]
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#94a3b8']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Monthly Transplants Line Chart
const MonthlyLine = () => {
  const data = [
    { month: 'Jan', transplants: 24 },
    { month: 'Feb', transplants: 13 },
    { month: 'Mar', transplants: 28 },
    { month: 'Apr', transplants: 39 },
    { month: 'May', transplants: 35 },
    { month: 'Jun', transplants: 42 }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} />
        <Legend />
        <Line type="monotone" dataKey="transplants" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export { OrgDemandBar, HospitalPie, MonthlyLine }
