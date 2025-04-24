import React from 'react';
import { motion } from 'framer-motion';
import './Aboutus.css';
import founderImage from '../../assets/profile.png'; // Replace with actual image path

function Aboutus() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 120 }
    }
  };

  return (
    <motion.section 
      className="about-root-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="about-content-wrapper">
        <motion.div 
          className="about-profile-card"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="about-image-frame">
            <img 
              src={founderImage} 
              alt="Founder" 
              className="about-portrait"
            />
          </div>
          
          <div className="about-meta-info">
            <h2 className="about-name">Johnathan Smith</h2>
            <p className="about-position">Chief Executive Officer</p>
            <div className="about-product-brand">
              <span className="product-name">Shrenit</span>
              <span className="product-ai">AI</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="about-message-container"
          variants={containerVariants}
        >
          <motion.h1 variants={itemVariants} className="about-main-title">
            Founder's Insight
          </motion.h1>
          
          <motion.p variants={itemVariants} className="about-message-text">
            I firmly believe education should be fundamentally simple, universally accessible, 
            and meticulously aligned with students' genuine needs.
          </motion.p>
          
          <motion.p variants={itemVariants} className="about-message-text">
            This platform was born from the vision to transcend basic syllabus organization 
            and interview preparation - it's about revolutionizing the entire academic journey 
            through intelligent AI integration.
          </motion.p>

          <motion.p variants={itemVariants} className="about-message-text">
            Every feature embodies deliberate purpose: simplifying complex learning processes, 
            elevating interview readiness, and fostering meaningful academic connections. 
            My mission remains clear: bridge the critical gap between theoretical knowledge 
            and practical competence for students navigating educational challenges.
          </motion.p>

          <motion.p variants={itemVariants} className="about-closing-statement">
            Your engagement fuels our vision - empowering students to approach their future 
            with clarity, confidence, and continuous growth potential.
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Aboutus;