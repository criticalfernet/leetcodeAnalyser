import type { Question } from "../types";
import { Check, Square, CheckSquare } from "lucide-react";
import '../styles/questionItem.css'

interface Props {
  question: Question;
  selected: boolean;
  done: boolean;
  onSelect: () => void;
}

const difficultyStyles: Record<string, string> = {
  Easy: "bg-teal-500/20 text-teal-300 border-teal-500/40",
  Medium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Hard: "bg-rose-500/20 text-rose-300 border-rose-500/40",
};

function QuestionItem({ question, selected, done, onSelect }: Props) {

  return (
    <li
      onClick={onSelect}
      className={variant(done, selected)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Checkbox selected={selected} ></Checkbox>

        <span className="text-sm font-medium text-[var(--text-50)] truncate">
          <span className="text-[var(--primary-600)] mr-2 font-mono text-xs">
            #{question.frontendId}
          </span>
          {question.title}
        </span>
      </div>

      <Right question={question} done={done}></Right>
    </li>
  );
}

export default QuestionItem;

function variant(done: boolean, selected: boolean): string {
  return `question-list-item ${
    selected
      ? "bg-[#3b5228] border-[#76945a] shadow-md"
      : done
        ? "bg-[#1f2818] border-[#3a472b] opacity-75 hover:opacity-100"
        : "bg-[#26301c] border-[#4b5f37] hover:border-[#63804a]"
  }`;
}

function Checkbox({ selected }: { selected: boolean }) {
  return (
    <div className="checkbox-item">
      {selected ? (
        <CheckSquare size={18} className="text-[#b5a47f]" />
      ) : (
        <Square size={18} />
      )}
    </div>
  )
}
type RightProp = {
  question: Question,
  done: boolean
} 

function Right({question, done} : RightProp) {
  return (<div className="flex items-center gap-3 shrink-0">
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyStyles[question.difficulty] || "bg-slate-800 text-slate-300 border-slate-700"
        }`}
    >
      {question.difficulty}
    </span>

    {done && (
      <span className="flex items-center justify-center h-6 w-6 rounded-full checkmark">
        <Check size={14} />
      </span>
    )}
  </div>)
}