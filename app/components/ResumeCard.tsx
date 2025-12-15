import { Link } from "react-router";
import { ScoreCircle } from "./ScoreCircle";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import type { Resume } from "types";

//props (short for properties) are how you pass data from a parent component down to a child component.
//inline type
const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
    resume: Resume;
  }) => {
  const { fs } = usePuterStore();
  const [ resumeurl, setResumeUrl ] = useState('');

  useEffect(() => {
      const loadResume = async () => {
        const blob = await fs.read(imagePath);
        if (!blob) return;
        let url = URL.createObjectURL(blob);
        setResumeUrl(url);
      }
      loadResume();
    },[imagePath])
  return (
    // DID NOT ADD ANIMATIONS
    // Flex makes the inline Link tag a block level element and then all w/h and styling works
    <Link
      to={`/resume/${id}`}
      className="flex flex-col gap-8 h-[560px] w-[350px] lg:w-[430px] xl:w-[490px] bg-white rounded-xl p-4"
    >
      {/* using !text-black, Tailwind adds !important to that rule in CSS, which overrides any other color applied, regardless of order or specificity. */}
      {/* why we use break-words (or overflow-wrap: break-word) — it allows the browser to break long words and wrap them to the next line. */}

      {/* DID NOT ADD RESUME CARD HEADER WILL THINK IT THROUGH LATER */}
      {/* HEADER */}
      <div className="flex flex-col  items-center sm:flex-row sm:justify-between">
        <div className="flex flex-col max-sm:items-center  gap-2">
          {companyName && (
            <h2 className="!text-black font-bold break-words">{companyName}</h2>
          )}
          {jobTitle && (
            <h3 className="text-lg text-gray-500 break-words">{jobTitle}</h3>
          )}
          {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>
      {/* Resume image */}
      <div className="bg-gradient-to-b from-light-blue-100 to-light-blue-200 p-4 rounded-2xl ">
        <img
          src={resumeurl}
          alt="resume"
          className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
        />
      </div>
    </Link>
  );
};

export default ResumeCard;
