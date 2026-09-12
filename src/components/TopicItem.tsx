import { useNavigate } from "react-router-dom";
import type { Topic } from "../types";
import { ChevronRight } from "lucide-react";
import '../styles/topicItem.css'

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
      className="topic-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="topic-name">
            {topic.name}
          </h4>
          <span className="topic-slug">
            {topic.slug.replace("-", " ")}
          </span>
        </div>
        <div className="topic-navigate-icon">
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
    <div className="topic-footer">
      <span className="text-xs text-[var(--text-card)]">Rating</span>
      <span className="text-xs font-semibold px-2 py-0.5 rounded topic-rating">
        {rating}
      </span>
    </div>
  )
}