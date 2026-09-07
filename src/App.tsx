import { useEffect, useState } from "react";
import { getProgress, getQuestionsCount, getTopics, sync } from "./api";
import type { Progress, Topic } from "./types";
import TopicItem from "./components/TopicItem";
import { useLocation } from "react-router-dom";
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

  const recommendedTopic = getRecommendedTopic(topics, scores);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">
              LEETCODE ANALYZER
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Optimize practice.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="self-start md:self-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700 shadow-sm"
          >
            Sync Progress
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Zap size={140} />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                <Zap size={14} /> Recommendation
              </span>
              <h2 className="text-slate-400 font-medium text-sm">Suggested Focus</h2>
              <p className="text-2xl font-bold text-white mt-1">
                {recommendedTopic || "N/A"}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
            </div>
          </div>

          {/* Metric Stats */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Overall Stats</span>
                <BookOpen size={18} className="text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500">Solved Problems</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{totalSolved}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500">Total Questions</span>
                  <p className="text-2xl font-bold text-indigo-400 mt-1">{totalQ}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Coverage</span>
                <span>{Math.round((topics.length ? (totalSolved / (topics.length * 15)) : 0) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.round((topics.length ? (totalSolved / (topics.length * 15)) : 0) * 100))}%` }}
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

        

        {/* Topic Grid Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Explore Topics
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
  // Core Data Structures
  "array",
  "string",
  "hash-table",
  "linked-list",
  "stack",
  "queue",
  "matrix",
  "heap-priority-queue",

  // Trees & Graphs
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

  // Algorithmic Techniques & Patterns
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

  // Advanced & Specialized Data Structures
  "monotonic-stack",
  "monotonic-queue",
  "segment-tree",
  "binary-indexed-tree",

  // Math & Theory
  "number-theory",
  "combinatorics",
]);

function getRecommendedTopic(topics: Topic[], scores: Record<string, number>): string {
  const result = Object.entries(scores)
    .filter(([slug]) => preferredSlugs.has(slug))
    .reduce<[string, number] | null>((best, current) =>
      (best === null || current[1] > best[1]) ? current : best,
      null
    );

  if (result === null) {
    return "";
  }

  const slug = result[0];
  return topics.find((topic) => topic.slug === slug)?.name ?? "";
}