import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraphDisplay } from "./GraphDisplay";
import { SolutionSteps } from "./SolutionSteps";
import * as math from "mathjs";

type AnalysisType = "limite" | "derivada" | "continuidade" | "sinal";

export const Calculator = () => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>("limite");
  const [functionInput, setFunctionInput] = useState("(x^2 - 8*x + 15)/(x^2 - 5)");
  const [point, setPoint] = useState("3");
  const [result, setResult] = useState<any>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const calculateLimit = () => {
    try {
      const steps: string[] = [];
      steps.push(`PASSO 1\n\nlim_{x→${point}} ${functionInput}`);
      
      // Parse the function
      const parsed = math.parse(functionInput);
      const compiled = parsed.compile();
      
      // Try direct substitution
      steps.push(`PASSO 2\n\nSubstituindo diretamente x = ${point}:`);
      
      try {
        const directResult = compiled.evaluate({ x: parseFloat(point) });
        if (isFinite(directResult)) {
          steps.push(`PASSO 3\n\nResultado: ${directResult.toFixed(4)}`);
          setSteps(steps);
          setResult(directResult);
          return;
        }
      } catch (e) {
        steps.push(`PASSO 3\n\nForma indeterminada. Tentando simplificar...`);
      }
      
      // Calculate limit numerically
      const x0 = parseFloat(point);
      const delta = 0.0001;
      const leftLimit = compiled.evaluate({ x: x0 - delta });
      const rightLimit = compiled.evaluate({ x: x0 + delta });
      
      steps.push(`PASSO 4\n\nLimite pela esquerda: ${leftLimit.toFixed(4)}\nLimite pela direita: ${rightLimit.toFixed(4)}`);
      
      const avgLimit = (leftLimit + rightLimit) / 2;
      steps.push(`PASSO 5\n\nLimite = ${avgLimit.toFixed(4)}`);
      
      setSteps(steps);
      setResult(avgLimit);
    } catch (error) {
      setSteps(["Erro ao calcular. Verifique a sintaxe da função."]);
      setResult(null);
    }
  };

  const calculateDerivative = () => {
    try {
      const steps: string[] = [];
      steps.push(`PASSO 1\n\nCalculando a derivada de: ${functionInput}`);
      steps.push(`PASSO 2\n\nUsando a definição: f'(x) = lim_{h→0} [f(x+h) - f(x)]/h`);
      
      const parsed = math.parse(functionInput);
      const derivative = math.derivative(parsed, 'x');
      
      steps.push(`PASSO 3\n\nDerivada: ${derivative.toString()}`);
      
      const compiled = derivative.compile();
      const valueAtPoint = compiled.evaluate({ x: parseFloat(point) });
      
      steps.push(`PASSO 4\n\nf'(${point}) = ${valueAtPoint.toFixed(4)}`);
      
      setSteps(steps);
      setResult(derivative.toString());
    } catch (error) {
      setSteps(["Erro ao calcular. Verifique a sintaxe da função."]);
      setResult(null);
    }
  };

  const checkContinuity = () => {
    try {
      const steps: string[] = [];
      steps.push(`PASSO 1\n\nVerificando continuidade em x = ${point}`);
      
      const parsed = math.parse(functionInput);
      const compiled = parsed.compile();
      const x0 = parseFloat(point);
      
      steps.push(`PASSO 2\n\nCalculando f(${point}):`);
      let fx0;
      try {
        fx0 = compiled.evaluate({ x: x0 });
        steps.push(`f(${point}) = ${fx0.toFixed(4)}`);
      } catch (e) {
        steps.push(`f(${point}) não está definida`);
        fx0 = undefined;
      }
      
      steps.push(`PASSO 3\n\nCalculando limites laterais:`);
      const delta = 0.0001;
      const leftLimit = compiled.evaluate({ x: x0 - delta });
      const rightLimit = compiled.evaluate({ x: x0 + delta });
      
      steps.push(`lim_{x→${point}⁻} f(x) = ${leftLimit.toFixed(4)}\nlim_{x→${point}⁺} f(x) = ${rightLimit.toFixed(4)}`);
      
      const continuous = Math.abs(leftLimit - rightLimit) < 0.01 && 
                        fx0 !== undefined && 
                        Math.abs(leftLimit - fx0) < 0.01;
      
      steps.push(`PASSO 4\n\n${continuous ? "✓ A função é contínua em x = " + point : "✗ A função NÃO é contínua em x = " + point}`);
      
      setSteps(steps);
      setResult(continuous ? "Contínua" : "Descontínua");
    } catch (error) {
      setSteps(["Erro ao verificar. Verifique a sintaxe da função."]);
      setResult(null);
    }
  };

  const analyzeSign = () => {
    try {
      const steps: string[] = [];
      steps.push(`PASSO 1\n\nEstudando o sinal de: ${functionInput}`);
      
      const parsed = math.parse(functionInput);
      const compiled = parsed.compile();
      
      steps.push(`PASSO 2\n\nEncontrando as raízes (zeros) da função...`);
      
      // Sample points to analyze sign changes
      const testPoints = [-10, -5, -2, -1, 0, 1, 2, 5, 10];
      const signs: { x: number; sign: string }[] = [];
      
      for (const x of testPoints) {
        try {
          const value = compiled.evaluate({ x });
          if (Math.abs(value) < 0.001) {
            signs.push({ x, sign: "zero" });
          } else if (value > 0) {
            signs.push({ x, sign: "positivo" });
          } else {
            signs.push({ x, sign: "negativo" });
          }
        } catch (e) {
          signs.push({ x, sign: "indefinido" });
        }
      }
      
      steps.push(`PASSO 3\n\nAnálise de sinais:\n${signs.map(s => `x=${s.x}: ${s.sign}`).join('\n')}`);
      
      setSteps(steps);
      setResult("Análise completa");
    } catch (error) {
      setSteps(["Erro ao analisar. Verifique a sintaxe da função."]);
      setResult(null);
    }
  };

  const handleCalculate = () => {
    switch (analysisType) {
      case "limite":
        calculateLimit();
        break;
      case "derivada":
        calculateDerivative();
        break;
      case "continuidade":
        checkContinuity();
        break;
      case "sinal":
        analyzeSign();
        break;
    }
  };

  const getTitle = () => {
    switch (analysisType) {
      case "limite": return "Calculadora de Limites";
      case "derivada": return "Calculadora de Derivadas";
      case "continuidade": return "Verificador de Continuidade";
      case "sinal": return "Estudo de Sinal";
      default: return "Calculadora de Cálculo";
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground tracking-tight">
          {getTitle()}
        </h1>

        <Card className="p-6 md:p-8 mb-8 bg-card border-border shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Tipo de Análise
              </label>
              <Select value={analysisType} onValueChange={(value) => setAnalysisType(value as AnalysisType)}>
                <SelectTrigger className="w-full bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="limite">Limite</SelectItem>
                  <SelectItem value="derivada">Derivada</SelectItem>
                  <SelectItem value="continuidade">Continuidade</SelectItem>
                  <SelectItem value="sinal">Estudo de Sinal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Função f(x)
              </label>
              <Input
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="Ex: (x^2 - 4)/(x - 2)"
                className="bg-input border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Ponto de Análise
              </label>
              <Input
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                placeholder="Ex: 3"
                className="bg-input border-border"
              />
            </div>
          </div>

          <Button 
            onClick={handleCalculate}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg transition-all"
          >
            Calcular
          </Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 bg-card border-border shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Representação Gráfica</h2>
            <GraphDisplay 
              functionInput={functionInput} 
              point={parseFloat(point)} 
              analysisType={analysisType}
            />
          </Card>

          <Card className="p-6 bg-card border-border shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Resolução</h2>
            <SolutionSteps steps={steps} />
          </Card>
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p className="mb-2">CÁLCULO DIFERENCIAL E INTEGRAL 04C-2025/2</p>
          <p>by Ana Julia Romera, Gabriela Akemi, Sophia Mattos e Thauanny da Cruz</p>
        </footer>
      </div>
    </div>
  );
};
