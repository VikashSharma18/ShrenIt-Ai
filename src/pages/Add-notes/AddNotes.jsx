import React, { useState } from "react";
import "./AddNotes.css";
import { toast } from "sonner";

const AddNotes = () => {
  const [formData, setFormData] = useState({
    university: "",
    course: "",
    semester: "",
    subject: "",
    unit: "",
    topic: "",
    contentTitle: "",
    contentDescription: "",
    contentFile: null,
    contentType: "",
    contentStatus: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle change for all input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prevData) => ({
      ...prevData,
      contentFile: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("university", formData.university);
    formDataToSend.append("course", formData.course);
    formDataToSend.append("semester", formData.semester);
    formDataToSend.append("subject", formData.subject);
    formDataToSend.append("unit", formData.unit);
    formDataToSend.append("topic", formData.topic);
    formDataToSend.append("contentTitle", formData.contentTitle);
    formDataToSend.append("contentDescription", formData.contentDescription);
    if (formData.contentFile) {
      formDataToSend.append("contentFile", formData.contentFile);
    }
    formDataToSend.append("contentType", formData.contentType);
    formDataToSend.append("contentStatus", formData.contentStatus);

    try {
      const response = await fetch(
        "https://shrenitai-backend.onrender.com/api/v1/contents",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);
      toast.success("Content added successfully!");

      setFormData({
        university: "",
        course: "",
        semester: "",
        subject: "",
        unit: "",
        topic: "",
        contentTitle: "",
        contentDescription: "",
        contentFile: null,
        contentType: "",
        contentStatus: "",
      });
    } catch (error) {
      toast.error("Failed to add content!"); // Show error notification
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false); // Set loading state to false after request completion
    }
  };

  return (
    <div className="form-container">
      <form className="university-form" onSubmit={handleSubmit}>
        {/* University and Course */}
        <div className="form-row">
          <div className="form-group">
            <label>University</label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="Enter University"
            />
          </div>
          <div className="form-group">
            <label>Course</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Enter Course"
            />
          </div>
        </div>

        {/* Semester and Subject */}
        <div className="form-row">
          <div className="form-group">
            <label>Semester</label>
            <input
              type="text"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              placeholder="Enter Semester"
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter Subject"
            />
          </div>
        </div>

        {/* Unit and Topic */}
        <div className="form-row">
          <div className="form-group">
            <label>Unit</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Enter Unit"
            />
          </div>
          <div className="form-group">
            <label>Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Enter Topic"
            />
          </div>
        </div>

        {/* Content Title and File Upload */}
        <div className="form-row">
          <div className="form-group">
            <label>Content Title</label>
            <input
              type="text"
              name="contentTitle"
              value={formData.contentTitle}
              onChange={handleChange}
              placeholder="Enter Content Title"
            />
          </div>
          <div className="form-group">
            <label>Content File</label>
            <input type="file" name="contentFile" onChange={handleFileChange} />
          </div>
        </div>

        {/* Content Type and Status */}
        <div className="form-row">
          <div className="form-group">
            <label>Content Type</label>
            <input
              type="text"
              name="contentType"
              value={formData.contentType}
              onChange={handleChange}
              placeholder="Enter Content Type (e.g., Video, Article)"
            />
          </div>
          <div className="form-group">
            <label>Content Status</label>
            <input
              type="text"
              name="contentStatus"
              value={formData.contentStatus}
              onChange={handleChange}
              placeholder="Enter Content Status (e.g., Active, Inactive)"
            />
          </div>
        </div>

        {/* Content Description */}
        <div className="form-group full-width">
          <label>Content Description</label>
          <textarea
            name="contentDescription"
            value={formData.contentDescription}
            onChange={handleChange}
            placeholder="Enter Content Description"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button className="submit-btn" type="submit">
          {isLoading ? <div className="loader"></div> : "Add Content"}
        </button>
      </form>
    </div>
  );
};

export default AddNotes;
