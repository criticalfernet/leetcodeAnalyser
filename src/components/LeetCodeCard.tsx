import { Code2, ArrowUpRight } from "lucide-react";
import '../styles/leetcodeCard.css'

export default function LeetCodeCard() {
  return (
    <div className="header-card secondary-card">

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="lc-header-icon-1 text-amber-900">
            <Code2 size={20} />
          </div>
          <span className="lc-header-icon-1 font-mono font-semibold text-amber-900">
            Platform
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#d98b32] tracking-wide">
          LeetCode Problems
        </h3>
        <p className="mt-1 leading-relaxed lc-p">
          leetcode.com/problemset
        </p>
      </div>



      <div className="pt-3 border-t border-[var(--primary-700)] mt-3">
        <a
          href="https://leetcode.com/problems"
          target="_blank"
          rel="noopener noreferrer"
          className="lc-header-icon-2 text-amber-900"
        >
          <span>LeetCode</span>
          <ArrowUpRight size={16} className="transition-transform" />
        </a>
      </div>
    </div>
  );
}