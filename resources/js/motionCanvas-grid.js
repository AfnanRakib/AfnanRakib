(function() {
  // Wait a moment for DOM to be fully ready
  setTimeout(function() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    let animationId = null;
    
    // Grid Trail Effect Configuration
    const gridSize = 50; // Size of each grid cell (reduced from 60 for more boxes)
    const trailLength = 8; // Number of cells in trail
    let cols = Math.ceil(canvas.width / gridSize) + 1;
    let rows = Math.ceil(canvas.height / gridSize) + 1;
    
    // Grid trails
    const trails = [];
    const maxTrails = 25; // Increased from 12 for more visible boxes
    
    // Mouse tracking
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    const mouseInfluenceRadius = 450; // Distance at which mouse affects trails (increased from 350)
    const mouseInfluenceStrength = 1.2; // How much mouse affects direction (increased from 0.8)
    const primaryColor = 'rgba(139, 92, 246, 0.8)'; // Purple
    const secondaryColor = 'rgba(88, 166, 255, 0.6)'; // Blue
    
    // Set canvas to full window size
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / gridSize) + 1;
      rows = Math.ceil(canvas.height / gridSize) + 1;
      resetTrails();
    }
    
    class Trail {
      constructor() {
        this.reset();
      }
      
      reset() {
        // Random starting position
        this.x = Math.floor(Math.random() * cols);
        this.y = Math.floor(Math.random() * rows);
        
        // Random direction (0: right, 1: down, 2: left, 3: up)
        this.direction = Math.floor(Math.random() * 4);
        
        // Random speed (slower)
        this.speed = 0.05 + Math.random() * 0.1;
        this.progress = 0;
        
        // Trail history
        this.history = [];
        
        // Random color
        this.color = Math.random() > 0.5 ? primaryColor : secondaryColor;
        
        // Lifetime
        this.life = 30 + Math.random() * 50;
        this.age = 0;
      }
      
      update() {
        this.progress += this.speed;
        this.age++;
        
        // Calculate distance to mouse
        const cellX = this.x * gridSize + gridSize / 2;
        const cellY = this.y * gridSize + gridSize / 2;
        const dx = mouseX - cellX;
        const dy = mouseY - cellY;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse influence: attract trail toward cursor
        if (distToMouse < mouseInfluenceRadius && distToMouse > 0) {
          const influence = (1 - distToMouse / mouseInfluenceRadius) * mouseInfluenceStrength;
          const targetDirection = Math.atan2(dy, dx);
          
          // Blend toward mouse direction more aggressively
          const directionInfluence = targetDirection / (Math.PI / 2);
          this.direction = Math.round(directionInfluence + 4) % 4;
          
          // Significantly increase speed near mouse
          this.speed = Math.min(0.5, this.speed + influence * 0.25);
        } else {
          // Return to normal speed
          this.speed = Math.max(0.05, this.speed - 0.01);
        }
        
        if (this.progress >= 1) {
          this.progress = 0;
          
          // Add current position to history
          this.history.push({ x: this.x, y: this.y });
          
          // Keep history limited
          if (this.history.length > trailLength) {
            this.history.shift();
          }
          
          // Move in current direction
          switch (this.direction) {
            case 0: this.x++; break; // Right
            case 1: this.y++; break; // Down
            case 2: this.x--; break; // Left
            case 3: this.y--; break; // Up
          }
          
          // Change direction randomly
          if (Math.random() < 0.08) {
            this.direction = Math.floor(Math.random() * 4);
          }
          
          // Reset if out of bounds or too old
          if (this.x < 0 || this.x >= cols || 
              this.y < 0 || this.y >= rows || 
              this.age > this.life) {
            this.reset();
          }
        }
      }
      
      draw() {
        // Calculate distance to mouse for brightness effect
        const cellX = this.x * gridSize + gridSize / 2;
        const cellY = this.y * gridSize + gridSize / 2;
        const dx = mouseX - cellX;
        const dy = mouseY - cellY;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        const mouseCloseness = Math.max(0, 1 - distToMouse / mouseInfluenceRadius);
        
        // Draw trail history
        for (let i = 0; i < this.history.length; i++) {
          const pos = this.history[i];
          const alpha = (i + 1) / this.history.length * 0.3 * (0.5 + mouseCloseness);
          
          ctx.strokeStyle = this.color.replace(/[\d.]+\)$/g, alpha + ')');
          ctx.lineWidth = 2 + mouseCloseness * 2;
          
          // Draw horizontal line
          ctx.beginPath();
          ctx.moveTo(pos.x * gridSize, pos.y * gridSize);
          ctx.lineTo((pos.x + 1) * gridSize, pos.y * gridSize);
          ctx.stroke();
          
          // Draw vertical line
          ctx.beginPath();
          ctx.moveTo(pos.x * gridSize, pos.y * gridSize);
          ctx.lineTo(pos.x * gridSize, (pos.y + 1) * gridSize);
          ctx.stroke();
        }
        
        // Draw current position (brighter)
        const currentX = this.x * gridSize;
        const currentY = this.y * gridSize;
        
        // Enhance brightness when close to mouse
        const colorIntensity = 0.8 + mouseCloseness * 0.2;
        ctx.strokeStyle = this.color.replace(/[\d.]+\)$/g, colorIntensity + ')');
        ctx.lineWidth = 3 + mouseCloseness * 2;
        
        // Animated current cell
        const offset = this.progress * gridSize;
        
        // Draw based on direction
        ctx.beginPath();
        switch (this.direction) {
          case 0: // Right
            ctx.moveTo(currentX, currentY);
            ctx.lineTo(currentX + offset, currentY);
            ctx.moveTo(currentX, currentY);
            ctx.lineTo(currentX, currentY + gridSize);
            break;
          case 1: // Down
            ctx.moveTo(currentX, currentY);
            ctx.lineTo(currentX, currentY + offset);
            ctx.moveTo(currentX, currentY);
            ctx.lineTo(currentX + gridSize, currentY);
            break;
          case 2: // Left
            ctx.moveTo(currentX + gridSize, currentY);
            ctx.lineTo(currentX + gridSize - offset, currentY);
            ctx.moveTo(currentX + gridSize, currentY);
            ctx.lineTo(currentX + gridSize, currentY + gridSize);
            break;
          case 3: // Up
            ctx.moveTo(currentX, currentY + gridSize);
            ctx.lineTo(currentX, currentY + gridSize - offset);
            ctx.moveTo(currentX, currentY + gridSize);
            ctx.lineTo(currentX + gridSize, currentY + gridSize);
            break;
        }
        ctx.stroke();
        
        // Draw glow at head
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(currentX - 2, currentY - 2, 4, 4);
        ctx.shadowBlur = 0;
      }
    }

    function resetTrails() {
      trails.length = 0;
      for (let i = 0; i < maxTrails; i++) {
        trails.push(new Trail());
      }
    }
    
    // Initialize trails and bind resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Mouse movement tracking
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    // Reset mouse position when leaving window
    document.addEventListener('mouseleave', function() {
      mouseX = canvas.width / 2;
      mouseY = canvas.height / 2;
    });

    // Clear once with background color
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-primary')
      .trim();
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Animation loop
    function animate() {
      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(10, 12, 16, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw trails
      for (const trail of trails) {
        trail.update();
        trail.draw();
      }
      
      animationId = requestAnimationFrame(animate);
    }
    
    // Stop animation on cleanup
    window.__stopMotionCanvas = function() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };
    
    console.log('Grid trail motion canvas initialized');
    animate();
  }, 100);
})();
