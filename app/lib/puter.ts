//so his puter.ts is built completely by the user?
// yes, this puter.ts file is custom-built to create a Zustand store that interfaces with the Puter.js SDK.
// It defines the types and methods needed to interact with Puter.js functionalities like authentication, file system operations, AI interactions, and key-value storage.
// This file is not provided by Puter.js but is created by the developer to manage and utilize Puter.js features in a structured way within their application.
//so i should understand this file well to use puter sdk effectively?
// yes, understanding this file is crucial for effectively using the Puter.js SDK in your application
import { create } from "zustand";
// A LOT OF FILE UNDERSTANDING IS LEFT

// // This global declaration of windows defines all of the diffrent functionalities that we can extract from puter for ts
// A TypeScript global declaration that tells the compiler: window.puter exists and has an auth object with these methods.
// Why: The Puter SDK is injected via a < script > tag(not an npm module).TS needs this to avoid “property does not exist on type Window”
//  errors and to give you autocompletion / type checking when you use window.puter
declare global {
  interface Window {
    puter: {
      //all these are methods provided by puter sdk
      //defining puter api structure for typescript
      auth: {
        // There’s a function called getUser that, when you call it, will return a Promise
        // that eventually gives you a PuterUser object.
        getUser: () => Promise<PuterUser>;
        // Why a Promise?
        // Because it likely makes a network call (to Puter’s API) to fetch user details. That takes time, so the function is asynchronous.
        // What’s returned:
        // A PuterUser object — that’s the interface you defined earlier
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };

      fs: {
        //what is FSItem : An interface representing a file system item (file or directory) with properties like name, path, type, size, and modified date.
        //is this typescript specific (FSItem) : Yes, FSItem is a TypeScript interface used for type checking and autocompletion.
        //what is blob : A Blob (Binary Large Object) represents immutable raw data.
        write: (
          path: string,
          data: string | File | Blob
        ) => Promise<File | undefined>;
        //above is given a function that takes a path and data (string, File, or Blob) and returns a Promise that resolves to a File or undefined.
        read: (path: string) => Promise<Blob>;
        //what is upload here: A function that takes an array of File or Blob objects and returns a Promise that resolves to an FSItem.
        upload: (file: File[] | Blob[]) => Promise<FSItem>;
        //delete function takes a path string and returns a Promise that resolves to void (indicating completion).
        delete: (path: string) => Promise<void>;
        //  readdir function takes a path string and returns a Promise that resolves to an array of FSItem objects or undefined.
        readdir: (path: string) => Promise<FSItem[] | undefined>;
      };
      ai: {
        chat: (
          prompt: string | ChatMessage[],
          imageURL?: string | PuterChatOptions,
          testMode?: boolean,
          options?: PuterChatOptions
        ) => Promise<Object>;
        img2txt: (
          image: string | File | Blob,
          testMode?: boolean
        ) => Promise<string>;
      };
      // what is kv here : key-value store for storing and retrieving simple data pairs.
      // what is its use : used for persisting small pieces of data like user preferences, session info, or app settings.
      //where is this data stored : Data is typically stored in a backend database or in-memory store managed by the Puter.js service.
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}
//Zustand defining store : place accessible from anywhere in the app where we can store our data
// defines the shape of the data that will be inside your global Zustand store.
// interface PuterStore → declares a “blueprint” of what the store will contain.
interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean; //-> indicates whether the Puter.js API has been loaded and is ready to use.
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => PuterUser | null;
  };
  fs: {
    write: (
      path: string,
      data: string | File | Blob
    ) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };
  ai: {
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string | PuterChatOptions,
      testMode?: boolean,
      options?: PuterChatOptions
    ) => Promise<AIResponse | undefined>;
    feedback: (
      path: string,
      message: string
    ) => Promise<AIResponse | undefined>;
    img2txt: (
      image: string | File | Blob,
      testMode?: boolean
    ) => Promise<string | undefined>;
  };
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (
      pattern: string,
      returnValues?: boolean
    ) => Promise<string[] | KVItem[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };

  // init: () => void; and clearError: () => void; are function types inside your interface,
  // meaning: “this store must have these two functions available.”
  init: () => void;
  clearError: () => void;
}

//the code might run before the browser window object exists(like on the Node.js server during SSR-server-side rendering).
//Puter injects its API into window → specifically as window.puter
//If you just typed puter.auth.login(), you’d get an error: “puter is not defined”.
const getPuter = (): typeof window.puter | null =>  // defining type here
  typeof window !== "undefined" && window.puter ? window.puter : null;
//If window.puter exists (the script has been loaded), return it.

//React hook you can call anywhere in your app : creates a zustand store
export const usePuterStore = create<PuterStore>((set, get) => {
  //
  const setError = (msg: string) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        user: null,
        isAuthenticated: false,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: get().auth.getUser,
      },
    });
  };
  // This function will eventually give me true or false, but asynchronously
  const checkAuthStatus = async (): Promise<boolean> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return false;
    }
    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        set({
          auth: {
            user,
            isAuthenticated: true,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => user,
          },
          isLoading: false,
        });
        return true;
      } else {
        set({
          auth: {
            user: null,
            isAuthenticated: false,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => null,
          },
          isLoading: false,
        });
        return false;
      }
    } catch (err) {
      // this line does a type check and creates a readable message string.
      const msg =
        err instanceof Error ? err.message : "Failed to check auth status";
      setError(msg);
      return false;
    }
  };
  const signIn = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    }
  };

  const signOut = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signOut();
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null,
        },
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign out failed";
      setError(msg);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await puter.auth.getUser();
      set({
        auth: {
          user,
          isAuthenticated: true,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => user,
        },
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to refresh user";
      setError(msg);
    }
  };
  const init = (): void => {
    const puter = getPuter();
    if (puter) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }
  };
  //what is happening here?
  // We are setting up a periodic check (every 100 milliseconds) to see if the Puter.js API has been loaded and is available on the window object.
  // Once it detects that Puter.js is available, it clears the interval to stop further checks, updates the store to indicate that Puter.js is ready, and calls checkAuthStatus() to verify the user's authentication status.
  // Additionally, there is a timeout set for 10 seconds; if Puter.js is not available within that time frame, it clears the interval and sets an error message in the store indicating that the loading failed.
  const interval = setInterval(() => {
    if (getPuter()) {
      clearInterval(interval);
      set({ puterReady: true });
      checkAuthStatus();
    }
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    if (!getPuter()) {
      setError("Puter.js failed to load within 10 seconds");
    }
  }, 10000);

  const write = async (path: string, data: string | File | Blob) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.write(path, data);
  };

  const readDir = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.readdir(path);
  };

  const readFile = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.read(path);
  };

  const upload = async (files: File[] | Blob[]) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.upload(files);
  };

  const deleteFile = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.delete(path);
  };

  const chat = async (
    prompt: string | ChatMessage[],
    imageURL?: string | PuterChatOptions,
    testMode?: boolean,
    options?: PuterChatOptions
  ) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    // return puter.ai.chat(prompt, imageURL, testMode, options);
    return puter.ai.chat(prompt, imageURL, testMode, options) as Promise<
      AIResponse | undefined
    >;
  };

  //so here we have created a feedback function that takes path and message as input
  //and internally this function calls puter ai chat method with a specific format
  const feedback = async (path: string, message: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    return puter.ai.chat(
      [
        {
          role: "user",
          content: [
            {
              type: "file",
              puter_path: path,
            },
            {
              type: "text",
              text: message,
            },
          ],
        },
      ],
      { model: "claude-3-7-sonnet" }
    ) as Promise<AIResponse | undefined>;
  };

  const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.img2txt(image, testMode);
  };

  const getKV = async (key: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.get(key);
  };

  const setKV = async (key: string, value: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.set(key, value);
  };

  const deleteKV = async (key: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.delete(key);
  };

  const listKV = async (pattern: string, returnValues?: boolean) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    if (returnValues === undefined) {
      returnValues = false;
    }
    return puter.kv.list(pattern, returnValues);
  };

  const flushKV = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.flush();
  };

  //return store state + methods
  //Currently only returning auth object
  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
    },
    fs: {
      write: (path: string, data: string | File | Blob) => write(path, data),
      read: (path: string) => readFile(path),
      readDir: (path: string) => readDir(path),
      upload: (files: File[] | Blob[]) => upload(files),
      delete: (path: string) => deleteFile(path),
    },
    ai: {
      chat: (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
      ) => chat(prompt, imageURL, testMode, options),
      feedback: (path: string, message: string) => feedback(path, message),
      img2txt: (image: string | File | Blob, testMode?: boolean) =>
        img2txt(image, testMode),
    },
    kv: {
      get: (key: string) => getKV(key),
      set: (key: string, value: string) => setKV(key, value),
      delete: (key: string) => deleteKV(key),
      list: (pattern: string, returnValues?: boolean) =>
        listKV(pattern, returnValues),
      flush: () => flushKV(),
    },
    init,
    clearError: () => set({ error: null }),
  };
});

