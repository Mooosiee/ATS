import { create } from "zustand";
// A LOT OF FILE UNDERSTANDING IS LEFT

// // This global declaration of windows defines all of the diffrent functionalities that we can extract from puter for ts
// A TypeScript global declaration that tells the compiler: window.puter exists and has an auth object with these methods.
// Why: The Puter SDK is injected via a < script > tag(not an npm module).TS needs this to avoid “property does not exist on type Window”
//  errors and to give you autocompletion / type checking when you use window.puter
declare global {
  interface Window {
    puter: {
      auth: {
        // There’s a function called getUser that, when you call it, will return a Promise 
        // that eventually gives you a PuterUser object.
        getUser: () => Promise<PuterUser>;
        //         Why a Promise?
        // Because it likely makes a network call (to Puter’s API) to fetch user details. That takes time, so the function is asynchronous.
        // What’s returned:
        // A PuterUser object — that’s the interface you defined earlier
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
    };
  }
}
//Zustand defining store : place accessible from anywhere in the app where we can store our data
// defines the shape of the data that will be inside your global Zustand store.
// interface PuterStore → declares a “blueprint” of what the store will contain.
interface PuterStore{
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;//-> indicates whether the Puter.js API has been loaded and is ready to use.
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => PuterUser | null;
  };
  // init: () => void; and clearError: () => void; are function types inside your interface,
  // meaning: “this store must have these two functions available.”
  init: () => void;
  clearError : () => void;
}


//the code might run before the browser window object exists(like on the Node.js server during SSR-server-side rendering).
//Puter injects its API into window → specifically as window.puter
//If you just typed puter.auth.login(), you’d get an error: “puter is not defined”.
const getPuter = (): typeof window.puter | null => // defining type here
    typeof window !== "undefined" && window.puter ? window.puter : null;
                                    //If window.puter exists (the script has been loaded), return it.

//React hook you can call anywhere in your app : creates a zustand store
export const usePuterStore = create<PuterStore>((set, get) => {
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
      const msg = err instanceof Error ? err.message : "Failed to check auth status";
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
    init,
    clearError: () => set({ error: null }),
  };
});






//     const interval = setInterval(() => {
//       if (getPuter()) {
//         clearInterval(interval);
//         set({ puterReady: true });
//         checkAuthStatus();
//       }
//     }, 100);

//     setTimeout(() => {
//       clearInterval(interval);
//       if (!getPuter()) {
//         setError("Puter.js failed to load within 10 seconds");
//       }
//     }, 10000);
//   };

//   const write = async (path: string, data: string | File | Blob) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.fs.write(path, data);
//   };

//   const readDir = async (path: string) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.fs.readdir(path);
//   };

//   const readFile = async (path: string) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.fs.read(path);
//   };

//   const upload = async (files: File[] | Blob[]) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.fs.upload(files);
//   };

//   const deleteFile = async (path: string) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.fs.delete(path);
//   };

//   const chat = async (
//     prompt: string | ChatMessage[],
//     imageURL?: string | PuterChatOptions,
//     testMode?: boolean,
//     options?: PuterChatOptions
//   ) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     // return puter.ai.chat(prompt, imageURL, testMode, options);
//     return puter.ai.chat(prompt, imageURL, testMode, options) as Promise<
//       AIResponse | undefined
//     >;
//   };

//   const feedback = async (path: string, message: string) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }

//     return puter.ai.chat(
//       [
//         {
//           role: "user",
//           content: [
//             {
//               type: "file",
//               puter_path: path,
//             },
//             {
//               type: "text",
//               text: message,
//             },
//           ],
//         },
//       ],
//       { model: "claude-sonnet-4" }
//     ) as Promise<AIResponse | undefined>;
//   };

//   const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.ai.img2txt(image, testMode);
//   };

//   const getKV = async (key: string) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.kv.get(key);
//   };

//   const setKV = async (key: string, value: string) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.kv.set(key, value);
//   };

//   const deleteKV = async (key: string) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.kv.delete(key);
//   };

//   const listKV = async (pattern: string, returnValues?: boolean) => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     if (returnValues === undefined) {
//       returnValues = false;
//     }
//     return puter.kv.list(pattern, returnValues);
//   };

//   const flushKV = async () => {
//     const puter = getPuter();
//     if (!puter) {
//       setError("Puter.js not available");
//       return;
//     }
//     return puter.kv.flush();
//   };

//   return {
//     isLoading: true,
//     error: null,
//     puterReady: false,
//     auth: {
//       user: null,
//       isAuthenticated: false,
//       signIn,
//       signOut,
//       refreshUser,
//       checkAuthStatus,
//       getUser: () => get().auth.user,
//     },
//     fs: {
//       write: (path: string, data: string | File | Blob) => write(path, data),
//       read: (path: string) => readFile(path),
//       readDir: (path: string) => readDir(path),
//       upload: (files: File[] | Blob[]) => upload(files),
//       delete: (path: string) => deleteFile(path),
//     },
//     ai: {
//       chat: (
//         prompt: string | ChatMessage[],
//         imageURL?: string | PuterChatOptions,
//         testMode?: boolean,
//         options?: PuterChatOptions
//       ) => chat(prompt, imageURL, testMode, options),
//       feedback: (path: string, message: string) => feedback(path, message),
//       img2txt: (image: string | File | Blob, testMode?: boolean) =>
//         img2txt(image, testMode),
//     },
//     kv: {
//       get: (key: string) => getKV(key),
//       set: (key: string, value: string) => setKV(key, value),
//       delete: (key: string) => deleteKV(key),
//       list: (pattern: string, returnValues?: boolean) =>
//         listKV(pattern, returnValues),
//       flush: () => flushKV(),
//     },
//     init,
//     clearError: () => set({ error: null }),
//   };
// });