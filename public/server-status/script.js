/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => {
  const ball = document.getElementById('ball');
  const striker = document.getElementById('striker');
  const keeper = document.getElementById('keeper');
  const net = document.getElementById('net');
  const successMsg = document.getElementById('successMsg');
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');

  let particles = [];
  const colors = ['#fbbf24', '#10b981', '#3b82f6', '#fff'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 5 + 2;
      this.speedY = Math.random() * 3 + 2;
      this.speedX = (Math.random() - 0.5) * 2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < 150; i++) {
      particles.push(new Particle());
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (successMsg.classList.contains('active')) {
      particles.forEach(p => {
        p.update();
        p.draw();
      });
    }
    requestAnimationFrame(animateConfetti);
  }
  initParticles();
  animateConfetti();

  function startScene() {
    // Reset State
    successMsg.classList.remove('active');
    striker.classList.add('running');
    striker.style.transition = 'none';
    striker.style.left = '10%';
    striker.style.transform = 'scale(1)';

    ball.style.transition = 'none';
    ball.style.bottom = '150px';
    ball.style.left = '45%';
    ball.style.transform = 'translateX(-50%) scale(1)';
    ball.style.opacity = '1';

    keeper.style.transition = 'all 0.5s ease';
    keeper.style.transform = 'translateX(-50%)';
    net.style.transform = 'scaleY(1)';

    setTimeout(() => {
      // 1. Striker Runs to Ball
      striker.style.transition = 'left 1s linear, transform 1s linear';
      striker.style.left = '42%';
      striker.style.transform = 'scale(0.9)'; // Perspective scaling

      setTimeout(() => {
        // 2. KICK MOMENT
        striker.classList.remove('running');

        // Ball Physics: Travel toward goal in 3D
        // Moving from bottom 150px to top ~50px in the field perspective
        ball.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        ball.style.bottom = '1300px'; // Deep into the field
        ball.style.left = '52%'; // Slight angle
        ball.style.transform = 'translateX(-50%) scale(0.4)'; // Scale down as it moves away

        // 3. Keeper Reacts (Slightly late/wrong way)
        setTimeout(() => {
          keeper.style.transform = 'translate(-120px, 40px) rotate(-60deg)';
        }, 150);

        // 4. Goal Impact
        setTimeout(() => {
          net.style.transform = 'scaleY(1.4) translateZ(50px)';
          successMsg.classList.add('active');

          // Shake effect on the whole field container
          document.querySelector('.field-perspective').style.transition =
            'transform 0.1s';
          document.querySelector('.field-perspective').style.transform =
            'rotateX(65deg) translateY(-205px) scale(1.01)';

          setTimeout(() => {
            document.querySelector('.field-perspective').style.transform =
              'rotateX(65deg) translateY(-200px) scale(1)';
          }, 100);

          // Fade out ball
          ball.style.opacity = '0';

          // Restart
          setTimeout(startScene, 6000);
        }, 600);
      }, 1000);
    }, 1000);
  }

  startScene();
});
