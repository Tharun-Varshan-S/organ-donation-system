import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, XCircle, ChevronRight, Lock, Activity } from 'lucide-react';

// --- Visual & Motion Constants ---
const HOVER_LIFT = { y: -4, transition: { duration: 0.2, ease: "easeOut" } };
const FADE_IN = { opacity: 0, y: 10 };
const FADE_IN_VISIBLE = { opacity: 1, y: 0, transition: { duration: 0.3 } };

// --- Atomic Components ---

export const GlassCard = ({ children, className = '', hoverEffect = false, urgency = 'normal', onClick }) => {
    const urgencyClass = {
        normal: 'border-white/40',
        warning: 'border-amber-400/30 bg-amber-50/10',
        critical: 'border-red-500/30 bg-red-50/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
    }[urgency] || 'border-white/40';

    return (
        <motion.div
            className={`relative overflow-hidden backdrop-blur-xl bg-white/70 border ${urgencyClass} shadow-sm rounded-2xl p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}
            whileHover={hoverEffect ? HOVER_LIFT : {}}
            initial={FADE_IN}
            animate={FADE_IN_VISIBLE}
            onClick={onClick}
        >
            {/* Subtle Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}
            />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};

export const SLAMeter = ({ value, max = 100, label }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    let color = 'bg-emerald-500';
    if (percentage < 30) color = 'bg-red-500';
    else if (percentage < 60) color = 'bg-amber-500';

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>{label}</span>
                <span>{Math.round(value)}/{max}h</span>
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
