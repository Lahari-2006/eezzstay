import React, { useState } from 'react';
import { CheckCircle2, Circle, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MoveInChecklist = ({ initialItems, isInteractive = true }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [items, setItems] = useState(
    initialItems || [
      { id: 1, title: 'Hostel Booked', desc: 'Find and reserve your room near campus', completed: true, link: '/hostels' },
      { id: 2, title: 'Documents Ready', desc: 'College admission letter, student ID, and address proof', completed: true, link: null },
      { id: 3, title: 'Luggage Shipped', desc: 'Book doorstep luggage pickup from home', completed: false, link: '/luggage-shipping' },
      { id: 4, title: 'Room Kit Ordered', desc: 'Order bedsheet, pillow, and daily room pack', completed: false, link: '/luggage-packs' },
    ]
  );

  const toggleItem = (id) => {
    if (!isInteractive) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400"></span>
            <h3 className="text-lg sm:text-xl font-bold text-white font-sans">
              Student Move-in Checklist
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your progress step-by-step so nothing is forgotten on move-in day.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white">{percentage}%</span>
            <span className="text-xs text-slate-400 block">Completed</span>
          </div>
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="How is this calculated?"
          >
            <HelpCircle className="w-4 h-4 text-brand-400" />
          </button>
        </div>
      </div>

      {/* Explanation Tooltip / Banner */}
      {showExplanation && (
        <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-200 flex items-start gap-2.5 leading-relaxed">
          <HelpCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">How is this calculated?</strong>
            Each of the 4 checklist steps equals 25% of your move-in readiness. When an item is marked as done, your progress increases by 25%. There are no artificial or randomized numbers.
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{completedCount} of {items.length} tasks completed</span>
          <span>{percentage === 100 ? 'Ready to Move In!' : `${100 - percentage}% Remaining`}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3.5 select-none ${
              item.completed
                ? 'bg-slate-800/60 border-emerald-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            } ${isInteractive ? 'cursor-pointer' : ''}`}
          >
            <div className="mt-0.5 shrink-0">
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-semibold ${item.completed ? 'text-white line-through text-slate-400' : 'text-slate-200'}`}>
                  {item.title}
                </span>
                {item.link && !item.completed && (
                  <Link
                    to={item.link}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5 shrink-0"
                  >
                    Go <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoveInChecklist;
