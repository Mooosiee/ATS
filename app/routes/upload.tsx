import { type FormEvent, useState } from "react";
import FileUploader from "~/components/FileUploader";
import { Navbar } from "~/components/Navbar";

const Upload = () => {
  //state to know whether the file is being processed
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  //is File a built in type?
  //yes, File is a built-in type in TypeScript that represents a file object, typically obtained from file input elements or drag-and-drop operations in web applications.
  const [file, setFile] = useState<File | null>(null);
  //set the file to state
  // so this state will hold a single file or null if no file is selected
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      //By default, submitting a form in HTML refreshes the page —
      //but React apps are single-page apps, so we don’t want that.
      e.preventDefault();
      const form = e.currentTarget;
      //create a FormData object to easily access form fields and file
      const formData = new FormData(form);
      const companyName = formData.get("company-name");
      const jobTitle = formData.get("job-title");
      const jobDesc = formData.get("job-description");
      
      console.log({ companyName, jobTitle, jobDesc, file });
    // handle file upload here
  };
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="flex flex-col items-center pt-12">
        <div className="flex flex-col items-center gap-8 max-w-4xl text-center max-sm:gap-4">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img className="w-full" src="/images/resume-scan.gif" alt="" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips.</h2>
          )}
          {!isProcessing && (
                      <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                          <div className="flex flex-col w-full items-start gap-2">
                              <label htmlFor="company-name">Company Name</label>
                              <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                          </div>
                              <div className="flex flex-col w-full items-start gap-2">
                                  <label htmlFor="job-title">Job Title</label>
                                  <input type="text" name="job-title" placeholder="Job Title" id="job-title" />     
                              </div>
                              <div className="flex flex-col w-full items-start gap-2">
                                  <label htmlFor="job-description">Job Description</label>
                                  <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                              </div>
                              <div className="flex flex-col w-full items-start gap-2">
                                  <label htmlFor="uploader">Upload Resume</label>
                                  {/* we are passing a function as prop to the FileUploader component */}
                                  <FileUploader onFileSelect={handleFileSelect}/>
                              </div>
                              <button className="primary-button" type="submit">Analyze Resume</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
