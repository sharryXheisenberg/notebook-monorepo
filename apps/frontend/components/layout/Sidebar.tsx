"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Users, TrendingUp, MessageSquare, ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotebookStore } from "@/lib/store/notebookStore";
import { notebooksApi } from "@/lib/api/notebooks";
import { skillsApi } from "@/lib/api/skills";
import type { SkillProgress } from "@/types/skill";

const MASTERY_DOT: Record<string, string> = {
  LEARNING: "bg-ink-muted",
  PRACTICING: "bg-annotation",
  MASTERED: "bg-signal",
};

/**
 * Persistent left sidebar matching the original wireframe: Home, the notebook tree,
 * a Community Forum section, and a compact Skills Progression widget.
 *
 * Community Forum is intentionally a labeled placeholder, not fake data — it's a v2
 * feature (needs its own backend entities) and pretending it's live here would be
 * more misleading than an honest "coming soon" state.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { notebooks, setNotebooks } = useNotebookStore();
  const [skills, setSkills] = useState<SkillProgress[]>([]);

  useEffect(() => {
    notebooksApi.list().then(setNotebooks);
    skillsApi.getProgress().then(setSkills);
  }, [setNotebooks]);

  return (
    <aside className="w-60 shrink-0 border-r border-border-subtle h-[calc(100vh-49px)] overflow-y-auto py-4 px-3">
      <Link
        href="/notebooks"
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm mb-4 ${
          pathname === "/notebooks" ? "bg-surface-raised text-ink-primary" : "text-ink-muted hover:text-ink-primary"
        }`}
      >
        <Home size={15} /> Home
      </Link>

      <div className="mb-5">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[11px] font-medium text-ink-muted tracking-wide uppercase">
            Project notebooks
          </span>
          <Link href="/notebooks" className="text-ink-muted hover:text-annotation">
            <Plus size={13} />
          </Link>
        </div>
        <div className="space-y-0.5">
          {notebooks.slice(0, 6).map((notebook) => {
            const active = pathname === `/notebooks/${notebook.id}`;
            return (
              <Link
                key={notebook.id}
                href={`/notebooks/${notebook.id}`}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm truncate ${
                  active ? "bg-surface-raised text-ink-primary" : "text-ink-muted hover:text-ink-primary"
                }`}
              >
                <FileText size={14} className="shrink-0" />
                <span className="truncate">{notebook.title}</span>
              </Link>
            );
          })}
          {notebooks.length === 0 && (
            <p className="px-2 text-xs text-ink-muted">No notebooks yet</p>
          )}
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-2 px-2 mb-1.5">
          <Users size={12} className="text-ink-muted" />
          <span className="text-[11px] font-medium text-ink-muted tracking-wide uppercase">
            Community forum
          </span>
        </div>
        <div className="px-2 space-y-1">
          <div className="flex items-center gap-2 text-sm text-ink-muted/60 cursor-not-allowed">
            <TrendingUp size={14} /> Trending
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted/60 cursor-not-allowed">
            <MessageSquare size={14} /> Reviews
          </div>
          <p className="text-[11px] text-ink-muted/50 pt-0.5">Coming in v2</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[11px] font-medium text-ink-muted tracking-wide uppercase">
            Skills progression
          </span>
          <Link href="/skills" className="text-ink-muted hover:text-ink-primary">
            <ChevronDown size={13} />
          </Link>
        </div>
        <div className="px-2 space-y-1.5">
          {skills.slice(0, 4).map((skill) => (
            <div key={skill.skillName} className="flex items-center gap-2 text-sm text-ink-primary">
              <span className={`w-1.5 h-1.5 rounded-full ${MASTERY_DOT[skill.masteryLevel]}`} />
              {skill.skillName}
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-xs text-ink-muted">Practice in a code block to start tracking</p>
          )}
        </div>
      </div>
    </aside>
  );
}
