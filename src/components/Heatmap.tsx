import { addMonths, format, getDaysInMonth, isSameMonth, subMonths, parseISO, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import type { Progress } from "../types";
import '../styles/heatmap.css'

interface Props {
    progress: Progress[];
}

const STYLES = [
  "bg-[#1b2115] border-[#303c24] text-[#667255]",
  "bg-[#26301c] border-[#4b5f37] text-[#8fa47a]",
  "bg-[#304321] border-[#566f3d] text-[#a8bd91]",
  "bg-[#3b5228] border-[#63804a] text-[#c0d2aa]",
  "bg-[#4b6330] border-[#76945a] text-[#d7e4c5]",
  "bg-[#5b7539] border-[#8ba96b] text-[#f1f4ec] font-bold ring-1 ring-[#8ba96b]/50",
];

export default function Heatmap({ progress }: Props) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = new Date();

    const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

    const isNextDisabled = isSameMonth(currentMonth, today) || currentMonth > today;
    const solvedDates = progress.map((item) => parseISO(item.lastAccepted));
    const daysInMonthCount = getDaysInMonth(currentMonth);

    const monthData = Array.from({ length: daysInMonthCount }, (_, i) => {
        const dayDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            i + 1
        );

        const count = solvedDates.filter((solvedDate) =>
            isSameDay(solvedDate, dayDate)
        ).length;

        return {
            day: i + 1,
            count,
        };
    });

    const getColorClass = (count: number) => {
        if (count === 0) return STYLES[0];
        if (count === 1) return STYLES[1];
        if (count === 2) return STYLES[2];
        if (count === 3) return STYLES[3];
        if (count === 4) return STYLES[4];
        return STYLES[5];
    };

    return (
        <div className="header-card heatmap-card">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Calendar size={22} className="text-[#f0eadb]" />
                    <h3 className="font-semibold text-[#f0eadb]">{format(currentMonth, "MMM yyyy")}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        className="heatmap-nav-button"
                        title="Previous Month"
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        type="button"
                        className="heatmap-nav-button"
                        title="Next Month"
                        onClick={handleNextMonth}
                        disabled={isNextDisabled}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>



            <div className="grid grid-cols-[repeat(11,minmax(0,1fr))] gap-1.5">
                {monthData.map((item) => (
                    <div
                        key={item.day}
                        className={`heatmap-cell ${getColorClass(
                            item.count
                        )}`}
                    >
                        <span className="text-[11px] font-mono">{item.day}</span>

                        {/* Hover Tooltip */}
                        <div className="absolute -top-8 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                            <span className="bg-slate-950 border border-slate-700 text-slate-200 text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap">
                                Day {item.day}: {item.count} solved
                            </span>
                            <div className="w-1 h-1 bg-slate-950 border-r border-b border-slate-700 rotate-45 -mt-0.5"></div>
                        </div>
                    </div>
                ))}
            </div>



            <Footer></Footer>
        </div>
    );
}

function Footer() {
    return (
        <div className="flex items-center justify-end pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
                <span className="text-[10px] text-[var(--text-700)] mr-1">Less</span>
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[0]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[1]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[2]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[3]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[4]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[5]}`} />
                <span className="text-[10px] text-[var(--text-700)] ml-1">More</span>
            </div>
        </div>
    )
}