"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
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

  const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600 font-medium">
          Loading content...
        </p>
      </div>
    </div>
  );

  const Card = ({ text, onClick, isSelected }) => (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`p-4 m-2 bg-white rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
      }`}
      onClick={onClick}
    >
      <p className="text-gray-800 font-medium">{text}</p>
    </motion.div>
  );

  const Section = ({ title, items, selectedItem, onSelect }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          className="text-4xl font-bold text-center mb-12 text-gray-800"
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
          <div className="mt-8">
            {filteredContent.map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-lg shadow-lg p-6 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  {item.contentTitle}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <strong className="text-gray-700">Description:</strong>
                  <div className="mt-2 prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.description}
                    </ReactMarkdown>
                  </div>
                </div>
                {item.fileUrl && (
                  <p className="mb-2">
                    <strong className="text-gray-700">File:</strong>{" "}
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View File
                    </a>
                  </p>
                )}
                <p className="mb-2">
                  <strong className="text-gray-700">Type:</strong>{" "}
                  {item.contentType}
                </p>
                <p>
                  <strong className="text-gray-700">Status:</strong>{" "}
                  {item.status}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickNotesAi;
