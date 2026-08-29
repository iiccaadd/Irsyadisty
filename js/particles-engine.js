/**
 * Particles Engine - Advanced Customizable Falling & Floating Animations
 * Supports: Flowers (Petals), Leaves, Snow, Sparkles & Stars, Hearts, Confetti
 * Features: Dynamic Speed, Density, Size, Color Palette, 3D Flutter & Wind Sway
 */

(function(window) {
  let canvas = null;
  let ctx = null;
  let animationId = null;
  let particles = [];
  let currentConfig = {
    enabled: true,
    type: 'flowers', // 'flowers', 'leaves', 'snow', 'stars', 'hearts', 'confetti', 'none'
    speed: 'medium', // 'slow', 'medium', 'fast'
    density: 'medium', // 'low', 'medium', 'high'
    size: 'medium', // 'small', 'medium', 'large'
    colorMode: 'auto', // 'auto', 'gold', 'pink', 'white', 'custom'
    customColor: '#d4af37',
    windSway: 'gentle' // 'gentle', 'moderate', 'dynamic'
  };

  const SPEED_MAP = { slow: 0.6, medium: 1.1, fast: 2.0 };
  const DENSITY_MAP = { low: 18, medium: 36, high: 75 };
  const SIZE_MAP = { small: 0.7, medium: 1.0, large: 1.5 };

  function init(canvasElement, config, themePrimaryColor) {
    canvas = canvasElement || document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    if (config) {
      if (typeof config === 'string') {
        currentConfig.type = config;
      } else {
        currentConfig = Object.assign({}, currentConfig, config);
      }
    }

    resize();
    window.removeEventListener('resize', resize);
    window.addEventListener('resize', resize);

    restart(themePrimaryColor);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function restart(themePrimaryColor) {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (!ctx || !currentConfig.enabled || currentConfig.type === 'none') {
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const count = DENSITY_MAP[currentConfig.density] || 35;
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(true, themePrimaryColor));
    }

    animate(themePrimaryColor);
  }

  function getColors(type, colorMode, customColor, themePrimary) {
    if (colorMode === 'custom' && customColor) {
      return [customColor, adjustAlpha(customColor, 0.8), adjustAlpha(customColor, 0.5)];
    }
    if (colorMode === 'gold') {
      return ['#d4af37', '#e5c158', '#f3e5ab', '#c5a059'];
    }
    if (colorMode === 'pink') {
      return ['#ffb7c5', '#ff94a8', '#fbcfe8', '#f472b6'];
    }
    if (colorMode === 'white') {
      return ['#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1'];
    }

    // Auto Mode (Matches Theme & Type)
    const primary = themePrimary || '#d4af37';
    if (type === 'flowers') {
      return [primary, '#ffb7c5', '#f3f0eb', '#e5c158', '#fbcfe8'];
    }
    if (type === 'leaves') {
      return [primary, '#c29b38', '#855828', '#dfb15b', '#6b4423'];
    }
    if (type === 'snow') {
      return ['#ffffff', '#e0f2fe', '#f8fafc', '#bae6fd'];
    }
    if (type === 'stars') {
      return [primary, '#fef08a', '#ffffff', '#fde047', '#fef9c3'];
    }
    if (type === 'hearts') {
      return [primary, '#f43f5e', '#fb7185', '#fda4af', '#e11d48'];
    }
    if (type === 'confetti') {
      return [primary, '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
    }
    return [primary, '#ffffff', '#e5c158'];
  }

  function adjustAlpha(hex, opacity) {
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16) || 212;
    const g = parseInt(hex.slice(3, 5), 16) || 175;
    const b = parseInt(hex.slice(5, 7), 16) || 55;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  function createParticle(randomY, themePrimary) {
    const colors = getColors(currentConfig.type, currentConfig.colorMode, currentConfig.customColor, themePrimary);
    const speedMult = SPEED_MAP[currentConfig.speed] || 1.0;
    const sizeMult = SIZE_MAP[currentConfig.size] || 1.0;

    const baseSize = (currentConfig.type === 'stars' || currentConfig.type === 'snow') ? 5 : 12;

    return {
      x: Math.random() * (canvas ? canvas.width : window.innerWidth),
      y: randomY ? Math.random() * (canvas ? canvas.height : window.innerHeight) : -20,
      size: (Math.random() * 8 + baseSize) * sizeMult,
      speedY: (Math.random() * 1.5 + 0.8) * speedMult,
      speedX: (Math.random() - 0.5) * 1.2,
      angle: Math.random() * 360,
      spinSpeed: (Math.random() - 0.5) * (currentConfig.windSway === 'dynamic' ? 3.5 : 1.8),
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: (Math.random() * 0.03 + 0.015) * (currentConfig.windSway === 'dynamic' ? 2 : 1),
      swayAmplitude: (Math.random() * 1.5 + 0.8) * (currentConfig.windSway === 'dynamic' ? 2.5 : (currentConfig.windSway === 'moderate' ? 1.5 : 0.8)),
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.4 + 0.5,
      twinkle: Math.random() * Math.PI,
      aspect: Math.random() * 0.4 + 0.6
    };
  }

  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.angle * Math.PI) / 180);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    const type = currentConfig.type;

    if (type === 'flowers') {
      // Elegant curved flower petal
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * p.aspect * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subtle center vein/highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.6, 0);
      ctx.lineTo(p.size * 0.6, 0);
      ctx.stroke();

    } else if (type === 'leaves') {
      // Natural leaf shape with pointed tip
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.quadraticCurveTo(p.size * 0.6, 0, 0, p.size);
      ctx.quadraticCurveTo(-p.size * 0.6, 0, 0, -p.size);
      ctx.fill();

      // Leaf middle vein
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.8);
      ctx.lineTo(0, p.size * 0.8);
      ctx.stroke();

    } else if (type === 'snow') {
      // Soft glowing snowflake orb / starlet
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Flake crystal arms for larger snowflakes
      if (p.size > 8) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        for (let a = 0; a < 3; a++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.7, 0);
          ctx.lineTo(p.size * 0.7, 0);
          ctx.stroke();
        }
      }

    } else if (type === 'stars') {
      // Twinkling 4-point star
      const s = p.size * (0.8 + 0.2 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(0, 0, s, 0);
      ctx.quadraticCurveTo(0, 0, 0, s);
      ctx.quadraticCurveTo(0, 0, -s, 0);
      ctx.quadraticCurveTo(0, 0, 0, -s);
      ctx.fill();

    } else if (type === 'hearts') {
      // Romantic Bezier heart
      const h = p.size * 0.6;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.3);
      ctx.bezierCurveTo(-h, -h * 0.6, -h * 1.2, h * 0.6, 0, h * 1.3);
      ctx.bezierCurveTo(h * 1.2, h * 0.6, h, -h * 0.6, 0, h * 0.3);
      ctx.fill();

    } else if (type === 'confetti') {
      // Festive rectangular confetti ribbon
      ctx.fillRect(-p.size * 0.6, -p.size * 0.3, p.size * 1.2, p.size * 0.6);
    }

    ctx.restore();
  }

  function animate(themePrimary) {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.swayOffset += p.swaySpeed;
      p.x += Math.sin(p.swayOffset) * p.swayAmplitude + p.speedX;
      p.angle += p.spinSpeed;
      p.twinkle += 0.05;

      // Recycle when falling past bottom or side
      if (p.y > canvas.height + 25) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -30) p.x = canvas.width + 20;
      if (p.x > canvas.width + 30) p.x = -20;

      drawParticle(p);
    });

    animationId = requestAnimationFrame(() => animate(themePrimary));
  }

  function updateConfig(newConfig, themePrimary) {
    currentConfig = Object.assign({}, currentConfig, newConfig);
    restart(themePrimary);
  }

  window.ParticlesEngine = {
    init,
    updateConfig,
    restart
  };
})(window);
