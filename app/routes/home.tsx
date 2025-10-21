import { Navbar } from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "constants/index";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter"
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const {auth} = usePuterStore();
  //whenever use tries to access secure route when not authenticated we can redirect them to auth
  //and after succesfull auth we can automatically redirect them back to the page they wanted to access in the first place
  //how that works
  const location = useLocation();//comes from react router
  const navigate = useNavigate();
  //useeffect will check isAuthenticated and redirect to dashboard
  useEffect(() => {
    if (!auth.isAuthenticated) {
      //trying to access home page , but since for now they are not authenticated we redirect them to auth page
      navigate('/auth?next=/'); 
    }

  },[auth.isAuthenticated])
  
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover ">
    <Navbar/>
    <section className="flex flex-col items-center gap-8 pt-12 max-sm:mx-2 mx-15 pb-5">
      <div className="page-heading py-16">
        <h1>Track Your Applications & Resume Ratings</h1>
        <h2>Review your submission and check AI-powered feedback.</h2>
      </div>
    {resumes.length > 0 && (<div className="flex flex-wrap items-start max-md:flex-col max-md:items-center gap-6 max-sm:gap-3 w-full max-w-[1850px] justify-evenly">
      {resumes.map((resume) => (
        <ResumeCard key={resume.id} resume={resume} />
      )
    )}
    </div>)}
    </section> 
  </main>
}
