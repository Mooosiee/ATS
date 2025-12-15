import { Navbar } from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "constants/index";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter"
import { useEffect , useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import type { Resume } from "types";

//why do we have this meta function?
//because we want to set the title and description of the page
//this is used by react-router to set the title and description of the page
//this is used by search engines to index the page
//this is used by social media to show the title and description of the page when shared
//this is used by screen readers to read the title and description of the page
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const {auth,kv} = usePuterStore();
  //whenever use tries to access secure route when not authenticated we can redirect them to auth
  //and after succesfull auth we can automatically redirect them back to the page they wanted to access in the first place
  //how that works
  const location = useLocation();//comes from react router
  const navigate = useNavigate();
  //useeffect will check isAuthenticated and redirect to dashboard
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Why not make useEffect async?Because:
  // useEffect must return nothing or a cleanup function
  // It cannot return a Promise
  useEffect(() => {
    const loadResume = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list('resume:*', true)) as KVItem[];
      const parsedResumes = resumes?.map((item) => (JSON.parse(item.value) as Resume));
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }
    loadResume();
  }, [kv]);
  useEffect(() => {
    if (!auth.isAuthenticated) {
      //trying to access home page , but since for now they are not authenticated we redirect them to auth page
      //could u explain the url path?
      //the ?next=/ part is a query parameter that indicates where to redirect the user after they successfully authenticate
      //in this case, we want to redirect them back to the home page (/)
      navigate('/auth?next=/'); 
    }

  },[auth.isAuthenticated])
  console.log(loadingResumes,resumes)
  
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover ">
    <Navbar/>
    <section className="flex flex-col items-center gap-8 pt-12 max-sm:mx-2 mx-15 pb-5">
      <div className="page-heading py-16">
        <h1>Track Your Applications & Resume Ratings</h1>
        {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
        ): (
          <h2>Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>
      {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
      )}
    {!loadingResumes && resumes.length > 0 && (<div className="flex flex-wrap items-start max-md:flex-col max-md:items-center gap-6 max-sm:gap-3 w-full max-w-[1850px] justify-evenly">
      {resumes.map((resume) => (
        <ResumeCard key={resume.id} resume={resume} />
      )
    )}
      </div>)}
      {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
      )}
    </section> 
  </main>
}
