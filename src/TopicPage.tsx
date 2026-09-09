import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Question } from "./types";
import { getProgressTopic, getQuestions, markQuestionDone } from "./api";
import QuestionItem from "./components/QuestionItem";
import { ArrowLeft, CheckCircle2, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Props {
  scores: Record<string, number>;
}

export default function TopicPage({ scores }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = location.pathname.split("/")[2];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [done, setDone] = useState<Set<number>>(new Set());
  const [refresh, setRefresh] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  function selectQuestion(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  useEffect(() => {
    (async () => {
      setQuestions(await getQuestions(slug));
    })();
  }, [slug]);

  useEffect(() => {
    (async () => {
      const data = await getProgressTopic(slug);
      setDone(new Set(data.questionIds));
    })();
  }, [refresh]);

  const stats = getTopicStats(questions, done);

  const chartData = [
    { name: "Easy", solved: stats.easy, remaining: stats.easyTotal - stats.easy, color: "#10b981" },
    { name: "Medium", solved: stats.medium, remaining: stats.mediumTotal - stats.medium, color: "#f59e0b" },
    { name: "Hard", solved: stats.hard, remaining: stats.hardTotal - stats.hard, color: "#ef4444" },
  ];

  const pieData = [
    { name: "Easy Solved", value: stats.easy, fill: "#10b981" },
    { name: "Medium Solved", value: stats.medium, fill: "#f59e0b" },
    { name: "Hard Solved", value: stats.hard, fill: "#ef4444" },
  ].filter((item) => item.value > 0);

  const filteredQuestions = questions.filter((question) => {
    if (difficultyFilter === "All") return true;
    return question.difficulty === difficultyFilter;
  });

  return (
    <div className="min-h-screen bg-[#130f10] text-[var(--text-100)] p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 w-fit"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold capitalize text-white tracking-tight">
                {slug.replace("-", " ")}
              </h1>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <Award size={16} className="text-indigo-400" />
                Topic Rank Rating:{" "}
                <span className="font-semibold text-indigo-300">
                  {Math.round((scores[slug] ?? 0) * 2000)}
                </span>
              </p>
            </div>

            <button
              disabled={selected.size === 0}
              onClick={async () => {
                for (const questionId of selected) {
                  await markQuestionDone(questionId);
                }
                setSelected(new Set());
                setRefresh((prev) => prev + 1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selected.size > 0
                ? "bg-[var(--accent-400)] hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
                : "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                }`}
            >
              <CheckCircle2 size={16} /> Mark {selected.size} Completed
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Numerical Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Total Solved</span>
              <p className="text-2xl font-bold text-white">
                {stats.totalDone} <span className="text-xs font-normal text-slate-500">/ {stats.total}</span>
              </p>
            </div>
            <div className="bg-slate-900 border border-emerald-500/20 p-4 rounded-xl">
              <span className="text-xs text-emerald-400 block mb-1">Easy</span>
              <p className="text-2xl font-bold text-emerald-300">
                {stats.easy} <span className="text-xs font-normal text-slate-500">/ {stats.easyTotal}</span>
              </p>
            </div>
            <div className="bg-slate-900 border border-amber-500/20 p-4 rounded-xl">
              <span className="text-xs text-amber-400 block mb-1">Medium</span>
              <p className="text-2xl font-bold text-amber-300">
                {stats.medium} <span className="text-xs font-normal text-slate-500">/ {stats.mediumTotal}</span>
              </p>
            </div>
            <div className="bg-slate-900 border border-rose-500/20 p-4 rounded-xl">
              <span className="text-xs text-rose-400 block mb-1">Hard</span>
              <p className="text-2xl font-bold text-rose-300">
                {stats.hard} <span className="text-xs font-normal text-slate-500">/ {stats.hardTotal}</span>
              </p>
            </div>

            {/* Custom Progress Bar Chart Overlay */}
            <div className="col-span-2 sm:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                Completion breakdown
              </span>
              {chartData.map((d) => {

                const total = d.solved + d.remaining;
                const isZeroTotal = total === 0;
                const percentage = isZeroTotal ? 100 : (d.solved / total) * 100;

                return (
                  <div key={d.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{d.name}</span>
                      <span className="text-slate-400">
                        {d.solved} of {d.solved + d.remaining}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: d.color,
                          width: `${percentage}%`,
                          opacity: isZeroTotal ? 0.4 : 1
                        }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recharts Pie Visualization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center min-h-[220px]">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 self-start">
              Solved Distribution
            </span>
            {pieData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No solved questions in this topic yet.
              </div>
            )}
          </div>
        </div>

        {/* Question Item List */}
        <div className="space-y-3">
          {/* Header with Title and Difficulty Action Buttons */}
          <Top filter={difficultyFilter} onFilterChange={setDifficultyFilter} />

          <ul className="space-y-2">
            {filteredQuestions.map((question) => (
              <QuestionItem
                key={question.frontendId}
                question={question}
                selected={selected.has(question.frontendId)}
                done={done.has(question.frontendId)}
                onSelect={() => selectQuestion(question.frontendId)}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function getTopicStats(questions: Question[], done: Set<number>) {
  const total = questions.length;

  let easy = 0;
  let medium = 0;
  let hard = 0;

  for (const question of questions) {
    if (question.difficulty === "Easy" && done.has(question.frontendId)) {
      easy++;
    }

    if (question.difficulty === "Medium" && done.has(question.frontendId)) {
      medium++;
    }

    if (question.difficulty === "Hard" && done.has(question.frontendId)) {
      hard++;
    }
  }

  return {
    totalDone: done.size,
    total,
    easy,
    medium,
    hard,
    easyTotal: questions.filter((q) => q.difficulty === "Easy").length,
    mediumTotal: questions.filter((q) => q.difficulty === "Medium").length,
    hardTotal: questions.filter((q) => q.difficulty === "Hard").length,
  };
}

interface TopProps {
  filter: "All" | "Easy" | "Medium" | "Hard";
  onFilterChange: (difficulty: "All" | "Easy" | "Medium" | "Hard") => void;
}

function Top({ filter, onFilterChange }: TopProps) {
  const options: Array<"All" | "Easy" | "Medium" | "Hard"> = ["All", "Easy", "Medium", "Hard"];

  const styles = {
    All: "text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-800",
    Easy: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20",
    Medium: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20",
    Hard: "text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20",
  };

  const activeStyles = {
    All: "ring-2 ring-slate-400 bg-slate-800",
    Easy: "ring-2 ring-emerald-500 bg-emerald-500/30",
    Medium: "ring-2 ring-amber-500 bg-amber-500/30",
    Hard: "ring-2 ring-rose-500 bg-rose-500/30",
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h3 className="text-lg font-bold text-white">Questions</h3>

      <div className="flex items-center gap-2">
        {options.map((level) => {
          const isActive = filter === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onFilterChange(isActive && level !== "All" ? "All" : level)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${styles[level]
                } ${isActive ? activeStyles[level] : "opacity-70 hover:opacity-100"}`}
            >
              {level}
            </button>
          );
        })}
      </div>
    </div>
  );
}