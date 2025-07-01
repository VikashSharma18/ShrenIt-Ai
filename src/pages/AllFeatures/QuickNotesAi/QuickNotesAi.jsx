"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./QuickNotesAi.css";

// Circular Loader Component
const CircularLoader = ({ size = 40, color = "#3b82f6" }) => (
  <div className="loader-container">
    <motion.div
      className="circular-loader"
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(59, 130, 246, 0.2)`,
        borderTop: `3px solid ${color}`,
        borderRadius: "50%",
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

const QuickNotesAi = () => {
  // State for dropdown options
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const [contentTitles, setContentTitles] = useState([]);

  // State for selected values
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // State for content and loading
  const [filteredContent, setFilteredContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const API_BASE_URL = "https://shrenitai-backend.onrender.com/api/v1";

  // Fetch initial universities
  useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/contents?limit=1000`);
        const contentData =
          response.data.contents || response.data.data || response.data;

        if (Array.isArray(contentData)) {
          // Extract unique universities from populated data
          const uniqueUniversities = [
            ...new Set(
              contentData
                .map((item) => item.university?.name || item.university)
                .filter(Boolean)
            ),
          ].sort();
          setUniversities(uniqueUniversities);
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
        setError("Failed to load universities. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch courses based on selected university
  const fetchCourses = useCallback(async (universityName) => {
    if (!universityName) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/contents/filter?university=${encodeURIComponent(
          universityName
        )}&limit=1000`
      );
      const contentData =
        response.data.contents || response.data.data || response.data;

      if (Array.isArray(contentData)) {
        const uniqueCourses = [
          ...new Set(
            contentData
              .map((item) => item.course?.name || item.course)
              .filter(Boolean)
          ),
        ].sort();
        setCourses(uniqueCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch semesters based on selections
  const fetchSemesters = useCallback(async (universityName, courseName) => {
    if (!universityName || !courseName) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/contents/filter?university=${encodeURIComponent(
          universityName
        )}&course=${encodeURIComponent(courseName)}&limit=1000`
      );
      const contentData =
        response.data.contents || response.data.data || response.data;

      if (Array.isArray(contentData)) {
        const uniqueSemesters = [
          ...new Set(
            contentData
              .map(
                (item) =>
                  item.semester?.name || item.semester?.number || item.semester
              )
              .filter(Boolean)
          ),
        ].sort();
        setSemesters(uniqueSemesters);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      setError("Failed to load semesters.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch subjects based on selections
  const fetchSubjects = useCallback(
    async (universityName, courseName, semesterName) => {
      if (!universityName || !courseName || !semesterName) return;

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          university: universityName,
          course: courseName,
          semester: semesterName,
          limit: "1000",
        });

        const response = await axios.get(
          `${API_BASE_URL}/contents/filter?${params}`
        );
        const contentData =
          response.data.contents || response.data.data || response.data;

        if (Array.isArray(contentData)) {
          const uniqueSubjects = [
            ...new Set(
              contentData
                .map((item) => item.subject?.name || item.subject)
                .filter(Boolean)
            ),
          ].sort();
          setSubjects(uniqueSubjects);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setError("Failed to load subjects.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch units based on selections
  const fetchUnits = useCallback(
    async (universityName, courseName, semesterName, subjectName) => {
      if (!universityName || !courseName || !semesterName || !subjectName)
        return;

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          university: universityName,
          course: courseName,
          semester: semesterName,
          subject: subjectName,
          limit: "1000",
        });

        const response = await axios.get(
          `${API_BASE_URL}/contents/filter?${params}`
        );
        const contentData =
          response.data.contents || response.data.data || response.data;

        if (Array.isArray(contentData)) {
          const uniqueUnits = [
            ...new Set(
              contentData
                .map(
                  (item) => item.unit?.name || item.unit?.number || item.unit
                )
                .filter(Boolean)
            ),
          ].sort();
          setUnits(uniqueUnits);
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        setError("Failed to load units.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch topics based on selections
  const fetchTopics = useCallback(
    async (universityName, courseName, semesterName, subjectName, unitName) => {
      if (
        !universityName ||
        !courseName ||
        !semesterName ||
        !subjectName ||
        !unitName
      )
        return;

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          university: universityName,
          course: courseName,
          semester: semesterName,
          subject: subjectName,
          unit: unitName,
          limit: "1000",
        });

        const response = await axios.get(
          `${API_BASE_URL}/contents/filter?${params}`
        );
        const contentData =
          response.data.contents || response.data.data || response.data;

        if (Array.isArray(contentData)) {
          const uniqueTopics = [
            ...new Set(
              contentData
                .map((item) => item.topic?.name || item.topic)
                .filter(Boolean)
            ),
          ].sort();
          setTopics(uniqueTopics);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        setError("Failed to load topics.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch final content based on all selections
  const fetchContent = useCallback(
    async (
      universityName,
      courseName,
      semesterName,
      subjectName,
      unitName,
      topicName,
      page = 1
    ) => {
      if (
        !universityName ||
        !courseName ||
        !semesterName ||
        !subjectName ||
        !unitName ||
        !topicName
      )
        return;

      setIsContentLoading(true);
      try {
        const params = new URLSearchParams({
          university: universityName,
          course: courseName,
          semester: semesterName,
          subject: subjectName,
          unit: unitName,
          topic: topicName,
          page: page.toString(),
          limit: "20",
        });

        const response = await axios.get(
          `${API_BASE_URL}/contents/filter?${params}`
        );
        const responseData = response.data;
        const contentData =
          responseData.contents || responseData.data || responseData;

        if (Array.isArray(contentData)) {
          if (page === 1) {
            setFilteredContent(contentData);
          } else {
            setFilteredContent((prev) => [...prev, ...contentData]);
          }

          // Handle pagination info
          if (responseData.pagination) {
            setCurrentPage(responseData.pagination.current);
            setTotalPages(responseData.pagination.pages);
            setHasMore(
              responseData.pagination.current < responseData.pagination.pages
            );
          }

          // Extract content titles
          const uniqueTitles = [
            ...new Set(
              contentData
                .map((item) => item.contentTitle || item.title)
                .filter(Boolean)
            ),
          ].sort();
          setContentTitles(uniqueTitles);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setError("Failed to load content.");
      } finally {
        setIsContentLoading(false);
      }
    },
    []
  );

  // Effect handlers for cascade filtering
  useEffect(() => {
    if (selectedUniversity) {
      fetchCourses(selectedUniversity);
      // Reset dependent selections
      setSelectedCourse("");
      setSelectedSemester("");
      setSelectedSubject("");
      setSelectedUnit("");
      setSelectedTopic("");
      setCourses([]);
      setSemesters([]);
      setSubjects([]);
      setUnits([]);
      setTopics([]);
      setContentTitles([]);
      setFilteredContent([]);
    }
  }, [selectedUniversity, fetchCourses]);

  useEffect(() => {
    if (selectedCourse && selectedUniversity) {
      fetchSemesters(selectedUniversity, selectedCourse);
      setSelectedSemester("");
      setSelectedSubject("");
      setSelectedUnit("");
      setSelectedTopic("");
      setSemesters([]);
      setSubjects([]);
      setUnits([]);
      setTopics([]);
      setContentTitles([]);
      setFilteredContent([]);
    }
  }, [selectedCourse, selectedUniversity, fetchSemesters]);

  useEffect(() => {
    if (selectedSemester && selectedUniversity && selectedCourse) {
      fetchSubjects(selectedUniversity, selectedCourse, selectedSemester);
      setSelectedSubject("");
      setSelectedUnit("");
      setSelectedTopic("");
      setSubjects([]);
      setUnits([]);
      setTopics([]);
      setContentTitles([]);
      setFilteredContent([]);
    }
  }, [selectedSemester, selectedUniversity, selectedCourse, fetchSubjects]);

  useEffect(() => {
    if (
      selectedSubject &&
      selectedUniversity &&
      selectedCourse &&
      selectedSemester
    ) {
      fetchUnits(
        selectedUniversity,
        selectedCourse,
        selectedSemester,
        selectedSubject
      );
      setSelectedUnit("");
      setSelectedTopic("");
      setUnits([]);
      setTopics([]);
      setContentTitles([]);
      setFilteredContent([]);
    }
  }, [
    selectedSubject,
    selectedUniversity,
    selectedCourse,
    selectedSemester,
    fetchUnits,
  ]);

  useEffect(() => {
    if (
      selectedUnit &&
      selectedUniversity &&
      selectedCourse &&
      selectedSemester &&
      selectedSubject
    ) {
      fetchTopics(
        selectedUniversity,
        selectedCourse,
        selectedSemester,
        selectedSubject,
        selectedUnit
      );
      setSelectedTopic("");
      setTopics([]);
      setContentTitles([]);
      setFilteredContent([]);
    }
  }, [
    selectedUnit,
    selectedUniversity,
    selectedCourse,
    selectedSemester,
    selectedSubject,
    fetchTopics,
  ]);

  useEffect(() => {
    if (
      selectedTopic &&
      selectedUniversity &&
      selectedCourse &&
      selectedSemester &&
      selectedSubject &&
      selectedUnit
    ) {
      setCurrentPage(1);
      fetchContent(
        selectedUniversity,
        selectedCourse,
        selectedSemester,
        selectedSubject,
        selectedUnit,
        selectedTopic,
        1
      );
    }
  }, [
    selectedTopic,
    selectedUniversity,
    selectedCourse,
    selectedSemester,
    selectedSubject,
    selectedUnit,
    fetchContent,
  ]);

  // Load more content
  const loadMore = () => {
    if (hasMore && !isContentLoading) {
      fetchContent(
        selectedUniversity,
        selectedCourse,
        selectedSemester,
        selectedSubject,
        selectedUnit,
        selectedTopic,
        currentPage + 1
      );
    }
  };

  const Card = ({ text, onClick, isSelected, disabled = false }) => (
    <motion.div
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      className={`card ${isSelected ? "card-selected" : ""} ${
        disabled ? "card-disabled" : ""
      }`}
      onClick={!disabled ? onClick : undefined}
    >
      <p className="card-text">{text}</p>
    </motion.div>
  );

  const Section = ({
    title,
    items,
    selectedItem,
    onSelect,
    loading = false,
  }) => (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      {loading ? (
        <CircularLoader size={30} />
      ) : (
        <div className="card-container">
          {items.map((item) => (
            <Card
              key={item}
              text={item}
              onClick={() => onSelect(item)}
              isSelected={selectedItem === item}
            />
          ))}
          {items.length === 0 && !loading && (
            <p className="no-data-message">
              No {title.toLowerCase()} available
            </p>
          )}
        </div>
      )}
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

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <Section
          title="University"
          items={universities}
          selectedItem={selectedUniversity}
          onSelect={setSelectedUniversity}
          loading={isLoading && universities.length === 0}
        />

        {selectedUniversity && (
          <Section
            title="Course"
            items={courses}
            selectedItem={selectedCourse}
            onSelect={setSelectedCourse}
            loading={isLoading && !selectedCourse}
          />
        )}

        {selectedCourse && (
          <Section
            title="Semester"
            items={semesters}
            selectedItem={selectedSemester}
            onSelect={setSelectedSemester}
            loading={isLoading && !selectedSemester}
          />
        )}

        {selectedSemester && (
          <Section
            title="Subject"
            items={subjects}
            selectedItem={selectedSubject}
            onSelect={setSelectedSubject}
            loading={isLoading && !selectedSubject}
          />
        )}

        {selectedSubject && (
          <Section
            title="Unit"
            items={units}
            selectedItem={selectedUnit}
            onSelect={setSelectedUnit}
            loading={isLoading && !selectedUnit}
          />
        )}

        {selectedUnit && (
          <Section
            title="Topic"
            items={topics}
            selectedItem={selectedTopic}
            onSelect={setSelectedTopic}
            loading={isLoading && !selectedTopic}
          />
        )}

        {selectedTopic && contentTitles.length > 0 && (
          <Section
            title="Content Titles"
            items={contentTitles}
            selectedItem=""
            onSelect={() => {}}
          />
        )}

        {selectedTopic && (
          <div className="final-content-section">
            {isContentLoading && filteredContent.length === 0 ? (
              <CircularLoader size={50} />
            ) : (
              <>
                {filteredContent.map((item, idx) => (
                  <motion.div
                    key={`${item._id || item.id || idx}`}
                    className="final-content-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <h3>{item.contentTitle || item.title}</h3>
                    <div className="description-box">
                      <strong>Description:</strong>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.description || "No description available"}
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
                      <strong>Type:</strong> {item.contentType || "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong> {item.status || "N/A"}
                    </p>
                  </motion.div>
                ))}

                {hasMore && (
                  <div className="load-more-section">
                    {isContentLoading ? (
                      <CircularLoader size={30} />
                    ) : (
                      <motion.button
                        className="load-more-btn"
                        onClick={loadMore}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Load More Content
                      </motion.button>
                    )}
                  </div>
                )}

                {filteredContent.length === 0 && !isContentLoading && (
                  <p className="no-data-message">
                    No content available for this topic
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickNotesAi;
