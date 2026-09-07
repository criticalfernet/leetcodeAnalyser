import { Code2, ArrowUpRight } from "lucide-react";

export default function LeetCodeCard() {
  return (
    <div className="bg-slate-800/50 border border-indigo-500/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-full relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Code2 size={20} />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-amber-500/80 uppercase px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10">
            Platform
          </span>
        </div>

        <h3 className="text-base font-bold text-white tracking-wide">
          LeetCode
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Jump straight to the official problem set to solve questions.
        </p>
      </div>



      <div className="pt-3 border-t border-slate-800/80 mt-3">
        <a
          href="https://leetcode.com/problems"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group-hover:shadow-sm group-hover:shadow-amber-500/10"
        >
          <span>Open LeetCode</span>
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}