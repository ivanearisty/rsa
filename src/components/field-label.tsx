import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import { Info } from "lucide-react"

export function FieldLabel({
  label,
  info,
  className,
}: {
  label: string;
  info: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>

          {/* Use whitespace-pre-wrap to display the \n as new lines */}
          <TooltipContent>
            <p className="text-sm whitespace-pre-wrap">{info}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
