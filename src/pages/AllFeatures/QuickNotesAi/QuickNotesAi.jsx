"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./QuickNotesAi.css"; 

const QuickNotesAi = () => {
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const [contentTitles, setContentTitles] = useState([]);
  const [allContent, setAllContent] = useState([]);

  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [filteredContent, setFilteredContent] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/contents"
        );
        const contentData = response.data;
        setAllContent(contentData);
        const uniqueSemesters = [
          ...new Set(contentData.map((item) => item.semester)),
        ].sort();
        setSemesters(uniqueSemesters);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      const filteredSubjects = [
        ...new Set(
          allContent
            .filter((item) => item.semester === selectedSemester)
            .map((item) => item.subject)
        ),
      ].sort();
      setSubjects(filteredSubjects);
      setSelectedSubject("");
      setUnits([]);
      setTopics([]);
      setContentTitles([]);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSubject) {
      const filteredUnits = [
        ...new Set(
          allContent
            .filter(
              (item) =>
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
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedUnit) {
      const filteredTopics = [
        ...new Set(
          allContent
            .filter(
              (item) =>
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
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedTopic) {
      const filteredContentTitles = [
        ...new Set(
          allContent
            .filter(
              (item) =>
                item.semester === selectedSemester &&
                item.subject === selectedSubject &&
                item.unit === selectedUnit &&
                item.topic === selectedTopic
            )
            .map((item) => item.contentTitle)
        ),
      ].sort();
      setContentTitles(filteredContentTitles);

      const filteredContentData = allContent.filter(
        (item) =>
          item.semester === selectedSemester &&
          item.subject === selectedSubject &&
          item.unit === selectedUnit &&
          item.topic === selectedTopic
      );
      setFilteredContent(filteredContentData);
    }
  }, [selectedTopic]);

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
          title="Semesters"
          items={semesters}
          selectedItem={selectedSemester}
          onSelect={(item) => {
            setSelectedSemester(item);
            setSelectedSubject("");
            setSelectedUnit("");
            setSelectedTopic("");
          }}
        />

        {selectedSemester && (
          <Section
            title="Subjects"
            items={subjects}
            selectedItem={selectedSubject}
            onSelect={(item) => {
              setSelectedSubject(item);
              setSelectedUnit("");
              setSelectedTopic("");
            }}
          />
        )}

        {selectedSubject && (
          <Section
            title="Units"
            items={units}
            selectedItem={selectedUnit}
            onSelect={(item) => {
              setSelectedUnit(item);
              setSelectedTopic("");
            }}
          />
        )}

        {selectedUnit && (
          <Section
            title="Topics"
            items={topics}
            selectedItem={selectedTopic}
            onSelect={(item) => {
              setSelectedTopic(item);
            }}
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

        {filteredContent.length > 0 && (
          <div className="content-list">
            <h2 className="content-list-title">Content List</h2>
            <table className="content-table">
              <thead>
                <tr>
                  <th>University</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Subject</th>
                  <th>Unit</th>
                  <th>Topic</th>
                  <th>Content Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map((content) => (
                  <tr key={content._id}>
                    <td>{content.university}</td>
                    <td>{content.course}</td>
                    <td>{content.semester}</td>
                    <td>{content.subject}</td>
                    <td>{content.unit}</td>
                    <td>{content.topic}</td>
                    <td>{content.contentTitle}</td>
                    <td>{content.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickNotesAi;
