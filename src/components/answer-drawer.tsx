import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RenderMarkdown } from "@/components/ui/render-markdown";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

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

export function AnswerDrawer({ open, onOpenChange, active }: AnswerDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-2xl max-w-4xl mx-auto data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=top]:max-h-[90vh]">
        <div className="flex flex-col h-full overflow-hidden">
          <DrawerHeader className="p-0 text-left shrink-0">
            {active ? (
              <div className="w-full">
                <div className="px-4 pb-3 pt-4">
                  <DrawerTitle className="text-lg font-semibold text-left select-text">
                    {active.title}
                  </DrawerTitle>
                  <p className="text-muted-foreground mt-1 text-xs text-left select-text">
                    #{active.id} • {active.tags} • {active.difficulty}
                  </p>
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
              <div className="px-4 py-4 text-sm leading-7 text-left select-text">
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
