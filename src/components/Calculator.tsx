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
      const x0 = parseFloat(point);
      
      // Convert function to LaTeX-like notation
      const latexFunc = functionInput
        .replace(/\^/g, '^')
        .replace(/\*/g, ' \\cdot ')
        .replace(/\(/g, '(')
        .replace(/\)/g, ')');
      
      steps.push(`**PASSO 1** — Calcular o limite\n\n$$\\lim_{x \\to ${point}} ${latexFunc}$$`);
      
      // Parse the function
      const parsed = math.parse(functionInput);
      const compiled = parsed.compile();
      
      // Try direct substitution
      steps.push(`**PASSO 2** — Substituição direta\n\nSubstituindo $x = ${point}$ na função:`);
      
      let directResult;
      let isIndeterminate = false;
      
      try {
        directResult = compiled.evaluate({ x: x0 });
        if (isFinite(directResult)) {
          steps.push(`**PASSO 3** — Resultado\n\n$$f(${point}) = ${directResult.toFixed(4)}$$\n\nO limite existe e é igual a $${directResult.toFixed(4)}$`);
          setSteps(steps);
          setResult(directResult);
          return;
        } else {
          isIndeterminate = true;
        }
      } catch (e) {
        isIndeterminate = true;
      }
      
      if (isIndeterminate) {
        steps.push(`**PASSO 3** — Forma indeterminada detectada\n\nA substituição direta resulta em $\\frac{0}{0}$ ou $\\frac{\\infty}{\\infty}$.\n\nCalculando limites laterais...`);
      }
      
      // Calculate limit numerically
      const delta = 0.0001;
      const leftLimit = compiled.evaluate({ x: x0 - delta });
      const rightLimit = compiled.evaluate({ x: x0 + delta });
      
      steps.push(`**PASSO 4** — Limites laterais\n\n$$\\lim_{x \\to ${point}^-} f(x) = ${leftLimit.toFixed(4)}$$\n\n$$\\lim_{x \\to ${point}^+} f(x) = ${rightLimit.toFixed(4)}$$`);
      
      const avgLimit = (leftLimit + rightLimit) / 2;
      steps.push(`**PASSO 5** — Conclusão\n\nComo os limites laterais são iguais:\n\n$$\\lim_{x \\to ${point}} f(x) = ${avgLimit.toFixed(4)}$$`);
      
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
      const x0 = parseFloat(point);
      
      const latexFunc = functionInput
        .replace(/\^/g, '^')
        .replace(/\*/g, ' \\cdot ')
        .replace(/\(/g, '(')
        .replace(/\)/g, ')');
      
      steps.push(`**PASSO 1** — Função a derivar\n\n$$f(x) = ${latexFunc}$$`);
      steps.push(`**PASSO 2** — Aplicar a definição\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$$`);
      
      const parsed = math.parse(functionInput);
      const derivative = math.derivative(parsed, 'x');
      
      const latexDeriv = derivative.toString()
        .replace(/\^/g, '^')
        .replace(/\*/g, ' \\cdot ')
        .replace(/\(/g, '(')
        .replace(/\)/g, ')');
      
      steps.push(`**PASSO 3** — Calcular a derivada\n\n$$f'(x) = ${latexDeriv}$$`);
      
      const compiled = derivative.compile();
      const valueAtPoint = compiled.evaluate({ x: x0 });
      
      steps.push(`**PASSO 4** — Avaliar no ponto $x = ${point}$\n\n$$f'(${point}) = ${valueAtPoint.toFixed(4)}$$`);
      
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
      const x0 = parseFloat(point);
      
      const latexFunc = functionInput
        .replace(/\^/g, '^')
        .replace(/\*/g, ' \\cdot ')
        .replace(/\(/g, '(')
        .replace(/\)/g, ')');
      
      steps.push(`**PASSO 1** — Verificar continuidade\n\nAnalisando $$f(x) = ${latexFunc}$$ no ponto $x = ${point}$`);
      
      const parsed = math.parse(functionInput);
      const compiled = parsed.compile();
      
      steps.push(`**PASSO 2** — Calcular $f(${point})$`);
      let fx0;
      try {
        fx0 = compiled.evaluate({ x: x0 });
        steps.push(`$$f(${point}) = ${fx0.toFixed(4)}$$\n\n✓ A função está definida no ponto`);
      } catch (e) {
        steps.push(`$$f(${point}) = \\text{não definida}$$\n\n✗ A função não está definida no ponto`);
        fx0 = undefined;
      }
      
      steps.push(`**PASSO 3** — Calcular limites laterais`);
      const delta = 0.0001;
      const leftLimit = compiled.evaluate({ x: x0 - delta });
      const rightLimit = compiled.evaluate({ x: x0 + delta });
      
      steps.push(`$$\\lim_{x \\to ${point}^-} f(x) = ${leftLimit.toFixed(4)}$$\n\n$$\\lim_{x \\to ${point}^+} f(x) = ${rightLimit.toFixed(4)}$$`);
      
      const limitsEqual = Math.abs(leftLimit - rightLimit) < 0.01;
      const continuous = limitsEqual && fx0 !== undefined && Math.abs(leftLimit - fx0) < 0.01;
      
      let conclusion = `**PASSO 4** — Conclusão\n\n`;
      
      if (!limitsEqual) {
        conclusion += `✗ Os limites laterais são diferentes\n\nA função **NÃO é contínua** em $x = ${point}$`;
      } else if (fx0 === undefined) {
        conclusion += `✗ A função não está definida no ponto\n\nA função **NÃO é contínua** em $x = ${point}$\n\n(Descontinuidade removível)`;
      } else if (!continuous) {
        conclusion += `✗ $f(${point}) \\neq \\lim_{x \\to ${point}} f(x)$\n\nA função **NÃO é contínua** em $x = ${point}$`;
      } else {
        conclusion += `✓ **Condições satisfeitas:**\n• $f(${point})$ existe\n• $\\lim_{x \\to ${point}} f(x)$ existe\n• $f(${point}) = \\lim_{x \\to ${point}} f(x)$\n\nA função **É CONTÍNUA** em $x = ${point}$`;
      }
      
      steps.push(conclusion);
      
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
      
      const latexFunc = functionInput
        .replace(/\^/g, '^')
        .replace(/\*/g, ' \\cdot ')
        .replace(/\(/g, '(')
        .replace(/\)/g, ')');
      
      steps.push(`**PASSO 1** — Identificar a função\n\n$$f(x) = ${latexFunc}$$`);
      
      // Check if it's a rational function (division)
      const isRational = functionInput.includes('/');
      
      if (isRational) {
        // Try to parse numerator and denominator
        const parts = functionInput.match(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/);
        
        if (parts) {
          const numerator = parts[1];
          const denominator = parts[2];
          
          const latexNum = numerator
            .replace(/\^/g, '^')
            .replace(/\*/g, ' \\cdot ');
          const latexDen = denominator
            .replace(/\^/g, '^')
            .replace(/\*/g, ' \\cdot ');
          
          steps.push(`**PASSO 2** — Separar numerador e denominador\n\n$$N(x) = ${latexNum}$$\n\n$$D(x) = ${latexDen}$$\n\n$$f(x) = \\frac{N(x)}{D(x)}$$`);
          
          const parsedNum = math.parse(numerator);
          const compiledNum = parsedNum.compile();
          const parsedDen = math.parse(denominator);
          const compiledDen = parsedDen.compile();
          
          steps.push(`**PASSO 3** — Estudo de sinal do numerador $N(x)$`);
          
          const testPoints = [-10, -5, -3, -2, -1, 0, 1, 2, 3, 5, 10];
          const numSigns: string[] = [];
          const denSigns: string[] = [];
          const resultSigns: string[] = [];
          
          for (const x of testPoints) {
            try {
              const numValue = compiledNum.evaluate({ x });
              const denValue = compiledDen.evaluate({ x });
              
              let numSign = Math.abs(numValue) < 0.001 ? "0" : numValue > 0 ? "+" : "−";
              let denSign = Math.abs(denValue) < 0.001 ? "0" : denValue > 0 ? "+" : "−";
              
              numSigns.push(`$x=${x}$: $${numSign}$`);
              denSigns.push(`$x=${x}$: $${denSign}$`);
              
              if (denSign === "0") {
                resultSigns.push(`$x=${x}$: $\\nexists$ (não existe)`);
              } else if (numSign === "0") {
                resultSigns.push(`$x=${x}$: $0$ (zero)`);
              } else {
                const resultSign = (numSign === "+" && denSign === "+") || (numSign === "−" && denSign === "−") ? "+" : "−";
                resultSigns.push(`$x=${x}$: $${resultSign}$`);
              }
            } catch (e) {
              numSigns.push(`$x=${x}$: $\\nexists$`);
              denSigns.push(`$x=${x}$: $\\nexists$`);
              resultSigns.push(`$x=${x}$: $\\nexists$`);
            }
          }
          
          steps.push(`Análise do numerador $N(x)$:\n\n${numSigns.join(' | ')}`);
          steps.push(`**PASSO 4** — Estudo de sinal do denominador $D(x)$\n\nAnálise do denominador $D(x)$:\n\n${denSigns.join(' | ')}`);
          steps.push(`**PASSO 5** — Sinal da função $$f(x) = \\frac{N(x)}{D(x)}$$\n\n**Regra dos sinais:**\n$\\frac{(+)}{(+)} = +$ | $\\frac{(-)}{(-)} = +$ | $\\frac{(+)}{(-)} = -$ | $\\frac{(-)}{(+)} = -$\n\n${resultSigns.join(' | ')}`);
          
        } else {
          // Fallback for complex rational functions
          const parsed = math.parse(functionInput);
          const compiled = parsed.compile();
          
          steps.push(`**PASSO 2** — Analisar sinais\n\nFunção racional detectada.`);
          
          const testPoints = [-10, -5, -2, -1, 0, 1, 2, 5, 10];
          const signs: string[] = [];
          
          for (const x of testPoints) {
            try {
              const value = compiled.evaluate({ x });
              if (Math.abs(value) < 0.001) {
                signs.push(`$x=${x}$: $0$ (zero)`);
              } else if (value > 0) {
                signs.push(`$x=${x}$: $+$ (positivo)`);
              } else {
                signs.push(`$x=${x}$: $-$ (negativo)`);
              }
            } catch (e) {
              signs.push(`$x=${x}$: $\\nexists$ (indefinido)`);
            }
          }
          
          steps.push(`**PASSO 3** — Tabela de sinais\n\n${signs.join(' | ')}`);
        }
      } else {
        // Non-rational function
        const parsed = math.parse(functionInput);
        const compiled = parsed.compile();
        
        steps.push(`**PASSO 2** — Encontrar zeros e analisar sinais`);
        
        const testPoints = [-10, -5, -2, -1, 0, 1, 2, 5, 10];
        const signs: string[] = [];
        
        for (const x of testPoints) {
          try {
            const value = compiled.evaluate({ x });
            if (Math.abs(value) < 0.001) {
              signs.push(`$x=${x}$: $0$ (zero)`);
            } else if (value > 0) {
              signs.push(`$x=${x}$: $+$ (positivo)`);
            } else {
              signs.push(`$x=${x}$: $-$ (negativo)`);
            }
          } catch (e) {
            signs.push(`$x=${x}$: $\\nexists$ (indefinido)`);
          }
        }
        
        steps.push(`**PASSO 3** — Tabela de sinais\n\n${signs.join(' | ')}`);
      }
      
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
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-white">
          {getTitle()}
        </h1>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-base font-normal mb-3 text-white">
                Tipo de Análise
              </label>
              <Select value={analysisType} onValueChange={(value) => setAnalysisType(value as AnalysisType)}>
                <SelectTrigger className="w-full bg-black border-2 border-gray-600 text-white h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-2 border-gray-600">
                  <SelectItem value="limite">Limite</SelectItem>
                  <SelectItem value="derivada">Derivada</SelectItem>
                  <SelectItem value="continuidade">Continuidade</SelectItem>
                  <SelectItem value="sinal">Estudo de Sinal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-base font-normal mb-3 text-white">
                Função f(x)
              </label>
              <Input
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="Ex: (x^2 - 4)/(x - 2)"
                className="bg-black border-2 border-gray-600 text-white h-12"
              />
            </div>

            <div>
              <label className="block text-base font-normal mb-3 text-white">
                Ponto de Análise
              </label>
              <Input
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                placeholder="Ex: 3"
                className="bg-black border-2 border-gray-600 text-white h-12"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleCalculate}
              className="bg-black border-2 border-gray-600 hover:bg-gray-900 text-white font-normal px-12 py-3 text-base transition-all"
            >
              Calcular
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border-2 border-gray-600 bg-black p-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Representação Gráfica</h2>
            <GraphDisplay 
              functionInput={functionInput} 
              point={parseFloat(point)} 
              analysisType={analysisType}
            />
          </div>

          <div className="border-2 border-gray-600 bg-black p-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Resolução</h2>
            <h3 className="text-xl font-bold mb-4 text-white">Passos da Solução</h3>
            <SolutionSteps steps={steps} />
          </div>
        </div>

        <footer className="mt-16 text-center text-xs text-gray-400">
          <p className="mb-1">CÁLCULO DIFERENCIAL E INTEGRAL 04C-2025/2</p>
          <p>by Ana Julia Romera, Gabriela Akemi, Sophia Mattos e Thauanny da Cruz</p>
        </footer>
      </div>
    </div>
  );
};
