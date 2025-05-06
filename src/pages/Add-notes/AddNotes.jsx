import React, { useState, useEffect } from "react";
import "./AddNotes.css";
import { toast } from "sonner";

const AddNotes = () => {
  const [formData, setFormData] = useState({
    id: null,
    university: "",
    course: "",
    semester: "",
    subject: "",
    unit: "",
    topic: "",
    contentTitle: "",
    description: "",
    contentFile: null,
    fileUrl: "",
    contentType: "",
    status: "",
  });

  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await fetch(
        "https://shrenitai-backend.onrender.com/api/v1/contents"
      );
      if (!response.ok) throw new Error("Failed to fetch contents");
      const result = await response.json();
      setContents(result.data || result);
    } catch (error) {
      console.error("Error fetching contents:", error);
      toast.error("Failed to load contents!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
    Object.entries(formData).forEach(([key, value]) => {
      if (value && key !== "id" && key !== "contentFile") {
        formDataToSend.append(key, value);
      }
    });

    if (formData.contentFile) {
      formDataToSend.append("contentFile", formData.contentFile);
    }

    try {
      const url = isEditing
        ? `https://shrenitai-backend.onrender.com/api/v1/contents/${formData.id}`
        : "https://shrenitai-backend.onrender.com/api/v1/contents";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success(
        isEditing
          ? "Content updated successfully!"
          : "Content added successfully!"
      );

      setFormData({
        id: null,
        university: "",
        course: "",
        semester: "",
        subject: "",
        unit: "",
        topic: "",
        contentTitle: "",
        description: "",
        contentFile: null,
        fileUrl: "",
        contentType: "",
        status: "",
      });

      setIsEditing(false);
      setCurrentPage(1);
      fetchContents();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update content!" : "Failed to add content!"
      );
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (content) => {
    setFormData({
      id: content._id,
      university: content.university,
      course: content.course,
      semester: content.semester,
      subject: content.subject,
      unit: content.unit,
      topic: content.topic,
      contentTitle: content.contentTitle,
      description: content.description,
      contentFile: null,
      fileUrl: content.fileUrl || "",
      contentType: content.contentType,
      status: content.status,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?"))
      return;

    try {
      const response = await fetch(
        `https://shrenitai-backend.onrender.com/api/v1/contents/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Content deleted successfully!");
      fetchContents();
    } catch (error) {
      toast.error("Failed to delete content!");
      console.error("Error deleting content:", error);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = contents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(contents.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="form-container">
      <h2>{isEditing ? "Edit Content" : "Add New Content"}</h2>
      <form className="university-form" onSubmit={handleSubmit}>
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

        <div className="form-row">
          <div className="form-group">
            <label>Or File URL (optional)</label>
            <input
              type="text"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              placeholder="Enter File URL if no file is uploaded"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Content Type</label>
            <input
              type="text"
              name="contentType"
              value={formData.contentType}
              onChange={handleChange}
              placeholder="Enter Content Type (e.g., PDF, Video)"
            />
          </div>
          <div className="form-group">
            <label>Content Status</label>
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder="Enter Content Status (e.g., Active)"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Content Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter Content Description"
          ></textarea>
        </div>

        <div className="form-actions">
          <button className="submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="loader"></div>
            ) : isEditing ? (
              "Update Content"
            ) : (
              "Add Content"
            )}
          </button>
          {isEditing && (
            <button
              className="cancel-btn"
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  id: null,
                  university: "",
                  course: "",
                  semester: "",
                  subject: "",
                  unit: "",
                  topic: "",
                  contentTitle: "",
                  description: "",
                  contentFile: null,
                  fileUrl: "",
                  contentType: "",
                  status: "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-container">
        <h2>Content List</h2>
        <table className="content-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>University</th>
              <th>Course</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((content) => (
              <tr key={content._id}>
                <td>{content._id}</td>
                <td>{content.contentTitle}</td>
                <td>{content.university}</td>
                <td>{content.course}</td>
                <td>{content.subject}</td>
                <td>{content.status}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(content)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(content._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNotes;
