import { Bookmark } from "lucide-react";
import type { MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveOfferButtonProps {
  offerName: string;
  isSaved: boolean;
  onToggle: () => void;
  className?: string;
}

export function SaveOfferButton({
  offerName,
  isSaved,
  onToggle,
  className,
}: SaveOfferButtonProps) {
  const label = isSaved ? `Unsave ${offerName}` : `Save ${offerName}`;

  return (
    <Button
      type="button"
      variant={isSaved ? "secondary" : "ghost"}
      size="icon-sm"
      aria-label={label}
      aria-pressed={isSaved}
      title={label}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <Bookmark
        className={cn("size-4", isSaved ? "fill-current text-primary" : null)}
        aria-hidden="true"
      />
    </Button>
  );
}
