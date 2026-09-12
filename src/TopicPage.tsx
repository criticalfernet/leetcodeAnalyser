import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Question } from "./types";
import { getProgressTopic, getQuestions, markQuestionDone } from "./api";
import QuestionItem from "./components/QuestionItem";
import { ArrowLeft, CheckCircle2, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import './styles/topicPage.css'

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
    <div className="main-container-outer">
      <div className="main-container-inner">

        <div>
          <button
            onClick={() => navigate("/")}
            className="back-button"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          <div className="topic-header">
            <div>
              <h1 className="font-extrabold capitalize text-[var(--text-50)] tracking-tight">
                {slug.replace("-", " ")}
              </h1>
              <p className="rating-container">
                <Award size={16} className="text-[var(--accent-300)]" />
                Topic Rating:{" "}
                <span className="font-semibold text-[var(--accent-400)]">
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
              className={`complete-button ${selected.size > 0 ? "active" : "disabled"}`}
            >
              <CheckCircle2 size={16} /> Mark {selected.size} Completed
            </button>
          </div>
        </div>

        <div className="dashboard-grid">

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Numericalcards stats={stats} dtype={"All"} />
            <Numericalcards stats={stats} dtype={"Easy"} />
            <Numericalcards stats={stats} dtype={"Medium"} />
            <Numericalcards stats={stats} dtype={"Hard"} />

            <Breakdown chartData={chartData} />
          </div>

          {/* Recharts Pie Visualization */}
          <div className="solved-chart">
            <span className="text-xs font-semibold text-[var(--primary-300)] uppercase tracking-wider mb-2 self-start">
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
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2c2924",
                        border: "1px solid #92846c",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#f2e9d9" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--primary-100)] text-xs">
                No solved questions in this topic yet.
              </div>
            )}
          </div>
        </div>


        <div className="space-y-3">
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


interface StatsType {
  totalDone: number;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
}

function getTopicStats(questions: Question[], done: Set<number>): StatsType {
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
    All: "text-stone-200 border-stone-400/40 bg-stone-200/15 hover:bg-stone-200/25",
    Easy: "text-teal-300 border-teal-500/40 bg-teal-500/20 hover:bg-teal-500/30",
    Medium: "text-amber-300 border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30",
    Hard: "text-rose-300 border-rose-500/40 bg-rose-500/20 hover:bg-rose-500/30",
  };

  const activeStyles = {
    All: "ring-2 ring-stone-300 bg-stone-200/30",
    Easy: "ring-2 ring-teal-500 bg-teal-500/30",
    Medium: "ring-2 ring-amber-500 bg-amber-500/30",
    Hard: "ring-2 ring-rose-500 bg-rose-500/30",
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h3 className="text-lg font-bold text-[var(--text-50)]">Questions</h3>

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


function Numericalcards({ stats, dtype }: { stats: StatsType, dtype: string }) {

  const accentColor =
    dtype === "Easy"
      ? "#0f9568"
      : dtype === "Medium"
        ? "#b77504"
        : dtype === "Hard"
          ? "#e32e2e"
          : "var(--text-900)";

  const borderColor = accentColor;

  function getTitle(diff: string) {
    if (diff === "All") return "Total Solved";
    return diff;
  }

  function getStats(diff: string) {
    if (diff === "All") return <p className="text-2xl font-bold">
      {stats.totalDone} <span className="text-xs font-normal text-[var(--text-800)]">/ {stats.total}</span>
    </p>;
    if (diff === "Easy") return <p className="text-2xl font-bold">
      {stats.easy} <span className="text-xs font-normal text-[var(--text-800)]">/ {stats.easyTotal}</span>
    </p>;
    if (diff === "Medium") return <p className="text-2xl font-bold">
      {stats.medium} <span className="text-xs font-normal text-[var(--text-800)]">/ {stats.mediumTotal}</span>
    </p>;
    if (diff === "Hard") return <p className="text-2xl font-bold">
      {stats.hard} <span className="text-xs font-normal text-[var(--text-800)]">/ {stats.hardTotal}</span>
    </p>;
  }

  return (
    <div className="numerical-card" style={{ color: accentColor, borderColor: borderColor }}>
      <span className="text-xs font-bold block mb-1">{getTitle(dtype)}</span>
      {getStats(dtype)}
    </div>
  )
}

interface chartType {
  name: string;
  solved: number;
  remaining: number;
  color: string;
}

function Breakdown({ chartData }: { chartData: chartType[] }) {
  return (
    <div className="completion-breakdown">
      <span className="completion-title">
        Completion breakdown
      </span>
      {chartData.map((d) => {

        const total = d.solved + d.remaining;
        const isZeroTotal = total === 0;
        const percentage = isZeroTotal ? 100 : (d.solved / total) * 100;

        return (
          <div key={d.name} className="space-y-1">
            <div className="completion-label">
              <span className="text-[var(--text-700)] font-semibold">{d.name}</span>
              <span className="text-[var(--text-700)]">
                {d.solved} of {d.solved + d.remaining}
              </span>
            </div>
            <div className="completion-bar">
              <div
                className="completion-fill"
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
  )
}