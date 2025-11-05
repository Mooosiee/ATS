interface PdfConversionResult {
  imageUrl: string;
  //what does null mean?
  //if conversion fails, we return null
  //how is it diffrent from undefined?
  // null is an explicit absence of value, whereas undefined means a variable has been declared but not assigned a value
  file: File | null;
  //why are we adding optional chaining in error?
  // because error might not always be present
  error?: string;
}
//PDF file into an image (PNG) using PDF.js, a popular JavaScript library for rendering PDFs in the browser.

//Lazy-Loading PDF.js
//To optimize performance and reduce initial load times, we can lazy-load the PDF.js library only when needed. This means that the library will be loaded asynchronously when the user uploads a PDF file, rather than being included in the initial bundle of the application.
//explain the code below
// We are declaring two variables at the module level: pdfjsLib and loadPromise.
// pdfjsLib will hold the reference to the loaded PDF.js library once it is available.
// loadPromise is used to ensure that the library is only loaded once, even if multiple requests to convert PDFs are made simultaneously.
//describe the syntax aswell
// The use of "let" allows us to declare variables that can be reassigned later.
// The type "any" is used here to indicate that pdfjsLib can hold a value of any type, as we don't have specific type information for the PDF.js library at this point.
// We initialize both variables to null, indicating that they don't hold any value initially.
let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

//could u explain the function below?
// The loadPdfJs function is responsible for loading the PDF.js library asynchronously.
// It first checks if the library is already loaded (pdfjsLib is not null). If it is, it simply returns the existing reference.
// If the library is not yet loaded, it checks if there is an ongoing loading process (loadPromise is not null). If there is, it returns the existing promise to avoid multiple simultaneous loads.
// If neither condition is met, it initiates the loading process by dynamically importing the PDF.js module using the import() function. Once the module is loaded, it sets the worker source for PDF.js and assigns the loaded library to pdfjsLib before returning it.
async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;

  if (loadPromise) return loadPromise;
  //could u explain the code below?
  // The import("pdfjs-dist/build/pdf.mjs") statement dynamically imports the PDF.js module from the specified path. This is a feature of JavaScript that allows for loading modules asynchronously at runtime.
  // The .then((lib) => { ... }) part is a promise handler that executes once the module is successfully loaded. The loaded module is passed as the lib parameter to the function.
  // Inside the function, we set the worker source for PDF.js using lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";. This is necessary for PDF.js to function correctly, as it uses a web worker for processing PDF files.
  // Finally, we assign the loaded library to the pdfjsLib variable and return it, making it available for use in other parts of the application.
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    return lib;
  });
  return loadPromise;
}
//why do we not import it directly at the top?
//Importing PDF.js directly at the top would include it in the initial bundle of the application, increasing the load time and potentially impacting performance, especially if the library is large and not always needed.
// By using a dynamic import, we can load the library only when it's actually needed, which can help improve the overall performance of the application.
export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();
    //turns the uploaded file into raw binary data that PDF.js can read.
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // Get the first page

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) throw new Error("Failed to get canvas context");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    await page.render({ canvasContext: context, viewport }).promise;
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png", 1.0);
    });

    if (!blob) throw new Error("Failed to create image blob");
    const baseName = file.name.replace(/\.pdf$/i, "");
    const imageFile = new File([blob], `${baseName}.png`, {
      type: "image/png",
    });
    const imageUrl = URL.createObjectURL(blob);
    return { imageUrl, file: imageFile };
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: (err as Error).message || "Failed to convert PDF",
    };
  }
}

export default convertPdfToImage;
