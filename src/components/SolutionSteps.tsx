import { ScrollArea } from "@/components/ui/scroll-area";

interface SolutionStepsProps {
  steps: string[];
}

export const SolutionSteps = ({ steps }: SolutionStepsProps) => {
  return (
    <ScrollArea className="h-[400px] w-full rounded-lg border border-border p-4 bg-input/50">
      {steps.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Clique em "Calcular" para ver os passos da solução</p>
        </div>
      ) : (
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="math-display whitespace-pre-wrap text-foreground leading-relaxed">
                {step}
              </div>
              {index < steps.length - 1 && (
                <div className="mt-4 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};
