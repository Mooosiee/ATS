import type { Feedback } from "types";
import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";
const Category = ({ title, score }: { title: string, score: number }) => {
  const textColor = score > 70 ? 'text-green-600' :
    score > 49 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex gap-2 justify-center items-center">
          <p className="text-2xl">{title}</p>
          <ScoreBadge score = {score}></ScoreBadge>
        </div>
        <p className="text-2xl">
                  <span className={textColor}>{score}</span>/100
        </p>
      </div>
    </div>
  );
}
const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="flex flex-col gap-4 bg-white rounded-2xl w-full shadow-md p-5 ">
      <div className="flex items-center gap-8">
        <ScoreGauge score={feedback.overallScore}></ScoreGauge>
        <div className="flex flex-col gap-2">
          <h2 className="!text-2xl !text-black font-bold">Your Resume Score</h2>
          <p className="text-dark-200 text-sm">This score is calculated based on the variables listed below.</p>
        </div>
      </div>
      <Category title="Tone & Style" score={feedback.toneAndStyle.score}></Category>
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>
  );
};

export default Summary;
