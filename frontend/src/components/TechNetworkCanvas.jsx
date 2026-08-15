import { useEffect, useRef } from 'react';
import './TechNetworkCanvas.css';

export default function TechNetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse & Scroll interaction targets
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, active: false };
    let scrollY = window.scrollY || 0;
    let targetScrollY = scrollY;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNetwork();
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY || 0;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3D Projection configuration
    const fov = 400;
    const isMobile = width < 768;
    const nodeCount = isMobile ? 35 : (width > 1400 ? 90 : 65);
    const maxConnectionDistance = isMobile ? 120 : 160;

    let nodes = [];
    let dataPulses = [];
    let wireframes = [];

    // Initialize 3D nodes
    function initNetwork() {
      nodes = [];
      dataPulses = [];
      wireframes = [];

      const currentCount = isMobile ? 35 : (width > 1400 ? 90 : 65);

      for (let i = 0; i < currentCount; i++) {
        const isGold = Math.random() > 0.72; // Star Gold accent nodes
        nodes.push({
          x: (Math.random() - 0.5) * width * 1.4,
          y: (Math.random() - 0.5) * height * 1.5,
          z: (Math.random() - 0.5) * 500,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          vz: (Math.random() - 0.5) * 0.25,
          radius: isGold ? Math.random() * 2.2 + 1.8 : Math.random() * 1.6 + 1.1,
          isGold,
          pulseAngle: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          baseAlpha: isGold ? 0.75 : 0.45,
        });
      }

      // Background geometric wireframes (slow rotating 3D diamonds/cubes in distance)
      if (!isMobile) {
        wireframes.push({
          x: width * 0.2,
          y: height * 0.3,
          z: -180,
          size: 70,
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          speedX: 0.002,
          speedY: 0.003,
        });
        wireframes.push({
          x: width * 0.82,
          y: height * 0.65,
          z: -120,
          size: 90,
          rotX: 0.4,
          rotY: 0.2,
          rotZ: 0,
          speedX: -0.0025,
          speedY: 0.002,
        });
      }
    }

    initNetwork();

    // Data packet traveling along connection edge
    function spawnDataPulse(nodeA, nodeB) {
      if (dataPulses.length > (isMobile ? 8 : 18)) return;
      dataPulses.push({
        nodeA,
        nodeB,
        progress: 0,
        speed: Math.random() * 0.012 + 0.008,
        isGold: nodeA.isGold || nodeB.isGold,
      });
    }

    let lastTime = performance.now();

    // Main animation loop
    function render(currentTime) {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // --- Layer 1: Background Atmospheric Glow & Digital Grid ---
      const bgGrad = ctx.createRadialGradient(
        width * 0.5 + (mouse.x - width * 0.5) * 0.05,
        height * 0.4 + (mouse.y - height * 0.4) * 0.05 - (scrollY * 0.08) % height,
        100,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(22, 50, 79, 0.16)');
      bgGrad.addColorStop(0.5, 'rgba(14, 38, 58, 0.08)');
      bgGrad.addColorStop(1, 'rgba(8, 18, 28, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Very faint digital grid
      const gridSize = 80;
      const gridOffsetY = -(scrollY * 0.15) % gridSize;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.025)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = gridOffsetY; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Render subtle background geometric wireframe
      wireframes.forEach((wf) => {
        wf.rotX += wf.speedX;
        wf.rotY += wf.speedY;
        drawWireframe(ctx, wf, width, height, fov, scrollY);
      });

      // --- Layer 2: 3D Network Nodes & Proximity Connections ---
      const cameraTiltX = (mouse.y - height / 2) * 0.00015;
      const cameraTiltY = (mouse.x - width / 2) * 0.00015;
      const scrollOffset = scrollY * 0.2;

      // Update and project nodes
      const projectedNodes = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;
          node.z += node.vz;
          node.pulseAngle += node.pulseSpeed;

          // Boundary wrapping with soft margin
          const boundX = width * 0.75;
          const boundY = height * 0.8;
          if (node.x < -boundX) node.x = boundX;
          if (node.x > boundX) node.x = -boundX;
          if (node.y < -boundY) node.y = boundY;
          if (node.y > boundY) node.y = -boundY;
          if (node.z < -250) node.z = 250;
          if (node.z > 250) node.z = -250;

          // Subtle cursor deflection
          if (mouse.active) {
            const screenX = width / 2 + node.x;
            const screenY = height / 2 + node.y - (scrollOffset % height);
            const dx = mouse.x - screenX;
            const dy = mouse.y - screenY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180 && dist > 1) {
              const force = (180 - dist) / 180;
              node.x -= (dx / dist) * force * 0.6;
              node.y -= (dy / dist) * force * 0.6;
            }
          }
        }

        // Apply 3D Rotation from camera tilt
        const cosY = Math.cos(cameraTiltY);
        const sinY = Math.sin(cameraTiltY);
        const rotX = node.x * cosY - node.z * sinY;
        const rotZ = node.z * cosY + node.x * sinY;

        const effectiveZ = rotZ + 300;
        const scale = fov / (fov + effectiveZ);

        const projX = width / 2 + rotX * scale;
        const projY = height / 2 + (node.y - (scrollOffset % (height * 1.5))) * scale;

        const pulse = (Math.sin(node.pulseAngle) + 1) * 0.5;
        const alpha = Math.max(0.1, Math.min(1, scale * (node.baseAlpha + pulse * 0.25)));

        projectedNodes.push({
          node,
          x: projX,
          y: projY,
          scale,
          alpha,
          isGold: node.isGold,
          radius: node.radius * scale * (1 + pulse * 0.2),
        });
      }

      // Draw connection lines between nearby nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        const pA = projectedNodes[i];

        for (let j = i + 1; j < projectedNodes.length; j++) {
          const pB = projectedNodes[j];

          const dx = pA.x - pB.x;
          const dy = pA.y - pB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDistance) {
            const lineAlpha = (1 - dist / maxConnectionDistance) * Math.min(pA.alpha, pB.alpha) * 0.45;

            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);

            if (pA.isGold || pB.isGold) {
              ctx.strokeStyle = `rgba(217, 164, 65, ${lineAlpha * 0.9})`;
            } else {
              ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha * 0.7})`;
            }
            ctx.lineWidth = Math.min(pA.scale, pB.scale) * 1.1;
            ctx.stroke();

            // Random chance to spawn a data pulse packet along this edge
            if (!prefersReducedMotion && Math.random() < 0.0015 && dist > 30) {
              spawnDataPulse(pA, pB);
            }
          }
        }
      }

      // --- Layer 3: Foreground Data Pulses (Photons traveling along graph edges) ---
      for (let i = dataPulses.length - 1; i >= 0; i--) {
        const pulse = dataPulses[i];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          dataPulses.splice(i, 1);
          continue;
        }

        const px = pulse.nodeA.x + (pulse.nodeB.x - pulse.nodeA.x) * pulse.progress;
        const py = pulse.nodeA.y + (pulse.nodeB.y - pulse.nodeA.y) * pulse.progress;

        const pulseAlpha = Math.sin(pulse.progress * Math.PI);
        const pulseRadius = 2.2 * Math.min(pulse.nodeA.scale, pulse.nodeB.scale);

        // Core photon
        ctx.beginPath();
        ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
        if (pulse.isGold) {
          ctx.fillStyle = `rgba(255, 223, 133, ${pulseAlpha * 0.95})`;
          ctx.shadowColor = 'rgba(217, 164, 65, 0.8)';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(186, 230, 253, ${pulseAlpha * 0.95})`;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
      }

      // Draw projected nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        const p = projectedNodes[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);

        if (p.isGold) {
          ctx.fillStyle = `rgba(217, 164, 65, ${p.alpha})`;
          if (p.scale > 0.85) {
            ctx.shadowColor = 'rgba(217, 164, 65, 0.5)';
            ctx.shadowBlur = 6 * p.scale;
          }
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * 0.85})`;
          if (p.scale > 0.9) {
            ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
            ctx.shadowBlur = 5 * p.scale;
          }
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="tech-network-canvas" aria-hidden="true" />;
}

// Helper: Draw rotating 3D geometric wireframe diamond
function drawWireframe(ctx, wf, width, height, fov, scrollY) {
  const cosX = Math.cos(wf.rotX);
  const sinX = Math.sin(wf.rotX);
  const cosY = Math.cos(wf.rotY);
  const sinY = Math.sin(wf.rotY);

  const s = wf.size;
  // 6 vertices of an octahedron (3D diamond)
  const vertices = [
    { x: 0, y: -s, z: 0 },
    { x: s, y: 0, z: 0 },
    { x: 0, y: 0, z: s },
    { x: -s, y: 0, z: 0 },
    { x: 0, y: 0, z: -s },
    { x: 0, y: s, z: 0 },
  ];

  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [5, 1], [5, 2], [5, 3], [5, 4],
    [1, 2], [2, 3], [3, 4], [4, 1],
  ];

  const projected = vertices.map((v) => {
    // 3D rotation
    let y1 = v.y * cosX - v.z * sinX;
    let z1 = v.z * cosX + v.y * sinX;
    let x2 = v.x * cosY + z1 * sinY;
    let z2 = z1 * cosY - v.x * sinY;

    const effZ = z2 + wf.z + 400;
    const scale = fov / effZ;
    return {
      x: wf.x + x2 * scale,
      y: wf.y + y1 * scale - (scrollY * 0.1) % height,
      scale,
    };
  });

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(217, 164, 65, 0.07)';
  ctx.lineWidth = 0.8;

  edges.forEach(([i, j]) => {
    ctx.moveTo(projected[i].x, projected[i].y);
    ctx.lineTo(projected[j].x, projected[j].y);
  });
  ctx.stroke();
}
