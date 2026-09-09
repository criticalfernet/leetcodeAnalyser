import { useNavigate } from "react-router-dom";
import type { Topic } from "../types";
import { ChevronRight } from "lucide-react";

interface Props {
  topic: Topic;
  score?: number;
}

function TopicItem({ topic, score = 0 }: Props) {
  const navigate = useNavigate();
  const rating = Math.round(score * 2000);

  return (
    <div
      onClick={() => navigate(`/topic/${topic.slug}`)}
      className="group relative bg-[var(--primary-800)] hover:bg-[var(--primary-700)] border border-[var(--primary-600)] hover:border-[var(--primary-500)] rounded-xl p-5 transition-all duration-100 cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-[var(--text-100)] group-hover:text-[var(--accent-200)] transition-colors">
            {topic.name}
          </h3>
          <span className="text-xs text-[var(--text-300)] mt-0.5 block capitalize">
            {topic.slug.replace("-", " ")}
          </span>
        </div>
        <div className="text-[var(--accent-300)] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
          <ChevronRight size={18} />
        </div>
      </div>

      <Footer rating={rating}></Footer>
    </div>
  );
}

export default TopicItem;


function Footer({ rating }: { rating: number }) {
  return (
    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center">
      <span className="text-xs text-[var(--text-200)]">Rating</span>
      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/40">
        {rating}
      </span>
    </div>
  )
}