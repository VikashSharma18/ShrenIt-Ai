import React, { useState, useEffect } from 'react';
import './CourseHive.css';

const CourseHive = () => {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json'); // Adjust the path if necessary
        const data = await response.json();
        setCategories(data.categories);
        setCourses(data.courses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = selectedCategory
    ? courses.filter(course => course.category === selectedCategory)
    : courses;

  if (selectedCourse) {
    return (
      <div className="coursehive-container">
        <button className="coursehive-back-btn" onClick={() => setSelectedCourse(null)}>
          ← Back to Courses
        </button>
        <div className="coursehive-detail-card">
          <div className="coursehive-detail-header">
            <h2>{selectedCourse.title}</h2>
            <div className="coursehive-meta">
              <span className="coursehive-platform">{selectedCourse.platform}</span>
              <span className="coursehive-difficulty">{selectedCourse.difficulty}</span>
            </div>
          </div>
          <img src={selectedCourse.image} alt={selectedCourse.title} className="coursehive-image" />
          <div className="coursehive-content">
            <h3>Course Overview</h3>
            <p>{selectedCourse.intro}</p>
            <h3>Syllabus</h3>
            <ul className="coursehive-syllabus">
              {selectedCourse.syllabus.map((item, index) => (
                <li key={index} className="coursehive-syllabus-item">
                  <span className="coursehive-bullet">▸</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={selectedCourse.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="coursehive-enroll-btn"
            >
              Enroll on {selectedCourse.platform}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="coursehive-container">
        <button className="coursehive-back-btn" onClick={() => setSelectedCategory(null)}>
          ← All Categories
        </button>
        <h2 className="coursehive-category-title">{selectedCategory} Courses</h2>
        <div className="coursehive-grid">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="coursehive-card"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="coursehive-card-header">
                <h3>{course.title}</h3>
                <span className="coursehive-difficulty">{course.difficulty}</span>
              </div>
              <div className="coursehive-platform">{course.platform}</div>
              <p className="coursehive-description">{course.intro}</p>
              <div className="coursehive-footer">
                <span className="coursehive-access">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="coursehive-container">
      <h1 className="coursehive-main-title">Course Categories</h1>
      {loading ? (
        <div className="coursehive-loading">Loading Categories...</div>
      ) : (
        <div className="coursehive-grid">
          {categories.map(category => (
            <div
              key={category.name}
              className="coursehive-category-card"
              onClick={() => setSelectedCategory(category.name)}
            >
              <div className="coursehive-category-icon">{category.icon}</div>
              <h2 className="coursehive-category-name">{category.name}</h2>
              <p className="coursehive-category-desc">{category.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseHive;