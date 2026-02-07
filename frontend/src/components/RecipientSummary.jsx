import React, { useState, useEffect } from 'react';
import { Users, Heart, Calendar, Activity, TrendingUp, Filter } from 'lucide-react';
import apiService from '../services/api';

const RecipientSummary = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await apiService.getRecipientSummary(year);
                if (res.success) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch recipient summary", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [year]);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="section-title">Annual Recipient Impact</h2>

            {/* Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Filter size={18} />
                    <span>Filter Statistics</span>
                </div>
                <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="pl-9 pr-8 py-2 bg-slate-50 border-none rounded-lg text-slate-700 font-bold focus:ring-2 focus:ring-[#00d2ff] outline-none cursor-pointer appearance-none"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="content-card flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d2ff]"></div>
                </div>
            ) : error ? (
                <div className="content-card py-12 text-center">
                    <p className="text-red-500 font-medium">{error}</p>
                </div>
            ) : (
                <>
                    {/* Hero Stats Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="content-card bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] text-white border-none col-span-1 md:col-span-3 lg:col-span-1 relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                                <Users size={200} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-white/80 font-medium mb-1 flex items-center gap-2">
                                    <TrendingUp size={16} /> Total Recipients
                                </p>
                                <h3 className="text-5xl font-bold mb-2">{stats.total}</h3>
                                <p className="text-xs text-white/70">Lives transformed in {year}</p>
                            </div>
                        </div>

                        {/* Organ Breakdown */}
                        <div className="content-card md:col-span-2 lg:col-span-2">
                            <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-[#00d2ff]" /> Organ Breakdown
                            </h3>

                            {Object.keys(stats.byOrgan).length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Object.entries(stats.byOrgan).map(([organ, count]) => (
                                        <div key={organ} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-[#3a7bd5]">
                                                <Heart size={20} className={organ === 'heart' ? 'fill-current' : ''} />
                                            </div>
                                            <span className="text-2xl font-bold text-[#1e293b]">{count}</span>
                                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">{organ}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    No organ specific data available for this year.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Monthly Trends (Optional Visualization) */}
                    <div className="content-card">
                        <h3 className="text-lg font-bold text-[#1e293b] mb-6 flex items-center gap-2">
                            <Calendar size={18} className="text-[#00d2ff]" /> Monthly Overview
                        </h3>
                        <div className="w-full overflow-x-auto">
                            <div className="flex items-end gap-2 h-40 min-w-[600px] px-2 pb-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => {
                                    const count = stats.byMonth[month] || 0;
                                    const max = Math.max(...Object.values(stats.byMonth), 1);
                                    const heightPercentage = Math.max((count / max) * 100, 5); // min 5% height
                                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                                    return (
                                        <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="w-full bg-slate-100 rounded-t-lg relative flex items-end justify-center group-hover:bg-[#00d2ff]/10 transition-colors" style={{ height: '100%' }}>
                                                <div
                                                    className="w-4/5 bg-[#3a7bd5] rounded-t-sm transition-all duration-500 group-hover:bg-[#00d2ff]"
                                                    style={{ height: `${heightPercentage}%` }}
                                                ></div>
                                                {count > 0 && (
                                                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {count}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">{monthNames[month - 1]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecipientSummary;
