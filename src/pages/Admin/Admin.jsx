import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../pages/Login/AuthContext";

const Admin = () => {
  const { setAdmin, admin_logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    course: "",
    sem: "",
    University: "",
    College: "",
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setIsLoggedIn(true);
      fetchStudents();
      subscribeToStudentChanges();
    }
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("student").select("*");
    if (error) {
      console.error("Error fetching students:", error);
      showNotification("Error fetching students", "error");
    } else {
      setStudents(data);
    }
  };

  const subscribeToStudentChanges = () => {
    const subscription = supabase
      .channel("student-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student" },
        () => fetchStudents()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data: adminData, error: fetchError } = await supabase
        .from("admin")
        .select("*")
        .eq("email", email.trim().toLowerCase());

      if (fetchError) throw fetchError;
      if (!adminData?.length)
        throw new Error("No admin account found with this email");

      const admin = adminData.find((a) => a.password === password.trim());
      if (!admin) throw new Error("Incorrect password");

      setAdmin(admin);
      localStorage.setItem("admin", JSON.stringify(admin));
      setIsLoggedIn(true);
      fetchStudents();
      subscribeToStudentChanges();
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  const handleLogout = () => {
    admin_logout();
    localStorage.removeItem("admin");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from("student").insert([newStudent]);
    if (error) {
      showNotification("Error adding student: " + error.message, "error");
      return;
    }
    setNewStudent({
      name: "",
      email: "",
      course: "",
      sem: "",
      University: "",
      College: "",
    });
    showNotification("Student added successfully");
  };

  const handleDeleteStudent = async (id) => {
    const { error } = await supabase.from("student").delete().eq("id", id);
    if (error) {
      showNotification("Error deleting student: " + error.message, "error");
    } else {
      showNotification("Student deleted successfully");
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("student")
      .update(editingStudent)
      .eq("id", editingStudent.id);

    if (error) {
      showNotification("Error updating student: " + error.message, "error");
    } else {
      showNotification("Student updated successfully");
      setEditingStudent(null);
    }
  };

  const handleAddUniversityDetails = () => {
    navigate("/admin/add-notes");
  };

  if (isLoggedIn) {
    return (
      <div className="adminPage_dashboard__container">
        {notification && (
          <div
            className={`adminPage_notification adminPage_notification--${notification.type}`}
          >
            {notification.message}
          </div>
        )}

        {editingStudent && (
          <div className="adminPage_modal">
            <div className="adminPage_modal__content">
              <h3>Update Student</h3>
              <form onSubmit={handleUpdateStudent}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      name: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editingStudent.email}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      email: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Course"
                  value={editingStudent.course}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      course: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Semester"
                  value={editingStudent.sem}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      sem: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="University"
                  value={editingStudent.University}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      University: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="College"
                  value={editingStudent.College}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      College: e.target.value,
                    })
                  }
                  required
                />
                <div className="adminPage_modal__actions">
                  <button type="button" onClick={() => setEditingStudent(null)}>
                    Cancel
                  </button>
                  <button type="submit">Update</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <header className="adminPage_header">
          <h1 className="adminPage_title">Admin Dashboard</h1>
          <button
            className="adminPage_logout-btn1"
            onClick={handleAddUniversityDetails}
          >
            Add University Details
          </button>
          <button onClick={handleLogout} className="adminPage_logout-btn">
            Logout
          </button>
        </header>

        <section className="adminPage_content__section">
          <h2 className="adminPage_section__title">Student Management</h2>

          <form onSubmit={handleAddStudent} className="adminPage_student-form">
            <h3 className="adminPage_form__title">Add New Student</h3>
            <div className="adminPage_form__grid">
              <input
                type="text"
                placeholder="Full Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Course"
                value={newStudent.course}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, course: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Semester"
                value={newStudent.sem}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, sem: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="University"
                value={newStudent.University}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, University: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="College"
                value={newStudent.College}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, College: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className="adminPage_form__submit">
              Add Student
            </button>
          </form>

          <div className="adminPage_table__container">
            <h3 className="adminPage_table__title">Current Students</h3>
            <div className="adminPage_table__scroll">
              <table className="adminPage_students-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>University</th>
                    <th>College</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td data-label="Name">{student.name}</td>
                      <td data-label="Email">{student.email}</td>
                      <td data-label="Course">{student.course}</td>
                      <td data-label="Semester">{student.sem}</td>
                      <td data-label="University">{student.University}</td>
                      <td data-label="College">{student.College}</td>
                      <td className="adminPage_table__actions">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="adminPage_table__btn adminPage_table__btn--delete"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="adminPage_table__btn adminPage_table__btn--update"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="adminPage_login__container">
      <div className="adminPage_login__card">
        <h2 className="adminPage_login__title">Admin Portal</h2>
        <form onSubmit={handleLogin} className="adminPage_login__form">
          <div className="adminPage_input__group">
            <input
              type="email"
              id="email"
              className="adminPage_login__input"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email" className="adminPage_input__label">
              Email
            </label>
          </div>
          <div className="adminPage_input__group">
            <input
              type="password"
              id="password"
              className="adminPage_login__input"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password" className="adminPage_input__label">
              Password
            </label>
          </div>
          {error && <div className="adminPage_error__message">{error}</div>}
          <button type="submit" className="adminPage_login__submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
