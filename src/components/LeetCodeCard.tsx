import { Code2, ArrowUpRight } from "lucide-react";

export default function LeetCodeCard() {
  return (
    <div className="bg-[var(--primary-800)] border border-[var(--primary-600)] rounded-xl p-5 flex flex-col justify-between h-full relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Code2 size={20} />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-amber-500 uppercase px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10">
            Platform
          </span>
        </div>

        <h3 className="text-xl font-bold text-white tracking-wide">
          LeetCode
        </h3>
        <p className="text-s text-slate-400 mt-1 leading-relaxed">
          problem set to solve questions.
        </p>
      </div>



      <div className="pt-3 border-t border-slate-800/80 mt-3">
        <a
          href="https://leetcode.com/problems"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group-hover:shadow-sm group-hover:shadow-amber-500/10"
        >
          <span>LeetCode</span>
          <ArrowUpRight size={14} className="transition-transform" />
        </a>
      </div>
    </div>
  );
}