import { Link } from "react-router";
import { ScoreCircle } from "./ScoreCircle";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import type { Resume } from "types";

//props (short for properties) are how you pass data from a parent component down to a child component.
//inline type
const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
  onDelete,
}: {
  resume: Resume;
  onDelete?: (id: string) => void;
}) => {
  const { fs } = usePuterStore();
  const [resumeurl, setResumeUrl] = useState("");

  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResume();
  }, [imagePath]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };
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
          {!companyName && !jobTitle && (
            <h2 className="!text-black font-bold">Resume</h2>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors"
              title="Delete resume"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          )}
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
