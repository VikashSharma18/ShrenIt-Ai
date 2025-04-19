// Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Home.css';

const Home = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const canvasRef = useRef(null);
  const features = [
    'AI-Powered Learning',
    'Smart Career Guidance',
    'Interactive Coding',
    'Personalized Roadmaps',
    'Industry Partnerships',
    'Real-time Analytics'
  ];

  // Dynamic particles initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
        this.color = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, 0.1)`;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 3 + 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 150 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update(); // ✅ Fixed typo here
        particle.draw();   // ✅ Fixed typo here
      });

      // Create connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${1 - distance / 100})`;
            ctx.lineWidth = 0.3;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Feature cycler
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="home-container">
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Animated Background Elements */}
      <div className="geometric-overlay">
        <div className="floating-cube"></div>
        <div className="rotating-pyramid"></div>
        <div className="pulsing-sphere"></div>
      </div>

      <div className="content-wrapper">
        <div className="hero-section">
          <div className="innovation-badge">
            <span>Innovation in Action</span>
          </div>

          <h1 className="main-heading">
            Transform Your
            <span className="gradient-text"> Learning Experience</span>
            with AI
          </h1>

          <p className="sub-heading">
            Harness cutting-edge technology to revolutionize your educational journey
          </p>

          <div className="feature-cycler">
            {features.map((feature, index) => (
              <div
                key={feature}
                className={`feature-item ${index === currentFeature ? 'active' : ''}`}
              >
                <div className="feature-icon"></div>
                {feature}
              </div>
            ))}
          </div>

          <div className="cta-container">
            <button className="primary-cta">
              Explore AI Tools
              <span className="hover-effect"></span>
            </button>
            <button className="secondary-cta">
              Watch Demo
            </button>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h3>500K+</h3>
            <p>Active Learners</p>
          </div>
          <div className="stat-card">
            <h3>98%</h3>
            <p>Success Rate</p>
          </div>
          <div className="stat-card">
            <h3>50+</h3>
            <p>Industry Experts</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
