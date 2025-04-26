// import React, { useEffect } from 'react';
// import { useInView } from 'react-intersection-observer';
// import { motion } from 'framer-motion';
// import { useAuth } from '../../pages/Login/AuthContext';
// import './Features.css';
// import { useNavigate } from 'react-router-dom';

// const FeatureCard = ({ title, description, icon, color, index, path }) => {
//   const [ref, inView] = useInView({
//     triggerOnce: true,
//     threshold: 0.1,
//   });

//   const { student } = useAuth();
//   const navigate = useNavigate();

//   const handleExplore = () => {
//     if (!student) {
//       navigate('/login');
//     } else {
//       navigate(path);
//     }
//   };

//   return (
//     <motion.div
//       ref={ref}
//       className="feature-card"
//       initial={{ opacity: 0, y: 50 }}
//       animate={inView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.6, delay: index * 0.1 }}
//     >
//       <div className="card-hover-layer" style={{ '--accent-color': color }}></div>
//       <div className="card-glow"></div>
//       <div className="feature-icon-wrapper">
//         <div
//           className="feature-icon"
//           style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)` }}
//         >
//           {icon}
//         </div>
//       </div>
//       <h3 className="feature-title">{title}</h3>
//       <p className="feature-description">{description}</p>
//       <button className="feature-cta" onClick={handleExplore}>
//         <span>Explore {title}</span>
//         <div className="cta-background" style={{ background: color }}></div>
//       </button>
//     </motion.div>
//   );
// };

// const Features = () => {
//   const features = [
//     {
//       title: 'CourseHive',
//       description: 'AI-powered course curation system with dynamic learning path optimization',
//       icon: '📚',
//       color: '#6366f1',
//       path: '/coursehive'
//     },
//     {
//       title: 'Interview Decoded',
//       description: 'Real-time AI interview simulation with performance analytics & feedback',
//       icon: '💼',
//       color: '#06b6d4',
//       path: '/interview-decoded'
//     },
//     {
//       title: 'Aptitude Sprint',
//       description: 'Adaptive testing engine with predictive performance modeling',
//       icon: '📈',
//       color: '#2563eb',
//       path: '/aptitudesprint'
//     },
//     {
//       title: 'Quick Notes Ai',
//       description: 'Neural-powered note transformation with smart knowledge mapping',
//       icon: '✍️',
//       color: '#6366f1',
//       path: '/quick-notes-ai'
//     },
//     {
//       title: 'Campus Connect',
//       description: 'Collaborative learning ecosystem with intelligent peer matching',
//       icon: '🌐',
//       color: '#06b6d4',
//       path: '/campus-connect'
//     },
//     {
//       title: 'MockUp Labs',
//       description: 'Virtual project environments with AI-driven assessment matrices',
//       icon: '🧪',
//       color: '#2563eb',
//       path: '/mockup-labs'
//     },
//     {
//       title: 'Roadmap AI',
//       description: 'AI-powered personalized learning roadmaps with progress tracking and goal setting',
//       icon: '🗺️',
//       color: '#10b981',
//       path: '/roadmapai'
//     }
//   ];

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       document.querySelectorAll('.feature-card').forEach(card => {
//         const rect = card.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const y = e.clientY - rect.top;
//         card.style.setProperty('--mouse-x', `${x}px`);
//         card.style.setProperty('--mouse-y', `${y}px`);
//       });
//     };

//     document.addEventListener('mousemove', handleMouseMove);
//     return () => document.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   return (
//     <section className="features-container">
//       <div className="parallax-background">
//         {[...Array(20)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="floating-shape"
//             style={{
//               '--size': `${Math.random() * 40 + 20}px`,
//               '--delay': `${Math.random() * 5}s`,
//               '--duration': `${Math.random() * 10 + 10}s`,
//               '--x-start': `${Math.random() * 100}%`,
//               '--y-start': `${Math.random() * 100}%`,
//               '--color': `hsla(${Math.random() * 360}, 70%, 60%, 0.1)`
//             }}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 1, delay: i * 0.1 }}
//           />
//         ))}
//       </div>

//       <div className="features-content">
//         <motion.h2
//           className="section-title"
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <span className="title-decorator"></span>
//           <span className="title-text">
//             Discover Our <span className="gradient-text">AI-Powered</span> Toolkit
//           </span>
//         </motion.h2>

//         <div className="features-grid">
//           {features.map((feature, index) => (
//             <FeatureCard
//               key={feature.title}
//               {...feature}
//               index={index}
//               path={feature.path}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Features;

import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { useAuth } from "../../pages/Login/AuthContext";
import "./Features.css";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ title, description, icon, color, index, path }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { student } = useAuth();
  const navigate = useNavigate();

  const handleExplore = () => {
    if (!student) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        className="card-hover-layer"
        style={{ "--accent-color": color }}
      ></div>
      <div className="card-glow"></div>
      <div className="feature-icon-wrapper">
        <div
          className="feature-icon"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
          }}
        >
          {icon}
        </div>
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <button className="feature-cta" onClick={handleExplore}>
        <span>Explore {title}</span>
        <div className="cta-background" style={{ background: color }}></div>
      </button>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      title: "CourseHive",
      description:
        "AI-powered course curation system with dynamic learning path optimization",
      icon: "📚",
      color: "#6366f1",
      path: "/coursehive",
    },
    {
      title: "Interview Decoded",
      description:
        "Real-time AI interview simulation with performance analytics & feedback",
      icon: "💼",
      color: "#06b6d4",
      path: "/interview-decoded",
    },
    {
      title: "Aptitude Sprint",
      description:
        "Adaptive testing engine with predictive performance modeling",
      icon: "📈",
      color: "#2563eb",
      path: "/aptitudesprint",
    },
    {
      title: "Quick Notes Ai",
      description:
        "Neural-powered note transformation with smart knowledge mapping",
      icon: "✍️",
      color: "#6366f1",
      path: "/quick-notes-ai",
    },
    {
      title: "Campus Connect",
      description:
        "Collaborative learning ecosystem with intelligent peer matching",
      icon: "🌐",
      color: "#06b6d4",
      path: "/campus-connect",
    },
    {
      title: "MockUp Labs",
      description:
        "Virtual project environments with AI-driven assessment matrices",
      icon: "🧪",
      color: "#2563eb",
      path: "/mockup-labs",
    },
    {
      title: "Roadmap AI",
      description:
        "AI-powered personalized learning roadmaps with progress tracking and goal setting",
      icon: "🗺️",
      color: "#10b981",
      path: "/roadmapai",
    },
    {
      title: "Portfolio Builder",
      description:
        "AI-driven learning paths to build and track your portfolio.",
      icon: "🗺️",
      color: "#10b981",
      path: "/portfolio-builder",
    },
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.querySelectorAll(".feature-card").forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section id="features" className="features-container">
      <div className="parallax-background">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-shape"
            style={{
              "--size": `${Math.random() * 40 + 20}px`,
              "--delay": `${Math.random() * 5}s`,
              "--duration": `${Math.random() * 10 + 10}s`,
              "--x-start": `${Math.random() * 100}%`,
              "--y-start": `${Math.random() * 100}%`,
              "--color": `hsla(${Math.random() * 360}, 70%, 60%, 0.1)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        ))}
      </div>

      <div className="features-content">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="title-decorator"></span>
          <span className="title-text">
            Discover Our <span className="gradient-text">AI-Powered</span>{" "}
            Toolkit
          </span>
        </motion.h2>

        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              index={index}
              path={feature.path}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
