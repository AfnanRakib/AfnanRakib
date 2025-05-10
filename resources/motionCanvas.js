document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas to full window size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Particle system
  const particleCount = 50;
  const particles = [];
  
  // Color palette - adjusted to match your theme
  const colors = [
    'rgba(88, 166, 255, 0.5)',  // --accent-blue with opacity
    'rgba(247, 54, 140, 0.4)',  // --accent-pink with opacity
    'rgba(139, 148, 158, 0.3)', // --text-secondary with opacity
    'rgba(33, 38, 45, 0.6)'     // --card-bg with opacity
  ];
  
  // Create particles
  function createParticles() {
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 50 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 0.5 - 0.2,
        vy: Math.random() * 0.5 - 0.2,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
  }
  
  // Update particles
  function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Move particles
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around screen
      if (p.x < -p.radius) p.x = canvas.width + p.radius;
      if (p.x > canvas.width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = canvas.height + p.radius;
      if (p.y > canvas.height + p.radius) p.y = -p.radius;
    }
  }
  
  // Draw particles
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill background with your dark theme color
    ctx.fillStyle = '#0a0c10'; // --bg-primary
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each particle
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.radius
      );
      
      // Parse the rgba color to extract its components
      const colorMatch = p.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (colorMatch) {
        const r = parseInt(colorMatch[1]);
        const g = parseInt(colorMatch[2]);
        const b = parseInt(colorMatch[3]);
        const a = parseFloat(colorMatch[4]);
        
        // Create gradient with proper opacity
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
    
  // Handle mouse movement
  let mouseX = 0;
  let mouseY = 0;
  let mouseMoving = false;
  let mouseTimer = null;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseMoving = true;
    
    // Add a particle at mouse position with your accent colors
    if (Math.random() > 0.7) {
      // Alternate between accent blue and pink for mouse interaction
      const mouseColor = Math.random() > 0.5 ? 
        'rgba(88, 166, 255, 0.5)' : 'rgba(247, 54, 140, 0.5)';
      
      particles.push({
        x: mouseX,
        y: mouseY,
        radius: Math.random() * 50 + 20,
        color: mouseColor,
        vx: (Math.random() * 0.6 - 0.3),
        vy: (Math.random() * 0.6 - 0.3),
        opacity: Math.random() * 0.3 + 0.1
      });
      
      // Keep particle count limited
      if (particles.length > particleCount * 1.5) {
        particles.shift();
      }
    }
    
    // Reset mouse timer
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
      mouseMoving = false;
    }, 1000);
  });
  
  // Handle touch events for mobile
  window.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    mouseMoving = true;
    
    // Add a particle at touch position
    if (Math.random() > 0.7) {
      const touchColor = Math.random() > 0.5 ? 
        'rgba(88, 166, 255, 0.5)' : 'rgba(247, 54, 140, 0.5)';
      
      particles.push({
        x: mouseX,
        y: mouseY,
        radius: Math.random() * 50 + 20,
        color: touchColor,
        vx: (Math.random() * 0.6 - 0.3),
        vy: (Math.random() * 0.6 - 0.3),
        opacity: Math.random() * 0.3 + 0.1
      });
      
      // Keep particle count limited
      if (particles.length > particleCount * 1.5) {
        particles.shift();
      }
    }
    
    // Reset mouse timer
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
      mouseMoving = false;
    }, 1000);
  });
  
  // Animation loop
  function animate() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animate);
  }
  
  // Initialize and start animation
  createParticles();
  animate();
});