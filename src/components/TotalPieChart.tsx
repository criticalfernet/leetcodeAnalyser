import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Award } from "lucide-react";
import { getQuestionsAll } from "../api";
import type { Progress, Topic } from "../types";

interface Props {
  topics: Topic[];
  progress: Progress[];
}

export default function TotalPieChart({ topics, progress }: Props) {
  const [counts, setCounts] = useState({ easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (topics.length === 0) return;

      const solvedSet = new Set(progress.map((p) => p.questionId));

      // Fetch all questions for each topic
      const allQuestionsLists = await getQuestionsAll();

      // Deduplicate questions across topics

      let easy = 0;
      let medium = 0;
      let hard = 0;

      allQuestionsLists.forEach((q) => {
        if (solvedSet.has(q.frontendId)) {
          if (q.difficulty === "Easy") easy++;
          else if (q.difficulty === "Medium") medium++;
          else if (q.difficulty === "Hard") hard++;
        }
      });

      setCounts({ easy, medium, hard });
      setLoading(false);
    })();
  }, [topics, progress]);

  const chartData = [
    { name: "Easy", value: counts.easy, fill: "#10b981" },
    { name: "Medium", value: counts.medium, fill: "#f59e0b" },
    { name: "Hard", value: counts.hard, fill: "#ef4444" },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Overall Difficulty Breakdown
        </span>
        <Award size={18} className="text-slate-400" />
      </div>

      <div className="h-44 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#f8fafc" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "4px" }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No solved questions recorded yet
          </div>
        )}
      </div>
    </div>
  );
}