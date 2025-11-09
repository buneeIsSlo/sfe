import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import { CodeBlock, CodeBlockCode } from "./code-block";
import type { Components } from "react-markdown";

export type RenderMarkdownProps = {
  children: string;
  id?: string;
  className?: string;
};

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : "plaintext";
}

const customComponents: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line;

    if (isInline) {
      // Let prose handle inline code styling
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    const language = extractLanguage(className);

    // CodeBlock already has not-prose, so it's excluded from prose styles
    return (
      <CodeBlock
        className={cn("my-4 w-full max-w-full overflow-clip", className)}
      >
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    );
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>;
  },
};

export function RenderMarkdown({
  children,
  id,
  className,
}: RenderMarkdownProps) {
  return (
    <Markdown
      id={id}
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        "prose-headings:font-semibold",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
        "prose-pre:bg-transparent prose-pre:p-0",
        "prose-blockquote:border-l-primary prose-blockquote:border-l-2",
        "prose-strong:font-semibold",
        "select-text **:select-text",
        className
      )}
      components={customComponents}
    >
      {children}
    </Markdown>
  );
}
