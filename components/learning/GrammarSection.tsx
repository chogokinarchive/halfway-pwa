"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Lesson {
  title: string;
  description: string;
}

function LessonItem({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-medium">{lesson.title}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {lesson.description}
        </div>
      )}
    </Card>
  );
}

export function GrammarSection({
  italianTitle,
  japaneseTitle,
  italianLessons,
  japaneseLessons,
}: {
  italianTitle: string;
  japaneseTitle: string;
  italianLessons: Lesson[];
  japaneseLessons: Lesson[];
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">{italianTitle}</h3>
        <div className="space-y-2">
          {italianLessons.map((lesson) => (
            <LessonItem key={lesson.title} lesson={lesson} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">{japaneseTitle}</h3>
        <div className="space-y-2">
          {japaneseLessons.map((lesson) => (
            <LessonItem key={lesson.title} lesson={lesson} />
          ))}
        </div>
      </div>
    </div>
  );
}
