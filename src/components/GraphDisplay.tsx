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
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Graph settings
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 40;

    // Draw grid
    ctx.strokeStyle = "#1f1f1f";
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
    ctx.strokeStyle = "#3f3f3f";
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

      // Draw point of analysis
      if (isFinite(point)) {
        const px = centerX + point * scale;
        try {
          const y = compiled.evaluate({ x: point });
          const py = centerY - y * scale;

          if (isFinite(y) && Math.abs(y) < 100) {
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, 2 * Math.PI);
            ctx.fill();

            // Draw vertical line
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, height);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        } catch (e) {
          // Point not defined
        }
      }

      // Add legend
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px monospace";
      ctx.textAlign = "left";
      ctx.fillText("— Função original", 20, height - 60);
      
      ctx.fillStyle = "#ef4444";
      ctx.fillText("● Pontos importantes", 20, height - 35);

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
      className="w-full h-[400px] rounded-lg border border-border"
      style={{ imageRendering: "pixelated" }}
    />
  );
};
