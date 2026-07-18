export type MasteryLevel = "LEARNING" | "PRACTICING" | "MASTERED";

export interface SkillProgress {
  skillName: string;
  masteryLevel: MasteryLevel;
  streakCount: number;
}
