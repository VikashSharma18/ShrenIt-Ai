import React, { useState, useEffect } from 'react';
import './RoadmapAI.css';

const RoadmapAI = () => {
    const [data, setData] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [roadmap, setRoadmap] = useState([]);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showInnerRoadmapModal, setShowInnerRoadmapModal] = useState(false);
    const [selectedResources, setSelectedResources] = useState([]);
    const [selectedInnerRoadmap, setSelectedInnerRoadmap] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/roadmaps.json');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error('Error loading roadmap data:', error);
            }
        };
        fetchData();
    }, []);

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        setSelectedRole('');
        setRoadmap([]);
    };

    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setSelectedRole(roleId);
        generateRoadmap(roleId);
    };

    const generateRoadmap = (roleId) => {
        if (!data) return;
        const roadmapData = data.roadmaps[roleId] || [];
        setRoadmap(roadmapData);
    };

    const showResources = (stepIndex) => {
        setSelectedResources(roadmap[stepIndex]?.resources || []);
        setShowResourceModal(true);
    };

    const showInnerRoadmap = (stepIndex) => {
        setSelectedInnerRoadmap(roadmap[stepIndex]?.innerRoadmap || []);
        setShowInnerRoadmapModal(true);
    };

    if (!data) return <div className="roadmap-loader">Loading...</div>;

    return (
        <div className="roadmap-container">
            <header className="roadmap-header">
                <h1><i className="fas fa-compass"></i> Career Navigator</h1>
                <p>Your personalized roadmap to career success</p>
            </header>

            <div className="selector-container">
                <div className="select-group">
                    <label>Your Course:</label>
                    <select
                        className="modern-select"
                        value={selectedCourse}
                        onChange={handleCourseChange}
                    >
                        <option value="">Select your course</option>
                        {data.courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>

                <div className="select-group">
                    <label>Career Role:</label>
                    <select
                        className="modern-select"
                        value={selectedRole}
                        onChange={handleRoleChange}
                        disabled={!selectedCourse}
                    >
                        <option value="">Select your course first</option>
                        {data.courses.find(c => c.id === selectedCourse)?.roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="roadmap-content">
                {roadmap.length === 0 ? (
                    <div className="roadmap-placeholder">
                        <img src="path-to-placeholder-image" alt="Select career path" />
                        <h3>Select your course and desired career role</h3>
                        <p>We'll generate a personalized semester-wise roadmap for you</p>
                    </div>
                ) : (
                    <div className="roadmap-steps">
                        {roadmap.map((step, index) => (
                            <div key={index} className="roadmap-step">
                                <div className="step-header">
                                    <div className="step-title">
                                        <span>🎯</span>
                                        {step.title}
                                    </div>
                                    <span className="step-semester">{step.semester}</span>
                                </div>
                                <div className="step-content">{step.content}</div>
                                <div className="step-actions">
                                    {step.resources?.length > 0 && (
                                        <button
                                            className="resource-btn"
                                            onClick={() => showResources(index)}
                                        >
                                            <i className="fas fa-book-open"></i> Resources
                                        </button>
                                    )}
                                    <button
                                        className="expand-btn"
                                        onClick={() => showInnerRoadmap(index)}
                                    >
                                        <i className="fas fa-chevron-down"></i> View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showResourceModal && (
                <ResourceModal
                    resources={selectedResources}
                    onClose={() => setShowResourceModal(false)}
                />
            )}

            {showInnerRoadmapModal && (
                <InnerRoadmapModal
                    roadmap={selectedInnerRoadmap}
                    onClose={() => setShowInnerRoadmapModal(false)}
                />
            )}
        </div>
    );
};

const ResourceModal = ({ resources, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
                <h3>Recommended Resources</h3>
                <button className="close-modal" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
                {resources.length === 0 ? (
                    <p>No resources available for this step.</p>
                ) : (
                    resources.map((resource, index) => (
                        <div key={index} className="resource-item">
                            <div className="resource-icon">
                                <i className={`fas fa-${getResourceIcon(resource.type)}`}></i>
                            </div>
                            <div className="resource-text">
                                <a href={resource.link} target="_blank" rel="noopener noreferrer">
                                    {resource.title}
                                </a>
                                <p>{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} resource</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

const InnerRoadmapModal = ({ roadmap, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
                <h3>Semester Breakdown</h3>
                <button className="close-modal" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
                {roadmap.length === 0 ? (
                    <p>No detailed roadmap available for this step.</p>
                ) : (
                    roadmap.map((step, index) => (
                        <div key={index} className="inner-step">
                            <div className="inner-step-header">
                                <div className="inner-step-title">
                                    <i className="fas fa-calendar-alt"></i>
                                    {step.title}
                                </div>
                                <div className="inner-step-duration">{step.duration}</div>
                            </div>
                            <div className="inner-step-content">{step.content}</div>
                            <div className="inner-step-milestones">
                                {step.milestones.map((milestone, idx) => (
                                    <div key={idx} className="milestone">
                                        <input type="checkbox" id={`milestone-${index}-${idx}`} />
                                        <label htmlFor={`milestone-${index}-${idx}`}>{milestone}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

const getResourceIcon = (type) => {
    switch (type) {
        case 'course': return 'graduation-cap';
        case 'book': return 'book';
        case 'project': return 'code';
        case 'event': return 'calendar-alt';
        case 'template': return 'file-alt';
        default: return 'link';
    }
};

export default RoadmapAI;