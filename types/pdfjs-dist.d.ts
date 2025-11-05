declare module 'pdfjs-dist/build/pdf.mjs' {
  export const GlobalWorkerOptions: { workerSrc: string };
  const pdfjsLib: any;
  export default pdfjsLib;
}
