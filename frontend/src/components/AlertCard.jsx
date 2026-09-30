import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';

const AlertCard = ({ alert }) => {
  if (!alert) return null;

  const { title, message, severity, action_text, action_link } = alert;

  const config = {
    critical: {
      border: 'border-rose-500/40 bg-rose-950/30',
      iconColor: 'text-rose-400',
      titleColor: 'text-rose-200',
      btnBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20',
      icon: AlertOctagon,
      badge: 'Critical Risk',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    warning: {
      border: 'border-amber-500/40 bg-amber-950/30',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-200',
      btnBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20',
      icon: AlertTriangle,
      badge: 'Attention Needed',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    success: {
      border: 'border-emerald-500/40 bg-emerald-950/30',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-200',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20',
      icon: CheckCircle2,
      badge: 'Relocation Green',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    info: {
      border: 'border-blue-500/40 bg-blue-950/30',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-200',
      btnBg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
      icon: Info,
      badge: 'Action Suggested',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
  }[severity || 'info'];

  const Icon = config.icon;

  return (
    <div className={`rounded-xl p-4 sm:p-5 border backdrop-blur-md transition-all ${config.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
              {config.badge}
            </span>
            <h4 className={`text-sm font-bold ${config.titleColor}`}>
              {title}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {message}
          </p>
        </div>
      </div>

      {action_text && action_link && (
        <div className="shrink-0 sm:self-center">
          <Link
            to={action_link}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:scale-105 ${config.btnBg}`}
          >
            <span>{action_text}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
