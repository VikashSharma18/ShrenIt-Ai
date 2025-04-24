import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../Login/AuthContext";
import { supabase } from "../../../services/supabase";
import { io } from "socket.io-client";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -100 },
  };

  const studentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000");
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (student && socket) {
      socket.emit("joinRoom", { userId: student.id, course: student.course });
      socket.on("message", (message) => {
        if (!sentMessageIds.has(message.id)) {
          setMessages((prev) => [...prev, message]);
          if (message.senderId !== student.id) setShouldScroll(true);
        }
      });
      fetchMessages();
      fetchCourseStudents();
    }
    return () => socket?.off("message");
  }, [student, socket, sentMessageIds]);

  useEffect(() => {
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldScroll(false);
    }
  }, [messages, shouldScroll]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      if (!student?.course) return;

      const { data, error } = await supabase
        .from("messages")
        .select(`id, content, created_at, sender_name, user_id`)
        .eq("course_id", student.course)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data.map(msg => ({
        id: msg.id,
        text: msg.content,
        senderId: msg.user_id,
        senderName: msg.sender_name,
        time: msg.created_at,
      })));
      setShouldScroll(true);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async () => {
    try {
      if (!student?.course) return;

      const { data, error } = await supabase
        .from("student")
        .select("id, name, course, sem")
        .eq("course", student.course);

      if (error) throw error;
      setCourseStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !student) return;

    try {
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
        const tempId = Date.now().toString();
        const tempMessage = {
          id: tempId,
          text: newMessage.trim(),
          senderId: student.id,
          senderName: student.name,
          time: new Date().toISOString(),
        };
        sentMessageIds.add(tempId);
        setMessages((prev) => [...prev, tempMessage]);
        socket.emit("chatMessage", {
          userId: student.id,
          userName: student.name,
          course: student.course,
          message: newMessage.trim(),
          messageId: tempId,
        });
      } else {
        const formattedMessage = {
          id: data.id,
          text: data.content,
          senderId: data.user_id,
          senderName: data.sender_name,
          time: data.created_at,
        };
        sentMessageIds.add(data.id);
        setMessages((prev) => [...prev, formattedMessage]);
        socket.emit("chatMessage", {
          userId: student.id,
          userName: student.name,
          course: student.course,
          message: newMessage.trim(),
          messageId: formattedMessage.id,
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || "?";
  const formatTime = (timestamp) => moment(timestamp).format("h:mm A");

  if (!student) {
    return (
      <motion.div
        className="no-course-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2>Please login to use CampusConnect</h2>
      </motion.div>
    );
  }

  if (!student.course) {
    return (
      <motion.div
        className="no-course-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2>You are not enrolled in any course</h2>
        <p>Please update your profile to use CampusConnect.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="campus-connect-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sidebar */}
      <motion.div
        className="sidebar"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <div className="course-info">
          <h3>{student.course}</h3>
          <p>{courseStudents.length} students enrolled</p>
        </div>

        <motion.div className="student-list">
          <AnimatePresence>
            {courseStudents.map((student) => (
              <motion.div
                key={student.id}
                className="student-item"
                variants={studentVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="student-avatar">{getInitial(student.name)}</div>
                <div className="student-details">
                  <div className="student-name">{student.name}</div>
                  <div className="student-course">Sem {student.sem}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Chat Section */}
      <div className="chat-section">
        <div className="chat-header">{student.course} Group Chat</div>

        <div className="messages-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-dots">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="dot"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <i className="fas fa-comment-dots"></i>
              <p>No messages yet. Start chatting!</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`message ${msg.senderId === student.id ? "sent" : "received"}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  {msg.senderId !== student.id && (
                    <div className="message-sender">{msg.senderName}</div>
                  )}
                  <div className="message-content">{msg.text}</div>
                  <div className="message-time">{formatTime(msg.time)}</div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          )}
        </div>

        <motion.form
          onSubmit={sendMessage}
          className="message-input"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message"
          >
            <i className="fas fa-paper-plane"></i>
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default CampusConnect;