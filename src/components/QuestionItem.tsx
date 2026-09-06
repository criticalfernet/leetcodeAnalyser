import type { Question } from "../types";
import { Check, Square, CheckSquare } from "lucide-react";

interface Props {
  question: Question;
  selected: boolean;
  done: boolean;
  onSelect: () => void;
}

function QuestionItem({ question,selected,done,onSelect }: Props) {

  const difficultyStyles: Record<string, string> = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Hard: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <li
      onClick={onSelect}
      className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
        selected
          ? "bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/5"
          : done
          ? "bg-slate-900/40 border-slate-800/60 opacity-75 hover:opacity-100"
          : "bg-slate-900 border-slate-800/80 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
          {selected ? (
            <CheckSquare size={18} className="text-indigo-400" />
          ) : (
            <Square size={18} />
          )}
        </div>

        <span className="text-sm font-medium text-slate-200 truncate">
          <span className="text-slate-500 mr-2 font-mono text-xs">
            #{question.frontendId}
          </span>
          {question.title}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            difficultyStyles[question.difficulty] || "bg-slate-800 text-slate-300 border-slate-700"
          }`}
        >
          {question.difficulty}
        </span>

        {done && (
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Check size={14} />
          </span>
        )}
      </div>
    </li>
  );
}

export default QuestionItem;