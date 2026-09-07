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
      className="group relative bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-indigo-500/10 hover:shadow-lg flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
            {topic.name}
          </h3>
          <span className="text-xs text-slate-500 mt-0.5 block capitalize">
            {topic.slug.replace("-", " ")}
          </span>
        </div>
        <div className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
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
      <span className="text-xs text-slate-400">Rating</span>
      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
        {rating}
      </span>
    </div>
  )
}