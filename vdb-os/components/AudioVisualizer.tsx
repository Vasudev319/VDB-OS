import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let animationId: number;
    let time = 0;

    // Create a fallback buffer for idle animation
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      time += 0.01;

      ctx.clearRect(0, 0, rect.width, rect.height);

      if (isActive && analyser) {
        analyser.getByteTimeDomainData(dataArray);
      }

      // Draw three overlapping waves for that "Gemini" look
      // Wave 1: Blue
      drawWave(ctx, rect, dataArray, isActive, time, '#4285F4', 1.0);
      // Wave 2: Red
      drawWave(ctx, rect, dataArray, isActive, time + 2, '#DB4437', 0.8);
      // Wave 3: Purple/Blue mix
      drawWave(ctx, rect, dataArray, isActive, time + 4, '#A142F4', 0.6);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, isActive]);

  const drawWave = (
    ctx: CanvasRenderingContext2D,
    rect: DOMRect,
    data: Uint8Array,
    isActive: boolean,
    offset: number,
    color: string,
    opacity: number
  ) => {
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.beginPath();

    const sliceWidth = rect.width * 1.0 / (data.length || 100);
    let x = 0;

    const centerY = rect.height / 2;

    for (let i = 0; i < (data.length || 100); i++) {
      let v = 0;
      if (isActive && data.length > 0) {
        // Normalize 128 as center
        v = (data[i] / 128.0) - 1;
      } else {
        // Idle sine wave
        v = Math.sin((i * 0.1) + (offset * 5)) * 0.05;
      }

      // Smooth the visualization data
      const y = centerY + (v * (rect.height / 3));

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Quadratic bezier for smoothness
        // ctx.lineTo(x, y);
        // Or just lineTo for performance, but smoothed via high sample rate usually looks ok
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
    ctx.globalAlpha = 1.0;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none"
    />
  );
};

export default AudioVisualizer;