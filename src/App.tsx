import { useEffect, useState } from "react";
import { getProgress, getQuestionsCount, getTopics, sync } from "./api";
import type { Progress, Topic } from "./types";
import TopicItem from "./components/TopicItem";
import { useLocation, useNavigate } from "react-router-dom";
import TopicPage from "./TopicPage";
import { calculateTopicRating } from "./rating";
import TotalPieChart from "./components/TotalPieChart";
import { BookOpen, Zap } from "lucide-react";
import Heatmap from "./components/Heatmap";
import LeetCodeCard from "./components/LeetCodeCard";
import { getPreferredSlugs, interviewBias } from "./interviewBias";
import "./styles/app.css"

export default function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState<Progress[]>([]);
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalQ, setTotalQ] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await sync();
      const topics = await getTopics();
      const progressData = (await getProgress()).progress;

      setTopics(topics);
      setProgress(progressData);
      setScores(calculateScores(topics, progressData));
      setTotalSolved(progressData.length);
      setTotalQ(await getQuestionsCount());
    })();
  }, []);

  const recommendedTopics = getRecommendedTopics(topics, scores);
  const location = useLocation();

  if (location.pathname.startsWith("/topic/")) {
    return <TopicPage scores={scores} />;
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="main_container_outer">
      <div className="main_container_inner">
        <header>
          <div>
            <h1 className="title_main">
              LEETCODE ANALYZER
            </h1>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="sync_button"
          >
            Sync Progress
          </button>
        </header>

        <div className="grid-container">
          <div className="header-card">
            <div className="zap-card-decoration">
              <Zap size={180} />
            </div>

            <div>
              <h2>Suggested Topics</h2>
              {recommendedTopics.map((topic) => (
                <p className="hover:underline"
                  onClick={() => navigate(`/topic/${topic.slug}`)}>
                  {topic.name || "N/A"}
                </p>
              ))}
            </div>
          </div>

          <div className="header-card">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[var(--text)] font-bold">Overall Stats</span>
                <BookOpen size={18} className="text-[var(--text)]" />
              </div>

              <div className="stats-container">
                <div className="sub-container">
                  <span >Solved Problems</span>
                  <p>{totalSolved}</p>
                </div>
                <div className="sub-container">
                  <span>Total Questions</span>
                  <p className="text-2xl font-bold text-[var(--accent-100)] mt-1">{totalQ}</p>
                </div>
              </div>
            </div>

            <div className="stats-coverage">
              <div className="bar-labels">
                <span>Coverage</span>
                <span>{Math.round((totalQ ? (totalSolved / totalQ) : 0) * 100)}%</span>
              </div>
              <div className="stats-bar">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((totalSolved / totalQ) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>


          <TotalPieChart topics={topics} progress={progress} />
        </div>



        <div className="grid-container-2">
          <Heatmap progress={progress} />
          <LeetCodeCard />
        </div>



        <div>
          <h2 className="font-bold mb-2 text-[var(--text)]">
            Topics
          </h2>
          <div className="topics-container">
            {topics
              .filter(topic => preferredSlugs.has(topic.slug))
              .map((topic) => (
                <TopicItem key={topic.id} topic={topic} score={scores[topic.slug] ?? 0} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}



function calculateScores(topics: Topic[], progress: Progress[]): Record<string, number> {
  const scores: Record<string, number> = {};

  topics.forEach(topic => {
    scores[topic.slug] = calculateTopicRating(topic, progress) * (interviewBias[topic.slug] ?? 1);
  });

  return scores;
}



const preferredSlugs = getPreferredSlugs();



function getRecommendedTopics(
  topics: Topic[],
  scores: Record<string, number>
): { name: string; slug: string }[] {
  return Object.entries(scores)
    .filter(([slug]) => preferredSlugs.has(slug))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug]) => {
      const topic = topics.find((topic) => topic.slug === slug);

      return topic
        ? { name: topic.name, slug: topic.slug }
        : null;
    })
    .filter(
      (topic): topic is { name: string; slug: string } =>
        topic !== null
    );
}