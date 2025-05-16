// Footer.jsx
import React from "react";
import "./Footer.css";

const Footer = () => {
  const handleCopyEmail = () => {
    const email = "vikashs16598@gmail.com";
    navigator.clipboard
      .writeText(email)
      .then(() => {
        alert("Email copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy email: ", err);
      });
  };
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4 className="footer-heading">EduAI Suite</h4>
          <p className="footer-text">
            Empowering the next generation of learners through AI-driven
            educational solutions.
          </p>
          <div className="social-links">
            <a
              href="https://x.com/shrenit_ai"
              target="_blank"
              className="social-icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/shrenit-ai/about/"
              target="_blank"
              className="social-icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/shrenit_ai/"
              target="_blank"
              className="social-icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.658.075-3.252.477-4.485 1.71-1.233 1.233-1.635 2.827-1.71 4.485-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.075 1.658.477 3.252 1.71 4.485 1.233 1.233 2.827 1.635 4.485 1.71 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.658-.075 3.252-.477 4.485-1.71 1.233-1.233 1.635-2.827 1.71-4.485.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.075-1.658-.477-3.252-1.71-4.485-1.233-1.233-2.827-1.635-4.485-1.71-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.441s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.441-1.441-1.441z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h5 className="footer-subheading">Quick Links</h5>
          <nav className="footer-nav">
            <a href="/aboutus" className="footer-link">
              About Us
            </a>
            <a href="/features" className="footer-link">
              Features
            </a>
          </nav>
        </div>

        <div className="footer-section">
          <h5 className="footer-subheading">Contact</h5>
          <div className="contact-info">
            <p className="contact-item">
              <svg
                className="contact-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" />
              </svg>
              vikashs16598@gmail.com
            </p>
            <p className="contact-item">
              <svg
                className="contact-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z" />
              </svg>
              +91 82482 67908
            </p>
          </div>
          {/* <button className="footer-cta" onClick={handleCopyEmail}>
            Schedule Demo
            <span className="cta-arrow">→</span>
          </button> */}
        </div>

        <div className="footer-section">
          {/* <h5 className="footer-subheading">Newsletter</h5>
          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </form> */}
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © {new Date().getFullYear()} Shrenit AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
