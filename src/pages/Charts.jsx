import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export const OrgDemandBar = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
    </ResponsiveContainer>
);

export const HospitalPie = ({ data }) => (
    <ResponsiveContainer width="100%" height={100}>
        <PieChart>
            <Pie
                data={data}
                innerRadius={30}
                outerRadius={40}
                paddingAngle={5}
                dataKey="value"
            >
                <Cell fill="#3b82f6" />
                <Cell fill="#e2e8f0" />
            </Pie>
        </PieChart>
    </ResponsiveContainer>
);

export const MonthlyLine = ({ data }) => (
    <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
        </LineChart>
    </ResponsiveContainer>
);
