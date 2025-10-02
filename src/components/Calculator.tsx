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
  const [variable, setVariable] = useState("x");
  const [point, setPoint] = useState("3");
  const [result, setResult] = useState<any>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const calculateLimit = () => {
    try {
      const steps: string[] = [];
      const x0 = parseFloat(point);
      
      // Convert function to LaTeX
      const latexFunc = functionInput
        .replace(/\^/g, '^')
        .replace(/\*/g, ' \\cdot ')
        .replace(/sqrt/g, '\\sqrt');
      
      steps.push(`PASSO 1 — Calcular o limite\n\n$$\\lim_{x \\to ${point}} ${latexFunc}$$`);
      
      // Parse the function
      const parsed = math.parse(functionInput);
      const compiled = parsed.compile();
      
      // Try direct substitution
      steps.push(`PASSO 2 — Substituição direta\n\nSubstituindo $x = ${point}$ na função:`);
      
      let directResult;
      let isIndeterminate = false;
      
      try {
        directResult = compiled.evaluate({ x: x0 });
        if (isFinite(directResult)) {
          steps.push(`PASSO 3 — Resultado\n\n$$f(${point}) = ${directResult.toFixed(6)}$$\n\nComo a função está definida no ponto, o limite é:\n\n$$\\lim_{x \\to ${point}} f(x) = ${directResult.toFixed(6)}$$`);
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
        steps.push(`PASSO 3 — Forma indeterminada\n\nA substituição direta resulta em indeterminação ($\\frac{0}{0}$ ou $\\frac{\\infty}{\\infty}$).\n\nCalculando limites laterais para determinar o comportamento:`);
      }
      
      // Calculate limit with higher precision
      const deltas = [0.1, 0.01, 0.001, 0.0001, 0.00001];
      let leftLimits = [];
      let rightLimits = [];
      
      for (const delta of deltas) {
        try {
          leftLimits.push(compiled.evaluate({ x: x0 - delta }));
          rightLimits.push(compiled.evaluate({ x: x0 + delta }));
        } catch (e) {
          // Skip if error
        }
      }
      
      // Get the most precise limits (last valid ones)
      const leftLimit = leftLimits[leftLimits.length - 1];
      const rightLimit = rightLimits[rightLimits.length - 1];
      
      steps.push(`PASSO 4 — Limites laterais\n\nCalculando valores cada vez mais próximos de $x = ${point}$:\n\n$$\\lim_{x \\to ${point}^-} f(x) = ${leftLimit.toFixed(6)}$$\n\n$$\\lim_{x \\to ${point}^+} f(x) = ${rightLimit.toFixed(6)}$$`);
      
      const tolerance = 0.001;
      const limitsEqual = Math.abs(leftLimit - rightLimit) < tolerance;
      
      if (limitsEqual) {
        const avgLimit = (leftLimit + rightLimit) / 2;
        steps.push(`PASSO 5 — Conclusão\n\nComo os limites laterais são iguais (diferença < ${tolerance}):\n\n$$\\lim_{x \\to ${point}} f(x) = ${avgLimit.toFixed(6)}$$\n\nObservação: Há uma descontinuidade removível em $x = ${point}$`);
        setSteps(steps);
        setResult(avgLimit);
      } else {
        steps.push(`PASSO 5 — Conclusão\n\nComo os limites laterais são diferentes:\n\n$$\\lim_{x \\to ${point}^-} f(x) \\neq \\lim_{x \\to ${point}^+} f(x)$$\n\nO limite não existe neste ponto.`);
        setSteps(steps);
        setResult("Não existe");
      }
    } catch (error) {
      setSteps(["ERRO — Verifique a sintaxe da função\n\nUse notação matemática: x^2 para potência, * para multiplicação, / para divisão.\n\nExemplo: (x^2 - 4)/(x - 2)"]);
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
        .replace(/sqrt/g, '\\sqrt');
      
      steps.push(`PASSO 1 — Função a derivar\n\n$$f(x) = ${latexFunc}$$`);
      steps.push(`PASSO 2 — Definição de derivada\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$$\n\nAplicando regras de derivação:`);
      
      const parsed = math.parse(functionInput);
      
      // Calculate derivative
      let derivative;
      try {
        derivative = math.derivative(parsed, 'x');
      } catch (e) {
        steps.push(`ERRO — Não foi possível calcular a derivada automaticamente.\n\nVerifique se a função é derivável.`);
        setSteps(steps);
        setResult(null);
        return;
      }
      
      const latexDeriv = derivative.toString()
        .replace(/\^/g, '^')
        .replace(/\*/g, ' \\cdot ')
        .replace(/sqrt/g, '\\sqrt');
      
      steps.push(`PASSO 3 — Derivada calculada\n\n$$f'(x) = ${latexDeriv}$$`);
      
      // Evaluate at the point
      const compiled = derivative.compile();
      let valueAtPoint;
      
      try {
        valueAtPoint = compiled.evaluate({ x: x0 });
        
        if (!isFinite(valueAtPoint)) {
          steps.push(`PASSO 4 — Avaliação no ponto $x = ${point}$\n\n$$f'(${point}) = \\text{indefinido}$$\n\nA derivada não existe neste ponto (possivelmente uma descontinuidade ou ponto de inflexão vertical).`);
        } else {
          steps.push(`PASSO 4 — Avaliação no ponto $x = ${point}$\n\n$$f'(${point}) = ${valueAtPoint.toFixed(6)}$$\n\nInterpretação geométrica:\n• Se $f'(${point}) > 0$: a função é crescente em $x = ${point}$\n• Se $f'(${point}) < 0$: a função é decrescente em $x = ${point}$\n• Se $f'(${point}) = 0$: possível ponto crítico (máximo, mínimo ou inflexão)`);
        }
      } catch (e) {
        steps.push(`PASSO 4 — Avaliação no ponto $x = ${point}$\n\n$$f'(${point}) = \\text{indefinido}$$\n\nA derivada não está definida neste ponto.`);
        valueAtPoint = undefined;
      }
      
      setSteps(steps);
      setResult(derivative.toString());
    } catch (error) {
      setSteps(["ERRO — Verifique a sintaxe da função\n\nUse notação matemática correta."]);
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
        .replace(/sqrt/g, '\\sqrt');
      
      steps.push(`PASSO 1 — Verificar continuidade\n\nAnalisando a função $$f(x) = ${latexFunc}$$ no ponto $x = ${point}$\n\nUma função é contínua em um ponto se:\n1. $f(a)$ existe\n2. $\\lim_{x \\to a} f(x)$ existe\n3. $\\lim_{x \\to a} f(x) = f(a)$`);
      
      const parsed = math.parse(functionInput);
      const compiled = parsed.compile();
      
      // Check if f(a) exists
      steps.push(`PASSO 2 — Verificar se $f(${point})$ existe`);
      let fx0;
      let fx0Exists = false;
      
      try {
        fx0 = compiled.evaluate({ x: x0 });
        if (isFinite(fx0)) {
          steps.push(`$$f(${point}) = ${fx0.toFixed(6)}$$\n\n✓ Condição 1 satisfeita: $f(${point})$ existe`);
          fx0Exists = true;
        } else {
          steps.push(`$$f(${point}) = \\text{indefinido}$$\n\n✗ Condição 1 não satisfeita: $f(${point})$ não existe`);
        }
      } catch (e) {
        steps.push(`$$f(${point}) = \\text{não definido}$$\n\n✗ Condição 1 não satisfeita: $f(${point})$ não está no domínio`);
      }
      
      // Calculate limits
      steps.push(`PASSO 3 — Verificar se $\\lim_{x \\to ${point}} f(x)$ existe\n\nCalculando limites laterais:`);
      
      const deltas = [0.1, 0.01, 0.001, 0.0001];
      let leftLimits = [];
      let rightLimits = [];
      
      for (const delta of deltas) {
        try {
          const left = compiled.evaluate({ x: x0 - delta });
          const right = compiled.evaluate({ x: x0 + delta });
          if (isFinite(left)) leftLimits.push(left);
          if (isFinite(right)) rightLimits.push(right);
        } catch (e) {
          // Skip
        }
      }
      
      if (leftLimits.length === 0 || rightLimits.length === 0) {
        steps.push(`Os limites laterais não puderam ser calculados.\n\n✗ Condição 2 não satisfeita: o limite não existe`);
        steps.push(`CONCLUSÃO\n\nA função NÃO É CONTÍNUA em $x = ${point}$`);
        setSteps(steps);
        setResult("Descontínua");
        return;
      }
      
      const leftLimit = leftLimits[leftLimits.length - 1];
      const rightLimit = rightLimits[rightLimits.length - 1];
      
      steps.push(`$$\\lim_{x \\to ${point}^-} f(x) = ${leftLimit.toFixed(6)}$$\n\n$$\\lim_{x \\to ${point}^+} f(x) = ${rightLimit.toFixed(6)}$$`);
      
      const tolerance = 0.001;
      const limitsEqual = Math.abs(leftLimit - rightLimit) < tolerance;
      const limitValue = (leftLimit + rightLimit) / 2;
      
      if (!limitsEqual) {
        steps.push(`✗ Condição 2 não satisfeita: limites laterais diferentes\n\n$$\\lim_{x \\to ${point}^-} f(x) \\neq \\lim_{x \\to ${point}^+} f(x)$$`);
        steps.push(`CONCLUSÃO\n\nA função NÃO É CONTÍNUA em $x = ${point}$\n\nTipo: Descontinuidade de salto (jump discontinuity)`);
        setSteps(steps);
        setResult("Descontínua");
        return;
      }
      
      steps.push(`✓ Condição 2 satisfeita: $\\lim_{x \\to ${point}} f(x) = ${limitValue.toFixed(6)}$`);
      
      // Check if limit equals function value
      steps.push(`PASSO 4 — Verificar se $\\lim_{x \\to ${point}} f(x) = f(${point})$`);
      
      if (!fx0Exists) {
        steps.push(`✗ Condição 3 não satisfeita: $f(${point})$ não existe\n\nCONCLUSÃO\n\nA função NÃO É CONTÍNUA em $x = ${point}$\n\nTipo: Descontinuidade removível\n\nPara tornar a função contínua, basta redefinir: $f(${point}) = ${limitValue.toFixed(6)}$`);
        setSteps(steps);
        setResult("Descontínua");
        return;
      }
      
      const valuesEqual = Math.abs(fx0 - limitValue) < tolerance;
      
      if (!valuesEqual) {
        steps.push(`$$f(${point}) = ${fx0.toFixed(6)}$$\n$$\\lim_{x \\to ${point}} f(x) = ${limitValue.toFixed(6)}$$\n\n✗ Condição 3 não satisfeita: $f(${point}) \\neq \\lim_{x \\to ${point}} f(x)$\n\nCONCLUSÃO\n\nA função NÃO É CONTÍNUA em $x = ${point}$\n\nTipo: Descontinuidade removível`);
        setSteps(steps);
        setResult("Descontínua");
        return;
      }
      
      steps.push(`$$f(${point}) = ${fx0.toFixed(6)} = \\lim_{x \\to ${point}} f(x)$$\n\n✓ Condição 3 satisfeita\n\nCONCLUSÃO\n\nA função É CONTÍNUA em $x = ${point}$\n\nTodas as três condições foram satisfeitas.`);
      
      setSteps(steps);
      setResult("Contínua");
    } catch (error) {
      setSteps(["ERRO — Verifique a sintaxe da função"]);
      setResult(null);
    }
  };

  const analyzeSign = () => {
    try {
      const steps: string[] = [];
      
      const latexFunc = functionInput
        .replace(/\^/g, '^')
        .replace(/\*/g, ' \\cdot ')
        .replace(/sqrt/g, '\\sqrt');
      
      steps.push(`PASSO 1 — Identificar a função\n\n$$f(x) = ${latexFunc}$$`);
      
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
          
          steps.push(`PASSO 2 — Separar numerador e denominador\n\n$$N(x) = ${latexNum}$$\n\n$$D(x) = ${latexDen}$$\n\n$$f(x) = \\frac{N(x)}{D(x)}$$`);
          
          const parsedNum = math.parse(numerator);
          const compiledNum = parsedNum.compile();
          const parsedDen = math.parse(denominator);
          const compiledDen = parsedDen.compile();
          
          // Find zeros of numerator and denominator
          steps.push(`PASSO 3 — Encontrar zeros do numerador $N(x)$\n\nZeros são valores onde $N(x) = 0$`);
          
          const rangePoints = [];
          for (let x = -20; x <= 20; x += 0.5) {
            rangePoints.push(x);
          }
          
          const numZeros = [];
          const denZeros = [];
          
          // Find sign changes for zeros
          for (let i = 0; i < rangePoints.length - 1; i++) {
            try {
              const x1 = rangePoints[i];
              const x2 = rangePoints[i + 1];
              
              const n1 = compiledNum.evaluate({ x: x1 });
              const n2 = compiledNum.evaluate({ x: x2 });
              
              if (Math.abs(n1) < 0.01) numZeros.push(x1);
              if (n1 * n2 < 0) {
                // Sign change detected, zero between x1 and x2
                const zero = (x1 + x2) / 2;
                numZeros.push(zero);
              }
            } catch (e) {
              // Skip
            }
          }
          
          for (let i = 0; i < rangePoints.length - 1; i++) {
            try {
              const x1 = rangePoints[i];
              const x2 = rangePoints[i + 1];
              
              const d1 = compiledDen.evaluate({ x: x1 });
              const d2 = compiledDen.evaluate({ x: x2 });
              
              if (Math.abs(d1) < 0.01) denZeros.push(x1);
              if (d1 * d2 < 0) {
                const zero = (x1 + x2) / 2;
                denZeros.push(zero);
              }
            } catch (e) {
              // Skip
            }
          }
          
          // Remove duplicates and sort
          const uniqueNumZeros = [...new Set(numZeros.map(z => Math.round(z * 2) / 2))].sort((a, b) => a - b);
          const uniqueDenZeros = [...new Set(denZeros.map(z => Math.round(z * 2) / 2))].sort((a, b) => a - b);
          
          if (uniqueNumZeros.length > 0) {
            steps.push(`Zeros de $N(x)$: ${uniqueNumZeros.map(z => `$x = ${z}$`).join(', ')}`);
          } else {
            steps.push(`$N(x)$ não possui zeros reais no intervalo analisado`);
          }
          
          steps.push(`PASSO 4 — Encontrar zeros do denominador $D(x)$\n\nZeros são valores onde $D(x) = 0$ (pontos de descontinuidade)`);
          
          if (uniqueDenZeros.length > 0) {
            steps.push(`Zeros de $D(x)$: ${uniqueDenZeros.map(z => `$x = ${z}$`).join(', ')}\n\nA função não está definida nestes pontos!`);
          } else {
            steps.push(`$D(x)$ não possui zeros reais (função definida em todo $\\mathbb{R}$)`);
          }
          
          // Create comprehensive sign analysis
          steps.push(`PASSO 5 — Tabela de sinais completa`);
          
          const criticalPoints = [...uniqueNumZeros, ...uniqueDenZeros].sort((a, b) => a - b);
          const testPoints = [-15, ...criticalPoints, 15];
          
          let signTable = `\n| $x$ | $N(x)$ | $D(x)$ | $f(x) = \\frac{N(x)}{D(x)}$ |\n|---|---|---|---|\n`;
          
          for (let i = 0; i < testPoints.length - 1; i++) {
            const testX = (testPoints[i] + testPoints[i + 1]) / 2;
            
            try {
              const numValue = compiledNum.evaluate({ x: testX });
              const denValue = compiledDen.evaluate({ x: testX });
              
              const numSign = Math.abs(numValue) < 0.001 ? "0" : numValue > 0 ? "+" : "−";
              const denSign = Math.abs(denValue) < 0.001 ? "0" : denValue > 0 ? "+" : "−";
              
              let resultSign;
              if (denSign === "0") {
                resultSign = "∄";
              } else if (numSign === "0") {
                resultSign = "0";
              } else {
                resultSign = (numSign === "+" && denSign === "+") || (numSign === "−" && denSign === "−") ? "+" : "−";
              }
              
              const interval = i === 0 
                ? `$x < ${testPoints[i + 1].toFixed(1)}$`
                : i === testPoints.length - 2
                ? `$x > ${testPoints[i].toFixed(1)}$`
                : `$${testPoints[i].toFixed(1)} < x < ${testPoints[i + 1].toFixed(1)}$`;
              
              signTable += `| ${interval} | $${numSign}$ | $${denSign}$ | $${resultSign}$ |\n`;
            } catch (e) {
              // Skip
            }
          }
          
          steps.push(signTable);
          steps.push(`Legenda:\n• $+$ : positivo\n• $-$ : negativo\n• $0$ : zero\n• $\\nexists$ : não existe`);
          
        } else {
          // Fallback for complex rational functions
          const parsed = math.parse(functionInput);
          const compiled = parsed.compile();
          
          steps.push(`PASSO 2 — Analisar sinais da função racional`);
          
          const testPoints = [-10, -5, -2, -1, 0, 1, 2, 5, 10];
          const signs: string[] = [];
          
          for (const x of testPoints) {
            try {
              const value = compiled.evaluate({ x });
              if (Math.abs(value) < 0.001) {
                signs.push(`$x=${x}$: $0$`);
              } else if (!isFinite(value)) {
                signs.push(`$x=${x}$: $\\nexists$`);
              } else if (value > 0) {
                signs.push(`$x=${x}$: $+$`);
              } else {
                signs.push(`$x=${x}$: $-$`);
              }
            } catch (e) {
              signs.push(`$x=${x}$: $\\nexists$`);
            }
          }
          
          steps.push(`Tabela de sinais:\n\n${signs.join(' | ')}`);
        }
      } else {
        // Non-rational function
        const parsed = math.parse(functionInput);
        const compiled = parsed.compile();
        
        steps.push(`PASSO 2 — Encontrar zeros da função\n\nZeros são valores onde $f(x) = 0$`);
        
        // Find zeros
        const rangePoints = [];
        for (let x = -20; x <= 20; x += 0.5) {
          rangePoints.push(x);
        }
        
        const zeros = [];
        for (let i = 0; i < rangePoints.length - 1; i++) {
          try {
            const x1 = rangePoints[i];
            const x2 = rangePoints[i + 1];
            
            const y1 = compiled.evaluate({ x: x1 });
            const y2 = compiled.evaluate({ x: x2 });
            
            if (Math.abs(y1) < 0.01) zeros.push(x1);
            if (y1 * y2 < 0) {
              zeros.push((x1 + x2) / 2);
            }
          } catch (e) {
            // Skip
          }
        }
        
        const uniqueZeros = [...new Set(zeros.map(z => Math.round(z * 2) / 2))].sort((a, b) => a - b);
        
        if (uniqueZeros.length > 0) {
          steps.push(`Zeros encontrados: ${uniqueZeros.map(z => `$x = ${z}$`).join(', ')}`);
        } else {
          steps.push(`Não foram encontrados zeros reais no intervalo analisado`);
        }
        
        steps.push(`PASSO 3 — Tabela de sinais\n\nAnalisando o sinal da função em diferentes intervalos:`);
        
        const testPoints = [-15, ...uniqueZeros, 15];
        let signTable = `\n| Intervalo | Sinal de $f(x)$ |\n|---|---|\n`;
        
        for (let i = 0; i < testPoints.length - 1; i++) {
          const testX = (testPoints[i] + testPoints[i + 1]) / 2;
          
          try {
            const value = compiled.evaluate({ x: testX });
            const sign = Math.abs(value) < 0.001 ? "0" : value > 0 ? "+" : "−";
            
            const interval = i === 0 
              ? `$x < ${testPoints[i + 1].toFixed(1)}$`
              : i === testPoints.length - 2
              ? `$x > ${testPoints[i].toFixed(1)}$`
              : `$${testPoints[i].toFixed(1)} < x < ${testPoints[i + 1].toFixed(1)}$`;
            
            signTable += `| ${interval} | $${sign}$ |\n`;
          } catch (e) {
            // Skip
          }
        }
        
        steps.push(signTable);
      }
      
      setSteps(steps);
      setResult("Análise completa");
    } catch (error) {
      setSteps(["ERRO — Verifique a sintaxe da função"]);
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

            {analysisType === "limite" ? (
              <div>
                <label className="block text-base font-normal mb-4 text-white">
                  Limite
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-white text-xl font-medium">lim</span>
                    <div className="flex items-center gap-2 text-white text-base mt-1">
                      <span>x</span>
                      <span>→</span>
                      <Input
                        value={point}
                        onChange={(e) => setPoint(e.target.value)}
                        placeholder="valor"
                        className="bg-black border-2 border-gray-600 text-white h-10 w-20 px-2 text-center"
                      />
                    </div>
                  </div>
                  <Input
                    value={functionInput}
                    onChange={(e) => setFunctionInput(e.target.value)}
                    placeholder="expressão"
                    className="bg-black border-2 border-gray-600 text-white h-14 flex-1 px-4"
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
