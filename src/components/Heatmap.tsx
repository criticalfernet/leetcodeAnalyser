import { addMonths, format, getDaysInMonth, isSameMonth, subMonths, parseISO, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import type { Progress } from "../types";

interface Props {
    progress: Progress[];
}

const STYLES = [
    "bg-slate-950/50 border-slate-800/80 text-slate-600",
    "bg-indigo-900 border-indigo-900/40 text-indigo-400",
    "bg-indigo-800 border-indigo-700/50 text-indigo-300",
    "bg-indigo-700 border-indigo-600/60 text-indigo-200",
    "bg-indigo-600 border-indigo-500/70 text-indigo-100",
    "bg-indigo-500 border-indigo-400 text-white font-bold ring-1 ring-indigo-400/50"
]

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
        <div className="bg-[var(--primary-800)] border border-[var(--primary-600)] rounded-xl p-5 space-y-4 h-full w-full">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400" />
                    <h2 className="text-sm font-bold text-white tracking-wider">{format(currentMonth, "MMM yyyy")}</h2>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 transition-colors cursor-pointer"
                        title="Previous Month"
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                        className={`group relative h-8 rounded-lg border flex items-center justify-center transition-all duration-150 hover:scale-110 hover:z-10 cursor-pointer ${getColorClass(
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
                <span className="text-[10px] text-slate-500 mr-1">Less</span>
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[0]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[1]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[2]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[3]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[4]}`} />
                <div className= {`w-2.5 h-2.5 rounded-sm ${STYLES[5]}`} />
                <span className="text-[10px] text-slate-500 ml-1">More</span>
            </div>
        </div>
    )
}