// An interface in TypeScript is a way to describe the shape of an object.
export interface Job {
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
}

export interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
}

export interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
    }[];
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}

/* === TypeScript Learning Guide ===

1. Interfaces Basics
--------------------
An interface is like a contract that describes what properties an object must have:

interface Person {
  name: string;      // Must have a name that's text
  age: number;       // Must have an age that's a number
  email?: string;    // ? means optional - might have an email or might not
}

2. Types Used in This File
-------------------------
- string: For text (like names, paths, descriptions)
- number: For numbers (like scores)
- boolean: true/false values
- arrays: Using [] (like requiredSkills: string[] for a list of skills)
- union types: Using | (like type: "good" | "improve" meaning "must be one of these")

3. Nested Objects
----------------
The Feedback interface shows nested objects. It's like having folders inside folders:
feedback/
  ├─ ATS/
  │   ├─ score: number
  │   └─ tips: array of tip objects
  ├─ toneAndStyle/
  │   ├─ score: number
  │   └─ tips: array of tip objects
  etc...

4. Arrays of Objects
-------------------
tips: { type: "good" | "improve", tip: string }[];
      │                                       │└─ [] means "array of"
      └─ The shape of each object in the array

5. Common Patterns Used Here
---------------------------
- Optional properties: companyName?: string (the ? means optional)
- String literals: type: "good" | "improve" (must be exactly one of these values)
- Nested arrays: tips: {...}[] (arrays of objects with specific shapes)
- Consistent structures: Each feedback section has the same shape (score + tips)

6. How This Helps You
--------------------
- TypeScript will warn you if you try to:
  * Miss a required property (like forgetting id in Resume)
  * Use wrong types (like putting a number where a string should be)
  * Access properties that might not exist
  * Put wrong values in arrays
  * Make typos in property names

7. Using These Types
-------------------
Example usage:
const myResume: Resume = {
  id: "123",
  imagePath: "/images/resume.png",
  resumePath: "/pdfs/resume.pdf",
  feedback: {
    overallScore: 85,
    ATS: {
      score: 90,
      tips: [{ type: "good", tip: "Nice formatting" }]
    },
    // ... other feedback sections
  }
};

8. Why We Have Separate Type Files
--------------------------------
We organize types in separate files (like this one) for several reasons:
1. Reusability: Define once, use everywhere
2. Organization: Keep similar types together
3. Maintainability: Easier to update types in one place
4. Separation of concerns: Types separate from implementation

File organization:
├─ types/
│   ├─ index.ts        → Your app's core types (Resume, Feedback, etc.)
│   ├─ puter.d.ts      → External API types
│   └─ other-types.ts  → Other type definitions
├─ components/         → React components that USE these types
└─ routes/            → Pages/routes that USE these types

9. How Other Files Know About These Types
---------------------------------------
To use these types in other files, you need to:

1. Export the types (in this file):
   export interface Resume { ... }
   export interface Feedback { ... }

2. Import them where needed:
   import { Resume, Feedback } from "../types";
   
   function DisplayResume({ resume }: { resume: Resume }) {
     // Now TypeScript knows what a Resume looks like
     return <div>{resume.jobTitle}</div>;
   }

The TypeScript compiler connects all the files together and makes sure
types are used correctly across your entire application.

10. Type File Organization Best Practices
--------------------------------------
- index.ts: Main/common types (like we have here)
- *.d.ts: Declaration files for external libraries/APIs
- Keep related types together
- Export what other files need
- Use clear, descriptive names
- Document complex types with comments

*/
