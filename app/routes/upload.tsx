import { prepareInstructions } from "../../constants";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import { Navbar } from "~/components/Navbar";
import { generateUUID } from "~/lib/formatSize";
import convertPdfToImage from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Upload" },
    { name: "description", content: "Upload your resume for review" },
  ];
}

const Upload = () => {
  //state to know whether the file is being processed
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  //is File a built in type?
  //yes, File is a built-in type in TypeScript that represents a file object, typically obtained from file input elements or drag-and-drop operations in web applications.
  const [file, setFile] = useState<File | null>(null);
  //set the file to state
  // so this state will hold a single file or null if no file is selected
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };
  //this function will convert the uploaded resume into a format suitable for analysis
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDesc,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDesc: string;
    file: File;
  }) => {
    setIsProcessing(true);
    //so users can see that app is working
    setStatusText("Uploading the file...");

    //upload file to puter store
    const uploadedFile = await fs.upload([file]);

    if (!uploadedFile) return setStatusText("Error : Failed to upload file");
    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file)
      return setStatusText("Error : Failed to convert PDF to Image");
    setStatusText("Uploading the image...");
    //why are we uploading the image file?
    //Uploading the image file to the puter store allows us to have a readily accessible version of the resume in image format, which is often required for analysis by AI models.
    //This step ensures that the image is stored in a way that the AI can easily retrieve and process it for generating feedback and insights.
    const uploadedImage = await fs.upload([imageFile.file]);
    //in what case would uploadedImage be null?
    // uploadedImage would be null if the upload process fails due to reasons such as network issues, server errors, or if the file format is not supported by the puter store.
    if (!uploadedImage) return setStatusText("Error : Failed to upload image");
    //what are we awaiting in the above line?
    //We are awaiting the completion of the file upload process to the puter store. This ensures that the image file is fully uploaded and available for subsequent analysis by the AI model before we proceed further in the code.
    //so what does the uploadedImage contain?
    // It contains metadata about the uploaded image file, such as its URL, size, and other relevant information needed for further processing.
    // what is returned from fs.upload?
    // fs.upload returns a promise that resolves to an array of uploaded file metadata objects, each containing details such as the file's URL, size, and other relevant information.
    // so the converted pdf is just an image?
    //yes, the converted PDF is transformed into an image format (like PNG) to facilitate analysis by AI models that may not be able to process PDF files directly.
    //ok so like suppose we have a 1 page pdf resume so that .pdf is converted to .png ?
    // yes, exactly. A one-page PDF resume would be converted into a single PNG image file.
    //why?
    // Many AI models, especially those focused on image recognition and analysis, are optimized to work with image formats rather than document formats like PDF.
    //so in this imagefile that we recieve , it is an object with image url , file and error message
    //so what is the diffrence between the image url and file and why do we need both?
    // The image URL is a link that can be used to access or display the image in a web application, while the file is the actual binary data of the image stored in the puter.
    // so the file is in .png format?
    // yes, the file is in PNG format as specified during the conversion process.
    //and uploaded file is in .pdf format?
    //yes,the uploaded file is in PDF format as it is the original resume file before conversion.
    setStatusText("Preparing for analysis...");
    //call the ai model to analyze the resume
    //generate uuid for this analysis session
    //but why? to uniquely identify this specific analysis session, allowing us to track and retrieve the results associated with this particular resume analysis in the future.
    const uuid = generateUUID();
    //why are we creating a data object here?
    //formatting all the data
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDesc,
      feedback: "",
    };
    //what are we awaiting here?
    //We are awaiting the completion of the data being stored in the key-value store (kv) under the unique identifier for this analysis session.
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analyzing resume...");

    const feedback = await ai.feedback(
      // pass jobDescription to match the prepareInstructions parameter name
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription: jobDesc })
    );
    if (!feedback) return setStatusText("Error : Failed to analyze resume");

    //extract feedback                                                                            //if it is an array then we get the first element's text
    const feedbackData =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;
    //why should i json.parse here?
    //if feedbackData is a JSON string, parsing it converts it into a JavaScript object for easier manipulation and access to its properties.
    data.feedback = JSON.parse(feedbackData);
    //why are we setting it again?
    // To ensure that the updated data object, which now includes the feedback from the AI analysis, is saved back to the key-value store (kv) under the same unique identifier for this analysis session.
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis complete ,redirecting...");
    navigate(`resume/${uuid}`);
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    //By default, submitting a form in HTML refreshes the page —
    //but React apps are single-page apps, so we don’t want that.
    e.preventDefault();
    const form = e.currentTarget;
    //create a FormData object to easily access form fields and file
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDesc = formData.get("job-description") as string;

    if (!file) return;
    try {
      await handleAnalyze({ companyName, jobTitle, jobDesc, file });
    } catch (err) {
      console.error(err);
    }

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
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="flex flex-col w-full items-start gap-2">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="flex flex-col w-full items-start gap-2">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="flex flex-col w-full items-start gap-2">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>
              <div className="flex flex-col w-full items-start gap-2">
                <label htmlFor="uploader">Upload Resume</label>
                {/* we are passing a function as prop to the FileUploader component */}
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
