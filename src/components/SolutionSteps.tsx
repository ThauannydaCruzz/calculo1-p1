import { ScrollArea } from "@/components/ui/scroll-area";
import { MathDisplay } from "./MathDisplay";

interface SolutionStepsProps {
  steps: string[];
}

export const SolutionSteps = ({ steps }: SolutionStepsProps) => {
  return (
    <ScrollArea className="h-[500px] w-full rounded-none border-2 border-gray-700 p-6 bg-black">
      {steps.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Clique em "Calcular" para ver os passos da solução</p>
        </div>
      ) : (
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <MathDisplay content={step} />
              {index < steps.length - 1 && (
                <div className="mt-6 h-px bg-gray-800" />
              )}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};
