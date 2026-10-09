export interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
  audioBase64?: string | null;
  language?: "en" | "fr";
  timestamp: Date;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface ProfileData {
  name: string;
  assistantName: string;
  role: string;
  school: string;
  location: string;
  email: string;
  linkedin: string;
  experiences: Experience[];
  education: Array<{
    degree: string;
    school: string;
    period: string;
  }>;
  languages: Array<{
    name: string;
    level: string;
    code: string;
  }>;
  tools: string[];
  interests: string[];
}
