"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./QuickNotesAi.css";

const QuickNotesAi = () => {
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const [contentTitles, setContentTitles] = useState([]);
  const [allContent, setAllContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true); // Set loading to true before fetching
        const response = await axios.get(
          "https://shrenitai-backend.onrender.com/api/v1/contents"
        );
        const contentData = response.data.data || response.data;
        setAllContent(contentData);

        const uniqueUniversities = [
          ...new Set(contentData.map((item) => item.university)),
        ].sort();
        setUniversities(uniqueUniversities);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      const filteredCourses = [
        ...new Set(
          allContent
            .filter((item) => item.university === selectedUniversity)
            .map((item) => item.course)
        ),
      ].sort();
      setCourses(filteredCourses);
      setSelectedCourse("");
      setSemesters([]);
      setSubjects([]);
      setUnits([]);
      setTopics([]);
      setContentTitles([]);
    }
  }, [selectedUniversity, allContent]);

  useEffect(() => {
    if (selectedCourse) {
      const filteredSemesters = [
        ...new Set(
          allContent
            .filter(
              (item) =>
                item.university === selectedUniversity &&
                item.course === selectedCourse
            )
            .map((item) => item.semester)
        ),
      ].sort();
      setSemesters(filteredSemesters);
      setSelectedSemester("");
      setSubjects([]);
      setUnits([]);
      setTopics([]);
      setContentTitles([]);
    }
  }, [selectedCourse, selectedUniversity, allContent]);

  useEffect(() => {
    if (selectedSemester) {
      const filteredSubjects = [
        ...new Set(
          allContent
            .filter(
              (item) =>
                item.university === selectedUniversity &&
                item.course === selectedCourse &&
                item.semester === selectedSemester
            )
            .map((item) => item.subject)
        ),
      ].sort();
      setSubjects(filteredSubjects);
      setSelectedSubject("");
      setUnits([]);
      setTopics([]);
      setContentTitles([]);
    }
  }, [selectedSemester, selectedCourse, selectedUniversity, allContent]);

  useEffect(() => {
    if (selectedSubject) {
      const filteredUnits = [
        ...new Set(
          allContent
            .filter(
              (item) =>
                item.university === selectedUniversity &&
                item.course === selectedCourse &&
                item.semester === selectedSemester &&
                item.subject === selectedSubject
            )
            .map((item) => item.unit)
        ),
      ].sort();
      setUnits(filteredUnits);
      setSelectedUnit("");
      setTopics([]);
      setContentTitles([]);
    }
  }, [
    selectedSubject,
    selectedSemester,
    selectedCourse,
    selectedUniversity,
    allContent,
  ]);

  useEffect(() => {
    if (selectedUnit) {
      const filteredTopics = [
        ...new Set(
          allContent
            .filter(
              (item) =>
                item.university === selectedUniversity &&
                item.course === selectedCourse &&
                item.semester === selectedSemester &&
                item.subject === selectedSubject &&
                item.unit === selectedUnit
            )
            .map((item) => item.topic)
        ),
      ].sort();
      setTopics(filteredTopics);
      setSelectedTopic("");
      setContentTitles([]);
    }
  }, [
    selectedUnit,
    selectedSubject,
    selectedSemester,
    selectedCourse,
    selectedUniversity,
    allContent,
  ]);

  useEffect(() => {
    if (selectedTopic) {
      const filteredTitles = [
        ...new Set(
          allContent
            .filter(
              (item) =>
                item.university === selectedUniversity &&
                item.course === selectedCourse &&
                item.semester === selectedSemester &&
                item.subject === selectedSubject &&
                item.unit === selectedUnit &&
                item.topic === selectedTopic
            )
            .map((item) => item.contentTitle)
        ),
      ].sort();
      setContentTitles(filteredTitles);

      const filteredData = allContent.filter(
        (item) =>
          item.university === selectedUniversity &&
          item.course === selectedCourse &&
          item.semester === selectedSemester &&
          item.subject === selectedSubject &&
          item.unit === selectedUnit &&
          item.topic === selectedTopic
      );
      setFilteredContent(filteredData);
    }
  }, [
    selectedTopic,
    selectedUnit,
    selectedSubject,
    selectedSemester,
    selectedCourse,
    selectedUniversity,
    allContent,
  ]);

  const Card = ({ text, onClick, isSelected }) => (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`card ${isSelected ? "card-selected" : ""}`}
      onClick={onClick}
    >
      <p className="card-text">{text}</p>
    </motion.div>
  );

  const Section = ({ title, items, selectedItem, onSelect }) => (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <div className="card-container">
        {items.map((item) => (
          <Card
            key={item}
            text={item}
            onClick={() => onSelect(item)}
            isSelected={selectedItem === item}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container">
      {isLoading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="content-wrapper">
          <motion.h1
            className="header-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            🎓 Student Learning Portal
          </motion.h1>

          <Section
            title="University"
            items={universities}
            selectedItem={selectedUniversity}
            onSelect={(item) => setSelectedUniversity(item)}
          />

          {selectedUniversity && (
            <Section
              title="Course"
              items={courses}
              selectedItem={selectedCourse}
              onSelect={(item) => setSelectedCourse(item)}
            />
          )}

          {selectedCourse && (
            <Section
              title="Semester"
              items={semesters}
              selectedItem={selectedSemester}
              onSelect={(item) => setSelectedSemester(item)}
            />
          )}

          {selectedSemester && (
            <Section
              title="Subject"
              items={subjects}
              selectedItem={selectedSubject}
              onSelect={(item) => setSelectedSubject(item)}
            />
          )}

          {selectedSubject && (
            <Section
              title="Unit"
              items={units}
              selectedItem={selectedUnit}
              onSelect={(item) => setSelectedUnit(item)}
            />
          )}

          {selectedUnit && (
            <Section
              title="Topic"
              items={topics}
              selectedItem={selectedTopic}
              onSelect={(item) => setSelectedTopic(item)}
            />
          )}

          {selectedTopic && (
            <Section
              title="Content Titles"
              items={contentTitles}
              selectedItem={""}
              onSelect={() => {}}
            />
          )}

          {selectedTopic && filteredContent.length > 0 && (
            <div className="final-content-section">
              {filteredContent.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="final-content-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h3>{item.contentTitle}</h3>
                  <div className="description-box">
                    <strong>Description:</strong>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.description}
                    </ReactMarkdown>
                  </div>
                  {item.fileUrl && (
                    <p>
                      <strong>File:</strong>{" "}
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View File
                      </a>
                    </p>
                  )}
                  <p>
                    <strong>Type:</strong> {item.contentType}
                  </p>
                  <p>
                    <strong>Status:</strong> {item.status}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickNotesAi;
