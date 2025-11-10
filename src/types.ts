export type Mood = "Happy" | "Calm" | "Stressed" | "Tired" | "Excited" | "Neutral";

export interface Entry {
  id: string;
  user_id: string;
  timestamp: string;
  mood: Mood;
  energy: number;
  engagement: number;
  flow: boolean;
  activity: string;
  notes?: string;
}

