"use client";

import React, { useEffect, useRef } from "react";

export default function BackgroundVideo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Grid scrolling offset
    let gridOffset = 0;

    // Particle nodes for ambient Web3 blockchain network
    const particlesCount = Math.min(Math.floor((width * height) / 10000), 100);
    const particles: {
      x: number;
      y: number;
      z: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      pulse: number;
    }[] = [];

    const colors = ["#00f3ff", "#b026ff", "#00ff9d", "#3b82f6", "#ff007f"];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.5,
        radius: Math.random() * 2.5 + 1.2,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Floating 3D Wireframe Orbs/Cubes in background
    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Deep Cyberpunk Mesh Background
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 3,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, "#080e21");
      bgGrad.addColorStop(0.5, "#030712");
      bgGrad.addColorStop(1, "#02040a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Perspective Grid Lines (Scrolling Horizon)
      gridOffset = (gridOffset + 0.4) % 40;
      ctx.save();
      ctx.strokeStyle = "rgba(0, 243, 255, 0.07)";
      ctx.lineWidth = 1;

      // Vertical perspective grid lines
      const centerX = width / 2;
      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(centerX + (x - centerX) * 0.2, height * 0.2);
        ctx.stroke();
      }

      // Horizontal moving grid lines
      for (let y = height * 0.2; y < height; y += 30) {
        const adjustedY = y + (gridOffset % 30);
        if (adjustedY < height) {
          ctx.beginPath();
          ctx.moveTo(0, adjustedY);
          ctx.lineTo(width, adjustedY);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 3. Render 3D Rotating Wireframe Cube in Background
      angleX += 0.005;
      angleY += 0.007;
      ctx.save();
      ctx.translate(width * 0.85, height * 0.25);
      ctx.strokeStyle = "rgba(176, 38, 255, 0.18)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#b026ff";
      ctx.shadowBlur = 15;

      const size = 120;
      const vertices = [
        [-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size],
        [-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size],
      ];

      const projected = vertices.map(([x, y, z]) => {
        // Rotate X
        let rad = angleX;
        let y1 = y * Math.cos(rad) - z * Math.sin(rad);
        let z1 = y * Math.sin(rad) + z * Math.cos(rad);
        // Rotate Y
        rad = angleY;
        let x2 = x * Math.cos(rad) + z1 * Math.sin(rad);
        let z2 = -x * Math.sin(rad) + z1 * Math.cos(rad);
        const fov = 400;
        const scale = fov / (fov + z2 + 300);
        return [x2 * scale, y1 * scale];
      });

      const edges = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
      ];

      edges.forEach(([u, v]) => {
        ctx.beginPath();
        ctx.moveTo(projected[u][0], projected[u][1]);
        ctx.lineTo(projected[v][0], projected[v][1]);
        ctx.stroke();
      });
      ctx.restore();

      // 4. Render Dynamic Particles with Glowing Connections & Pulse
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.025;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.25;

        ctx.save();
        ctx.globalAlpha = Math.max(0.15, Math.min(1, currentAlpha));
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1 + Math.sin(p.pulse) * 0.35), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Neural Connecting Lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / 160) * 0.3;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.2;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950">
      {/* Dynamic Cyberpunk Canvas Motion Engine */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Vibrant Neon Lighting Nebulae */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-cyan-500/30 via-blue-600/20 to-transparent blur-[160px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-purple-600/30 via-pink-600/20 to-transparent blur-[180px] animate-pulse" />
      <div className="absolute top-[35%] right-[25%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[150px]" />
      <div className="absolute top-[60%] left-[15%] w-[450px] h-[450px] rounded-full bg-rose-500/15 blur-[140px]" />

      {/* High Readability Subtle Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950/70" />
    </div>
  );
}
