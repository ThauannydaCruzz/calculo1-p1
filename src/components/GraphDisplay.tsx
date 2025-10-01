import { useEffect, useRef } from "react";
import * as math from "mathjs";

interface GraphDisplayProps {
  functionInput: string;
  point: number;
  analysisType: string;
}

export const GraphDisplay = ({ functionInput, point, analysisType }: GraphDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Graph settings
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 40;

    // Draw grid
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = "#888888";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";

    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      const x = centerX + i * scale;
      if (x >= 0 && x <= width) {
        ctx.fillText(i.toString(), x, centerY + 15);
      }

      const y = centerY - i * scale;
      if (y >= 0 && y <= height) {
        ctx.fillText(i.toString(), centerX + 15, y + 5);
      }
    }

    // Plot function
    try {
      const parsed = math.parse(functionInput);
      const compiled = parsed.compile();

      ctx.strokeStyle = "#2dd4bf";
      ctx.lineWidth = 3;
      ctx.beginPath();

      let started = false;

      for (let px = 0; px < width; px++) {
        const x = (px - centerX) / scale;
        try {
          const y = compiled.evaluate({ x });
          const py = centerY - y * scale;

          if (isFinite(y) && Math.abs(y) < 100) {
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        } catch (e) {
          started = false;
        }
      }

      ctx.stroke();

      // Draw point of analysis and detect discontinuities
      if (isFinite(point)) {
        const px = centerX + point * scale;
        const delta = 0.0001;
        
        try {
          const y = compiled.evaluate({ x: point });
          const yLeft = compiled.evaluate({ x: point - delta });
          const yRight = compiled.evaluate({ x: point + delta });
          
          // Check if there's a removable discontinuity
          const isRemovableDiscontinuity = !isFinite(y) && 
                                           isFinite(yLeft) && 
                                           isFinite(yRight) && 
                                           Math.abs(yLeft - yRight) < 0.1;

          if (isRemovableDiscontinuity) {
            // Draw open circle at the limit value
            const limitY = (yLeft + yRight) / 2;
            const py = centerY - limitY * scale;
            
            if (Math.abs(limitY) < 100) {
              // Draw white circle with hollow center
              ctx.strokeStyle = "#ef4444";
              ctx.fillStyle = "#000000";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(px, py, 7, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
            }
          } else if (isFinite(y) && Math.abs(y) < 100) {
            // Normal point - filled circle
            const py = centerY - y * scale;
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, 2 * Math.PI);
            ctx.fill();
          }

          // Draw vertical line
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(px, 0);
          ctx.lineTo(px, height);
          ctx.stroke();
          ctx.setLineDash([]);
          
        } catch (e) {
          // Point not defined - try to draw open circle if limit exists
          try {
            const yLeft = compiled.evaluate({ x: point - delta });
            const yRight = compiled.evaluate({ x: point + delta });
            
            if (isFinite(yLeft) && isFinite(yRight) && Math.abs(yLeft - yRight) < 0.1) {
              const limitY = (yLeft + yRight) / 2;
              const py = centerY - limitY * scale;
              
              if (Math.abs(limitY) < 100) {
                ctx.strokeStyle = "#ef4444";
                ctx.fillStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(px, py, 7, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
              }
            }
            
            // Draw vertical line anyway
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, height);
            ctx.stroke();
            ctx.setLineDash([]);
          } catch (e2) {
            // Really undefined
          }
        }
      }

      // Add legend at bottom center
      const legendY = height - 20;
      ctx.font = "13px monospace";
      ctx.textAlign = "center";
      
      // Measure text widths to position elements
      const legendSpacing = 150;
      const startX = centerX - legendSpacing;
      
      // Function line indicator
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, legendY);
      ctx.lineTo(startX + 30, legendY);
      ctx.stroke();
      
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText("Função original", startX + 40, legendY + 4);
      
      // Derivative/Auxiliary line indicator (dashed)
      ctx.strokeStyle = "#888888";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startX + legendSpacing, legendY);
      ctx.lineTo(startX + legendSpacing + 30, legendY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = "#888888";
      ctx.fillText("Derivada/Auxiliar", startX + legendSpacing + 40, legendY + 4);
      
      // Important points indicator
      const pointX = startX + legendSpacing * 2 + 50;
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(pointX + 10, legendY, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Pontos importantes", pointX + 25, legendY + 4);

    } catch (error) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Erro ao plotar função", centerX, centerY);
    }
  }, [functionInput, point, analysisType]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[500px] rounded-none border-2 border-gray-700 bg-black"
      style={{ imageRendering: "auto" }}
    />
  );
};
