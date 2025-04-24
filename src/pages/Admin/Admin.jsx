import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Admin.css";
import { supabase } from '../../services/supabase';
import { useAuth } from '../../pages/Login/AuthContext';

const Admin = () => {
    const { setAdmin, admin_logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', course: '', sem: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
            setIsLoggedIn(true);
            fetchStudents();
            subscribeToStudentChanges();
        }
    }, []);

    const fetchStudents = async () => {
        const { data, error } = await supabase.from('student').select('*');
        if (error) {
            console.error('Error fetching students:', error);
        } else {
            setStudents(data);
        }
    };

    const subscribeToStudentChanges = () => {
        const subscription = supabase
            .channel('student-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'student' },
                (payload) => {
                    console.log('Change received:', payload);
                    fetchStudents();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const { data: adminData, error: fetchError } = await supabase
                .from('admin')
                .select('*')
                .eq('email', email.trim().toLowerCase());

            if (fetchError) throw fetchError;
            if (!adminData?.length) throw new Error('No admin account found with this email');

            const admin = adminData.find(a => a.password === password.trim());
            if (!admin) throw new Error('Incorrect password');

            setAdmin(admin);
            localStorage.setItem('admin', JSON.stringify(admin));
            setIsLoggedIn(true);
            fetchStudents();
            subscribeToStudentChanges();
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    const handleLogout = () => {
        admin_logout();
        localStorage.removeItem('admin');
        setIsLoggedIn(false);
        navigate('/');
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.from('student').insert([newStudent]);
        if (error) {
            console.error('Error adding student:', error);
            return;
        }
        if (data && data.length > 0) {
            setNewStudent({ name: '', email: '', course: '', sem: '' });
        }
    };

    const handleDeleteStudent = async (id) => {
        const { error } = await supabase.from('student').delete().eq('id', id);
        if (error) {
            console.error('Error deleting student:', error);
        }
    };

    const handleUpdateStudent = async (id, updatedStudent) => {
        const { error } = await supabase.from('student').update(updatedStudent).eq('id', id);
        if (error) {
            console.error('Error updating student:', error);
        }
    };

    if (isLoggedIn) {
        return (
            <div className="admin-dashboard__container">
                <header className="admin-header">
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        Logout
                    </button>
                </header>

                <section className="admin-content__section">
                    <h2 className="admin-section__title">Student Management</h2>

                    <form onSubmit={handleAddStudent} className="admin-student-form">
                        <h3 className="admin-form__title">Add New Student</h3>
                        <div className="admin-form__grid">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={newStudent.name}
                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                className="admin-form__input"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={newStudent.email}
                                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                className="admin-form__input"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Course"
                                value={newStudent.course}
                                onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                                className="admin-form__input"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Semester"
                                value={newStudent.sem}
                                onChange={(e) => setNewStudent({ ...newStudent, sem: e.target.value })}
                                className="admin-form__input"
                                required
                            />
                        </div>
                        <button type="submit" className="admin-form__submit">
                            Add Student
                        </button>
                    </form>

                    <div className="admin-table__container">
                        <h3 className="admin-table__title">Current Students</h3>
                        <div className="admin-table__scroll">
                            <table className="admin-students-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Course</th>
                                        <th>Semester</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id} className="admin-table__row">
                                            <td data-label="Name">{student.name}</td>
                                            <td data-label="Email">{student.email}</td>
                                            <td data-label="Course">{student.course}</td>
                                            <td data-label="Semester">{student.sem}</td>
                                            <td data-label="Actions" className="admin-table__actions">
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    className="admin-table__btn admin-table__btn--delete"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const updatedName = prompt('Enter new name:', student.name);
                                                        if (updatedName) {
                                                            handleUpdateStudent(student.id, { name: updatedName });
                                                        }
                                                    }}
                                                    className="admin-table__btn admin-table__btn--update"
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
        <div className="admin-login__container">
            <div className="admin-login__card">
                <h2 className="admin-login__title">Admin Portal</h2>
                <form onSubmit={handleLogin} className="admin-login__form">
                    <div className="admin-input__group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="admin-login__input"
                            placeholder=" "
                            required
                        />
                        <label className="admin-input__label">Email</label>
                    </div>
                    <div className="admin-input__group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="admin-login__input"
                            placeholder=" "
                            required
                        />
                        <label className="admin-input__label">Password</label>
                    </div>
                    {error && <div className="admin-error__message">{error}</div>}
                    <button type="submit" className="admin-login__submit">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Admin;