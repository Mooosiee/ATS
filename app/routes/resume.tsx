import { Link, useNavigate, useParams } from "react-router";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import type { Feedback } from "types";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
  ];
}

const Resume = () => {
  const { id } = useParams();
  const { auth, isLoading, fs, kv } = usePuterStore();
  const [imageUrl, setimageUrl] = useState('');
  const [resumeUrl, setresumeUrl] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // did not add isLoading check
    if (!auth.isAuthenticated) {
      navigate(`/auth?next=/upload/resume/${id}`); 
    }
  },[auth.isAuthenticated])

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if (!resume) return;
      
      const data = JSON.parse(resume);
      //files from puter file storage are returned as blobs
       
      const resumeBlob = await fs.read(data.resumePath);
      //what is the above blob type?
      //A Blob is a file-like object of immutable, raw data
      //Blobs represent data that isn't necessarily in a JavaScript-native format
      //In this case, resumeBlob contains the binary data of the resume file stored in Puter's file storage
      //what is its type? how is it different from this : const pdfBlob = new Blob([resumeBlob], { type: 'applications/pdf' });
      //The type of resumeBlob depends on the file that was uploaded
      //It could be a PDF, Word document, or any other file format
      //The type is determined by the file's MIME type when it was uploaded to the storage
      //ok so when resumeBlob was uploaded it was a PDF file, so its type is 'application/pdf'?
      //Yes, if the uploaded file was a PDF, then resumeBlob's type would be 'application/pdf'
      //but the type might differ , it might not always be 'application/pdf'
      //hence we explicitly create a new Blob with the correct type below
      if (!resumeBlob) return;
      const pdfBlob = new Blob([resumeBlob], { type: 'applications/pdf' });
      //explain above line syntax
      //It creates a new Blob object containing the data from resumeBlob
      //The type 'applications/pdf' indicates that the blob represents a PDF file
      //why do we need to create a new Blob here?
      //In some cases, the data read from file storage may not have the correct MIME type
      //Creating a new Blob with the correct type ensures that it can be handled properly by the browser
      //how do we know 'applications/pdf' is the correct MIME type for PDF files?
      //what is a MIME type?
      //MIME type is a standard way to indicate the nature and format of a file
      //It helps the browser understand how to process and display the file
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setresumeUrl(resumeUrl);
      //what does the above line do?
      //It creates a URL that can be used to access the blob data in the browser
      //can the blob not be used directly?
      //No, blobs need to be converted to object URLs to be used in elements like <a> or <iframe>
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setimageUrl(imageUrl);
      setFeedback(data.feedback);

    }
    loadResume();
  },[id]);

  return (
    <main className="!pt-0">
      <nav className="flex p-4 rounded-2xl shadow-md">
        <Link to="/" className="flex items-center border rounded-lg shadow-sm border-gray-200 gap-2 p-2">
          <img src="/icons/back.svg" alt="" className="w-2.5 h-2.5"/>
          <span className="font-semibold text-gray-800 text-sm">Back to Homepage</span>
        </Link>
      </nav>
      <div className="flex w-full max-lg:flex-col-reverse">
        <section className="flex flex-col w-1/2 max-lg:w-full px-6 rounded-xs bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 max-w-xl:h-fit w-fit h-[90%] gradient-border">
              {/* what is target and rel attributes? */}
              {/* target="_blank" opens the link in a new tab */}
              {/* rel="noopener noreferrer" prevents security issues when opening links in new tabs */}
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                {/* what does object-contain do? */}
                {/* It makes the image fit within its container while preserving its aspect ratio */}
                {/* what is title attribute? */}
                {/* The title attribute provides additional information about the element, often shown as a tooltip on hover */}
                {/* object-contain makes an element fit inside its container while preserving aspect ratio — but only if the container has a size constraint. */}
                <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-2xl" title="resume"/>
              </a>
            </div>
          )}
        </section>
        <section className="flex flex-col gap-3 w-1/2 px-8 py-6 max-lg:w-full">
          {/* what does ! mean? in classes? */}
          {/* The ! symbol overrides Tailwind's default behavior and forces the style to be applied */}
          <h2 className="!text-4xl !text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-4 animate-in fade-in duration-1000">
              <Summary feedback={feedback}></Summary>
              <ATS score = {feedback.ATS.score || 0} suggestions = {feedback.ATS.tips || []}></ATS>
              <Details feedback={feedback}></Details>
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" alt="" />  
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;
