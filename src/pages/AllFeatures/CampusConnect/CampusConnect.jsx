import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../Login/AuthContext";
import { supabase } from "../../../services/supabase";
import { io } from "socket.io-client";
import moment from "moment";
import "./CampusConnect.css";

const CampusConnect = () => {
  const { student } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [courseStudents, setCourseStudents] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [sentMessageIds] = useState(new Set());
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(
      import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
    );
    setSocket(newSocket);

    // Clean up on component unmount
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (student && socket) {
      // Join the course room
      socket.emit("joinRoom", { userId: student.id, course: student.course });

      // Listen for new messages
      socket.on("message", (message) => {
        // Check if we've already processed this message ID
        if (!sentMessageIds.has(message.id)) {
          setMessages((prevMessages) => [...prevMessages, message]);
          // Only auto-scroll for messages from others
          if (message.senderId !== student.id) {
            setShouldScroll(true);
          }
        }
      });

      // Fetch existing messages and students
      fetchMessages();
      fetchCourseStudents();
    }

    // Cleanup socket listener on re-render
    return () => {
      if (socket) {
        socket.off("message");
      }
    };
  }, [student, socket, sentMessageIds]);

  useEffect(() => {
    // Scroll to bottom when messages change, but only if shouldScroll is true
    if (shouldScroll) {
      scrollToBottom();
      setShouldScroll(false);
    }
  }, [messages, shouldScroll]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      if (!student || !student.course) return;

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          id,
          content,
          created_at,
          sender_name,
          user_id
        `
        )
        .eq("course_id", student.course)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Format the messages to be compatible with our UI
      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        senderId: msg.user_id,
        senderName: msg.sender_name,
        time: msg.created_at,
      }));

      setMessages(formattedMessages);
      // Set shouldScroll to true after initial messages load
      setShouldScroll(true);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async () => {
    try {
      if (!student || !student.course) return;

      const { data, error } = await supabase
        .from("student")
        .select("id, name, course, sem")
        .eq("course", student.course);

      if (error) throw error;

      setCourseStudents(data);
    } catch (error) {
      console.error("Error fetching course students:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !student) return;

    try {
      // Insert message into Supabase
      const { data, error } = await supabase
        .from("messages")
        .insert({
          user_id: student.id,
          course_id: student.course,
          content: newMessage.trim(),
          sender_name: student.name,
        })
        .select()
        .single();

      if (error) {
        // If DB error occurs, use Socket.io only
        console.error("Database insertion error:", error);

        // Create a temporary message
        const tempId = Date.now().toString();
        const tempMessage = {
          id: tempId,
          text: newMessage.trim(),
          senderId: student.id,
          senderName: student.name,
          time: new Date().toISOString(),
        };

        // Add to local messages and track the ID
        sentMessageIds.add(tempId);
        setMessages((prev) => [...prev, tempMessage]);
        // Don't auto-scroll for sent messages

        // Emit via socket
        socket.emit("chatMessage", {
          userId: student.id,
          userName: student.name,
          course: student.course,
          message: newMessage.trim(),
          messageId: tempId,
        });

        setNewMessage("");
        return;
      }

      // Format message for the UI
      const formattedMessage = {
        id: data.id,
        text: data.content,
        senderId: data.user_id,
        senderName: data.sender_name,
        time: data.created_at,
      };

      // Add to local messages and track the ID to prevent duplication
      sentMessageIds.add(data.id);
      setMessages((prev) => [...prev, formattedMessage]);
      // Don't auto-scroll for sent messages

      // Emit the message to the socket for other users
      socket.emit("chatMessage", {
        userId: student.id,
        userName: student.name,
        course: student.course,
        message: newMessage.trim(),
        messageId: formattedMessage.id,
      });

      // Clear input field
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get the first initial of a name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Format time using moment.js
  const formatTime = (timestamp) => {
    return moment(timestamp).format("h:mm A");
  };

  if (!student) {
    return (
      <div className="no-course-message">
        <h2>Please login to use CampusConnect</h2>
      </div>
    );
  }

  if (!student.course) {
    return (
      <div className="no-course-message">
        <h2>You are not enrolled in any course</h2>
        <p>
          Please update your profile with your course information to use
          CampusConnect.
        </p>
      </div>
    );
  }

  return (
    <div className="campus-connect-container">
      {/* Sidebar with course information and student list */}
      <div className="sidebar">
        <div className="course-info">
          <h3>{student.course}</h3>
          <p>{courseStudents.length} students enrolled</p>
        </div>
        <div className="student-list">
          {courseStudents.map((s) => (
            <div key={s.id} className="student-item">
              <div className="student-avatar">{getInitial(s.name)}</div>
              <div className="student-details">
                <div className="student-name">{s.name}</div>
                <div className="student-course">Semester: {s.sem}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat section */}
      <div className="chat-section">
        <div className="chat-header">{student.course} Group Chat</div>
        <div className="messages-container">
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.senderId === student.id ? "sent" : "received"
                }`}
              >
                {msg.senderId !== student.id && (
                  <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    {msg.senderName}
                  </div>
                )}
                <div>{msg.text}</div>
                <div className="message-time">{formatTime(msg.time)}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default CampusConnect;
