import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, XCircle, ChevronRight, Lock, Activity } from 'lucide-react';

// --- Visual & Motion Constants ---
const HOVER_LIFT = { y: -4, transition: { duration: 0.2, ease: "easeOut" } };
const FADE_IN = { opacity: 0, y: 10 };
const FADE_IN_VISIBLE = { opacity: 1, y: 0, transition: { duration: 0.3 } };

// --- Atomic Components ---

export const GlassCard = ({ children, className = '', hoverEffect = false, urgency = 'normal' }) => {
    const urgencyClass = {
        normal: 'border-white/40',
        warning: 'border-amber-400/30 bg-amber-50/10',
        critical: 'border-red-500/30 bg-red-50/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
    }[urgency] || 'border-white/40';

    return (
        <motion.div
            className={`relative overflow-hidden backdrop-blur-xl bg-white/70 border ${urgencyClass} shadow-sm rounded-2xl p-6 ${className}`}
            whileHover={hoverEffect ? HOVER_LIFT : {}}
            initial={FADE_IN}
            animate={FADE_IN_VISIBLE}
        >
            {/* Subtle Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}
            />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};

export const KPICard = ({ title, value, subtext, icon: Icon, trend, urgency = 'normal' }) => {
    const colors = {
        normal: 'text-blue-600 bg-blue-50',
        warning: 'text-amber-600 bg-amber-50',
        critical: 'text-red-600 bg-red-50'
    };

    return (
        <GlassCard hoverEffect urgency={urgency}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colors[urgency]} bg-opacity-80`}>
                    <Icon size={24} />
                </div>
                {urgency === 'critical' && (
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
            {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </GlassCard>
    );
};

export const EmergencyBanner = ({ message, count, onClick }) => (
    <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="sticky top-4 z-50 mb-8 mx-auto w-full"
    >
        <div className="relative group cursor-pointer" onClick={onClick}>
            {/* Pulsing Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

            <div className="relative bg-slate-900 border-l-8 border-red-500 rounded-3xl p-5 flex items-center justify-between shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-6">
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                        <div className="relative p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-500/50">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h4 className="text-sm font-black text-red-500 uppercase tracking-[0.2em]">Priority Alpha Alert</h4>
                            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">Critical SLA</span>
                        </div>
                        <p className="text-xl font-black text-white mt-1 tracking-tight">
                            {message} <span className="text-slate-500 ml-2 font-medium">({count} Total Pending)</span>
                        </p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Status</p>
                        <p className="text-sm font-black text-white uppercase italic">Mission Control Active</p>
                    </div>
                    <div className="h-10 w-px bg-slate-800"></div>
                    <button
                        className="px-8 py-3 bg-red-600 hover:bg-white hover:text-red-600 text-white font-black uppercase tracking-[0.1em] text-xs rounded-2xl shadow-xl transition-all active:scale-95 group-hover:shadow-red-500/20"
                    >
                        Initiate Match
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);

export const SLAMeter = ({ value, max = 100, label }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    let color = 'bg-emerald-500';
    if (percentage < 30) color = 'bg-red-500';
    else if (percentage < 60) color = 'bg-amber-500';

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>{label}</span>
                <span>{value}/{max}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

export const StatusBadge = ({ status, className = '' }) => {
    const styles = {
        active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        matched: 'bg-blue-100 text-blue-800 border-blue-200',
        emergency: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        completed: 'bg-slate-100 text-slate-800 border-slate-200',
        deceased: 'bg-gray-100 text-gray-500 border-gray-200',
    };

    const currentStyle = styles[status?.toLowerCase()] || styles.pending;

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStyle} ${className}`}>
            {status?.toUpperCase()}
        </span>
    );
};

export const TimelineItem = ({ date, title, description, status, isLast }) => (
    <div className="relative pl-8 pb-8">
        {!isLast && <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200" />}
        <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 flex items-center justify-center bg-white 
      ${status === 'completed' ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300'}`}>
            {status === 'completed' ? <CheckCircle2 size={14} /> : <div className="h-2 w-2 rounded-full bg-slate-300" />}
        </div>

        <div>
            <span className="text-xs text-slate-400 font-medium font-mono">{date}</span>
            <h4 className="text-sm font-bold text-slate-700">{title}</h4>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
    </div>
);

export const StepTracker = ({ steps, currentStep }) => (
    <div className="flex items-center w-full my-6">
        {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
                <React.Fragment key={step}>
                    <div className="relative flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 font-bold text-sm transition-colors duration-300
              ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                                isCurrent ? 'bg-white border-blue-500 text-blue-500' :
                                    'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                        </div>
                        <div className={`absolute top-10 whitespace-nowrap text-xs font-semibold 
              ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                            {step}
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300
              ${index < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);
