"use client";

import { useEffect, useState } from "react";
import { skillsApi } from "@/lib/api/skills";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { SkillProgress } from "@/types/skill";

const MASTERY_COLOR: Record<string, string> = {
  LEARNING: "text-ink-muted",
  PRACTICING: "text-annotation",
  MASTERED: "text-signal",
};

export default function SkillsPage() {
  const [progress, setProgress] = useState<SkillProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    skillsApi.getProgress().then((data) => {
      setProgress(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Your skills</h1>

      {progress.length === 0 ? (
        <p className="text-ink-muted">
          No tracked skills yet — practicing in code blocks builds this up over time.
        </p>
      ) : (
        <div className="grid gap-3">
          {progress.map((skill) => (
            <Card key={skill.skillName} className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">{skill.skillName}</h2>
                <p className={`text-xs ${MASTERY_COLOR[skill.masteryLevel]}`}>
                  {skill.masteryLevel}
                </p>
              </div>
              <div className="text-sm text-ink-muted">🔥 {skill.streakCount} day streak</div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
