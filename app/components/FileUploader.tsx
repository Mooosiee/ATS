import { useState, useCallback } from "react";
//dropzone is a package that provides drag-and-drop file upload functionality.
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/formatSize";

//interface does what?
//defines the shape of the props object that the FileUploader component expects to receive.
//is it like defining the type of the prop ?
//yes, it allows for better type checking and documentation.
interface FileUploaderProps {
  //we might not always have a file to select, so we make it optional with ?
  onFileSelect?: (file: File | null) => void;
}

//so what we are doing here:
//1.first we are selecting the file using react-dropzone
//2.then we are calling the onFileSelect function passed as prop with the selected file
//3.Then we want to format the file that we are uploading
const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  //react-dropzone : file uploader logic
  //kinda unclear about useCallback here
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Do something with the files
      //get access to the first file only
      const file = acceptedFiles[0] || null;
      // after getting the file, we call the onFileSelect function passed as prop
      onFileSelect?.(file);
    },
    [onFileSelect]
  );
  //destructure the props from useDropzone
  //accepeted files is an array of files dropped or selected like the types allowed
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      maxSize: 20 * 1024 * 1024, // 20 MB
      accept: {
        "application/pdf": [".pdf"],
      },
    });
  //why are we doing this again?
  // to get the file information for display purposes
  //then why was it present in onDrop?
  //yes, but that was only within the scope of onDrop function
  //so here we are getting it again from acceptedFiles
  //for displaying file name and size
  const file = acceptedFiles[0] || null;
  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {/* what is space-y-4?  adds vertical spacing between child elements. */}
        <div className="space-y-4 cursor-pointer">
          {/* JSX can only return one root element, */}
          {file ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div className="flex flex-col items-start">
                <span className="font-semibold">{file.name}</span>
                <span className="text-sm text-gray-500">
                  {formatSize(file.size)}
                </span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    //what does stopPropagation do here?
                    //it prevents the click event from bubbling up to parent elements
                    e.stopPropagation();
                    onFileSelect?.(null);
                  }}
                >
                  {" "}
                  <img
                    src="/icons/cross.svg"
                    alt="remove"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* what does mx-auto do? centers the element horizontally within its container. */}
              <div className="mx-auto w-16 h-16">
                <img src="/icons/info.svg" alt="upload" className="size-15" />
              </div>

              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-gray-500">PDF, PNG or JPG (max. 20 MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
