import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Building,
  Truck,
  Package,
  Sparkles,
} from 'lucide-react';

const MilestoneTimeline = ({ milestones = [] }) => {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  const getPillarIcon = (pillar) => {
    switch (pillar) {
      case 'accommodation':
        return Building;
      case 'logistics':
        return Truck;
      case 'essentials':
        return Package;
      default:
        return Sparkles;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          label: 'Completed',
        };
      case 'in_progress':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300 animate-pulse',
          label: 'In Progress',
        };
      case 'risk':
        return {
          icon: AlertTriangle,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
          label: 'Action Required',
        };
      default:
        return {
          icon: Circle,
          color: 'text-slate-600',
          bg: 'bg-slate-800 border-slate-700 text-slate-400',
          label: 'Pending',
        };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Relocation Milestones Roadmap</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time synchronization across Accommodation, Logistics & Essentials
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          {milestones.filter((m) => m.status === 'completed').length} / {milestones.length} Done
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {milestones.map((m, idx) => {
          const statusInfo = getStatusBadge(m.status);
          const PillarIcon = getPillarIcon(m.pillar);
          const StatusIcon = statusInfo.icon;
          const isDone = m.status === 'completed';

          return (
            <div key={m.key || idx} className="relative flex items-start justify-between gap-4 group">
              {/* Dot marker on vertical line */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm shadow-emerald-500/50'
                    : m.status === 'in_progress'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-sm shadow-blue-500/50'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <PillarIcon className="w-2.5 h-2.5" />
              </div>

              {/* Milestone Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-semibold transition-colors ${isDone ? 'text-slate-200' : 'text-white'}`}>
                    {m.label}
                  </h4>
                  {m.detail && (
                    <span className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {m.detail}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  {m.description}
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.bg}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusInfo.label}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneTimeline;
