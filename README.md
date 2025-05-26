# 🤖 AI-Powered Appointment Scheduler with Voice Assistant

A full-stack intelligent appointment booking system that uses voice commands and Agentic AI to schedule appointments with doctors, consultants, or service providers. Built for Holboxathon 2025.

---

## 🔗 Live Demo
 


---

## ✨ Key Features

- 🎙️ Voice assistant for booking, rescheduling, and navigating.
- 🧠 Agentic AI for conflict resolution and dynamic slot suggestion.
- 📅 Real-time appointment scheduling with A2A communication.
- 🔔 Email/SMS notifications for confirmations and reminders.
- 📊 Adaptive Data Kernel (ADK) for learning user preferences.
- ⚡️ MCP logic for smart time prioritization.
- 👤 Full user authentication system (Sign Up, Login, Profile).
- 🖼️ Smooth animations and responsive UI (TailwindCSS + Framer Motion).

---

## 🖥️ Tech Stack

**Frontend**: React, TailwindCSS, Framer Motion  
**Backend**: Node.js / Express.js  
**Voice Recognition**: OpenAI Whisper API / Web Speech API  
**Database**: MongoDB (via Mongoose)  
**Authentication**: JWT + bcrypt  
**Notifications**: Email (SendGrid) / SMS (Twilio)

---

## 🧠 AI & Logic Integration

- **Agentic AI**: Resolves time slot conflicts and adapts to user preferences.
- **MCP (Model Context Protocol)**: Dynamic priority-based decision making.
- **ADK (Adaptive Data Kernel)**: Learns and improves over time with user behavior.
- **A2A Communication**: Syncs between user, provider, and system agents.

---

## 🚧 Challenges Faced & Solutions

| Challenge | Solution |
|----------|----------|
| Voice not recognizing commands consistently | Tuned Whisper parameters and fallback to Web Speech API |
| Conflict resolution logic complexity | Introduced a time-priority matrix using MCP |
| Deployment issues with CORS | Used proper proxy and secure headers setup |
| Real-time updates in UI | Used WebSockets for instant feedback |

---

## 🔮 Future Improvements

- 📲 Mobile app version (React Native)
- 🧾 Admin panel for service providers
- 🗣️ Multilingual voice assistant
- 📂 Export appointment history as PDF
- 💬 Chat-based assistant alternative

---

## 📂 GitHub Repository

👉 [AI-Powered Appointment Scheduler](https://github.com/tusharkathe7/AI-Powered-Appointment-Scheduler)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
