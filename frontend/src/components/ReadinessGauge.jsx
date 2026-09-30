import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const ReadinessGauge = ({ readiness, showBreakdown = true }) => {
  if (!readiness) {
    return (
      <div className="glass-card rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <Clock className="w-5 h-5 animate-spin text-brand-400" />
          <span>Calculating AI Readiness Score...</span>
        </div>
      </div>
    );
  }

  const {
    total_score = 0,
    status_tier = 'Critical Risk',
    accommodation_score = 0,
    logistics_score = 0,
    essentials_score = 0,
    timeline_risk_score = 0,
    days_until_move_in = 0,
    summary_headline = '',
  } = readiness;

  // SVG Gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (total_score / 100) * circumference;

  // Visual Theme mapping based on tier
  let theme = {
    color: '#f43f5e', // rose
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: AlertOctagon,
  };

  if (total_score >= 80) {
    theme = {
      color: '#10b981', // emerald
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
    };
  } else if (total_score >= 50) {
    theme = {
      color: '#f59e0b', // amber
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
    };
  }

  const TierIcon = theme.icon;

  // If showBreakdown is false, render clean, focused readiness score card
  if (!showBreakdown) {
    return (
      <div className={`glass-card rounded-3xl p-6 sm:p-8 border ${theme.borderColor} relative overflow-hidden transition-all duration-500`}>
        {/* Ambient glow */}
        <div
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ backgroundColor: theme.color }}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Gauge & Readout */}
          <div className="flex items-center gap-6">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke={theme.color}
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                  {total_score}
                  <span className="text-xl text-slate-400 font-medium">%</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  Readiness
                </span>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${theme.badgeBg}`}>
                  <TierIcon className="w-3.5 h-3.5" />
                  <span>{status_tier}</span>
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                  <Clock className="w-3 h-3 text-brand-400" />
                  <span>{days_until_move_in} days until move-in</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Readiness Status</span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-white max-w-xl leading-snug">
                {summary_headline}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Breakdown view
  return (
    <div className="space-y-4">
      <div className="space-y-3.5 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>4-Pillar Score Composition</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {total_score} / 100 Total Points
          </span>
        </div>

        {/* Pillar 1: Accommodation */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Verified Accommodation
            </span>
            <span className="font-bold text-white">
              {accommodation_score} <span className="text-slate-400 font-normal">/ 35 pts</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${(accommodation_score / 35) * 100}%` }}
            />
          </div>
        </div>

        {/* Pillar 2: Logistics */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Inter-City Luggage Freight
            </span>
            <span className="font-bold text-white">
              {logistics_score} <span className="text-slate-400 font-normal">/ 25 pts</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${(logistics_score / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Pillar 3: Move-In Essentials */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Move-In Dorm Essentials
            </span>
            <span className="font-bold text-white">
              {essentials_score} <span className="text-slate-400 font-normal">/ 20 pts</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${(essentials_score / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Pillar 4: Timeline Risk Buffer */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Timeline & Proximity Buffer
            </span>
            <span className="font-bold text-white">
              {timeline_risk_score} <span className="text-slate-400 font-normal">/ 20 pts</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${(timeline_risk_score / 20) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessGauge;
