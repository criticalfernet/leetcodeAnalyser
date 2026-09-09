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
    <div className="min-h-screen bg-[var(--background-950)] text-[var(--text-100)] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary-500)] via-[var(--primary-500)] to-[var(--accent-200)]">
              LEETCODE ANALYZER
            </h1>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="self-start md:self-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700 shadow-sm"
          >
            Sync Progress
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-[var(--primary-800)] border border-[var(--primary-600)] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <Zap size={140} />
            </div>

            <div>
              <h2 className="text-[var(--text-400)] font-medium text-m mb-10">Suggested Topics</h2>
              {recommendedTopics.map((topic) => (
                <p className="text-[1.2rem] font-bold text-[var(--text-50)] hover:underline"
                  onClick={() => navigate(`/topic/${topic.slug}`)}>
                  {topic.name || "N/A"}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-[var(--primary-800)] border border-[var(--primary-600)] rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[var(--text-400)] font-medium text-m">Overall Stats</span>
                <BookOpen size={18} className="text-[var(--text-200)]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--secondary-900)] p-4 border border-[var(--secondary-800)]">
                  <span className="text-xs text-[var(--text-500)]">Solved Problems</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{totalSolved}</p>
                </div>
                <div className="bg-[var(--secondary-900)] p-4 border border-[var(--secondary-800)]">
                  <span className="text-xs text-[var(--text-500)]">Total Questions</span>
                  <p className="text-2xl font-bold text-[var(--accent-100)] mt-1">{totalQ}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between font-semibold text-xs text-[var(--text-300)] mb-1">
                <span>Coverage</span>
                <span>{Math.round((topics.length ? (totalSolved / (topics.length * 15)) : 0) * 100)}%</span>
              </div>
              <div className="w-full bg-[var(--secondary-900)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ 
                    width: `${Math.min(100, Math.round((totalSolved / totalQ) * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>


          <TotalPieChart topics={topics} progress={progress} />
        </div>



        <div className="flex flex-col lg:flex-row gap-10 items-stretch w-full">
          <div className="flex-[1.5]">
            <Heatmap progress={progress} />
          </div>

          <div className="flex-1">
            <LeetCodeCard />
          </div>
        </div>



        <div>
          <h2 className="text-xl font-bold mb-2">
            Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    scores[topic.slug] = calculateTopicRating(topic, progress);
  });

  return scores;
}



const preferredSlugs = new Set([
  "array",
  "string",
  "hash-table",
  "linked-list",
  "stack",
  "queue",
  "matrix",
  "heap-priority-queue",
  "tree",
  "binary-tree",
  "binary-search-tree",
  "graph",
  "trie",
  "union-find",
  "depth-first-search",
  "breadth-first-search",
  "topological-sort",
  "shortest-path",
  "dijkstra",
  "prims-algorithm",
  "kruskals-algorithm",
  "two-pointers",
  "sliding-window",
  "binary-search",
  "prefix-sum",
  "backtracking",
  "recursion",
  "sorting",
  "greedy",
  "dynamic-programming",
  "dp-on-trees",
  "memoization",
  "divide-and-conquer",
  "bit-manipulation",
  "monotonic-stack",
  "monotonic-queue",
  "segment-tree",
  "binary-indexed-tree",
  "number-theory",
  "combinatorics",
]);



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