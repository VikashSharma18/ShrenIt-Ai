import React, { useEffect, useState } from "react";
import "./Internship.css";

const InternshipApp = () => {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);

  useEffect(() => {
    fetch("/internships.json")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => b.id - a.id);
        setInternships(sorted);
      })
      .catch((err) => console.error("Error loading internships:", err));
  }, []);

  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  const showInternshipDetail = (id) => {
    const internship = internships.find((item) => item.id === id);
    setSelectedInternship(internship);
  };

  const goBack = () => {
    setSelectedInternship(null);
  };

  return (
    <div>
      {!selectedInternship ? (
        <div className="container">
          <div className="di">
            <h1>
              <span className="darink-text">Darink</span> Internships
            </h1>
            <p>Find your next career opportunity</p>
          </div>

          <div className="internship-list">
            {internships.map((internship) => (
              <div
                key={internship.id}
                className="internship-card"
                onClick={() => showInternshipDetail(internship.id)}
              >
                <div className="internship-info">
                  <h2>{internship.title}</h2>
                  <p className="company">{internship.company}</p>
                  <p>{internship.description}</p>
                </div>
                <span className="date">{formatDate(internship.date)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="internship-detail">
          <div className="detail-content">
            <button className="back-button" onClick={goBack}>
              <i className="fas fa-arrow-left"></i> Back to List
            </button>

            <div id="detailContent">
              <div className="detail-section">
                <h2>
                  {selectedInternship.title} at {selectedInternship.company}
                </h2>
              </div>

              {Object.entries(selectedInternship.details).map(
                ([heading, content]) => (
                  <div className="detail-section" key={heading}>
                    <h3>{heading}</h3>
                    {Array.isArray(content) ? (
                      <ul>
                        {content.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{content}</p>
                    )}
                  </div>
                )
              )}

              {selectedInternship.applyLink && (
                <a
                  href={selectedInternship.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apply-button"
                >
                  <i className="fas fa-external-link-alt"></i> Apply Now
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipApp;
