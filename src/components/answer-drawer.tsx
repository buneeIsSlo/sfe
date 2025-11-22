import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RenderMarkdown } from "@/components/ui/render-markdown";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { getDifficultyColors, getTagColor } from "@/lib/utils";

type Question = {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  createdAt: number;
  difficulty: string;
};

type AnswerItem = Question & {
  answer: string | null;
};

interface AnswerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: AnswerItem | null;
}

export function AnswerDrawer({
  open,
  onOpenChange,
  active,
}: AnswerDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-secondary bg-secondary mx-auto max-w-4xl rounded-t-2xl border-2 data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=top]:max-h-[90vh]">
        <div className="flex h-full flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 p-0 text-left">
            {active ? (
              <div className="w-full">
                <div className="px-4 pt-4 pb-3">
                  <DrawerTitle className="text-left text-lg font-semibold select-text">
                    {active.title}
                  </DrawerTitle>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-left">
                    <Badge className={getTagColor(active.tags).className}>
                      {active.tags}
                    </Badge>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span
                      className={`text-xs ${getDifficultyColors(active.difficulty)}`}
                    >
                      {active.difficulty}
                    </span>
                  </div>
                </div>
                <Separator />
              </div>
            ) : (
              <div className="flex items-center justify-center p-6">
                <Spinner className="size-6" />
              </div>
            )}
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {active && (
              <div className="px-4 py-4 text-left text-sm leading-7 select-text">
                {active.answer ? (
                  <RenderMarkdown>{active.answer}</RenderMarkdown>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No answer available.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
