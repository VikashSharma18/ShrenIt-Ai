import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqItems = [
    {
      question: "What is ShrenitAI and how does it help students?",
      answer: "ShrenitAI is an AI-powered platform that helps college students navigate their university syllabus, access organized learning materials, prepare for interviews, and connect with peers through course-specific chatrooms."
    },
    {
      question: "How does the syllabus navigation feature work?",
      answer: "Students can choose their university, course, semester, subject, and unit to access structured materials—making it easy to learn what’s relevant."
    },
    {
      question: "Is ShrenitAI free to use?",
      answer: "ShrenitAI offers core features for free. However, institutions may subscribe on behalf of students at just ₹80 per student per year for access to advanced tools like AI interview prep and aptitude tests."
    },
    {
      question: "What is the AI Mock Interview feature?",
      answer: "Our AI interview tool conducts a 5-question session based on your selected job role. It uses posture analysis and speech recognition to simulate real interview scenarios and provide feedback."
    },
    {
      question: "Can I interact with other students?",
      answer: "Yes! The Campus Connect feature allows students from the same course to chat, share doubts, and support each other in a dedicated public space."
    },
    {
      question: "Do I need any software to access ShrenitAI?",
      answer: "No extra software needed! ShrenitAI works directly in your browser—just sign up and start using it on mobile, tablet, or desktop."
    }
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02 }
  };

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  };

  return (
    <section id="faq" className="faq-section">
      <motion.div
        className="faq-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="faq-header">
          <motion.h1
            initial={{ backgroundSize: '200% 200%' }}
            animate={{ backgroundPosition: '100% 50%' }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="faq-title"
          >
            Frequently Asked Questions
          </motion.h1>
          <p className="faq-subtitle">Here you can find answers to the most common questions about our platform.</p>
        </div>

        <div className="faq-grid">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              className="faq-item"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                className="faq-question"
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <h3>{item.question}</h3>
                <motion.div
                  className="faq-icon"
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                >
                  ▼
                </motion.div>
              </div>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    className="faq-answer"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    {item.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FAQ;