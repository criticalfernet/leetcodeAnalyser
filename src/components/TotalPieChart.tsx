import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Award } from "lucide-react";
import { getQuestionsAll } from "../api";
import type { Progress, Topic } from "../types";
import '../styles/totalPieChart.css'

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
      const allQuestionsLists = await getQuestionsAll();

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
    { name: "Easy", value: counts.easy, fill: "#2f9e5b" },
    { name: "Medium", value: counts.medium, fill: "#c9942a" },
    { name: "Hard", value: counts.hard, fill: "#d65353" },
  ].filter((item) => item.value > 0);

  return (
    <div className="header-card secondary-card">
      <Header></Header>

      <div className="h-full w-full">
        {loading ? (
          <div className="center-content">
            <div className="graph-loading-circle"></div>
          </div>
        ) : chartData.length > 0 ? (
          <Chart chartData={chartData}></Chart>
        ) : (
          <div className="center-content text-[var(--text-800)]">
            No solved questions recorded yet
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (<div className="flex justify-between items-center mb-2">
    <span className="text-[var(--text-950)] font-extrabold uppercase">
      Questions Breakdown
    </span>
    <Award size={18} className="text-[var(--text-950)] font-bold" />
  </div>)
}

type ChartProp = {
  chartData : {name: string, value: number, fill: string}[]
}
function Chart({chartData} : ChartProp) {
  return (<ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        innerRadius={45}
        outerRadius={65}
        dataKey="value"
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: "#2b261c",
          border: "1px solid #5c5039",
          borderRadius: "8px",
        }}
        itemStyle={{ color: "#f2e9d9" }}
      />
      <Legend
        wrapperStyle={{ fontSize: "0.8rem", paddingTop: "0.2rem" }}
        iconSize={8}
      />
    </PieChart>
  </ResponsiveContainer>)
}