# TickUp

TickUp is a **Smart Task Manager app** designed to help users stay organized and productive in their daily lives. It allows users to:

* **Add, update, and delete tasks**
* **Set deadlines** and get **reminder notifications** when due dates approach
* **Categorize tasks** into groups like Work, Personal, and Learning
* **Filter tasks** by category or deadline

The app is built using **React Native (Expo Go)** for the frontend, **Node.js with Express** for the backend, and **PostgreSQL** for structured data storage. It uses **JWT-based authentication** and a **backend scheduler** to trigger reminders.

## How to Run the Project

### Prerequisites
- Node.js
- npm
- PostgreSQL database
- Expo Go app on your mobile device

### Backend Setup
1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables
5. Set up PostgreSQL database
6. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install additional required packages
4. Update the `BASE_URL` in `client/utils/config.js` to point to your backend server
5. Start the Expo development server:
   ```bash
   npx expo start
   ```
6. Scan the QR code with Expo Go app on your mobile device

## Assumptions Made

### Technical Assumptions
- **Internet connectivity**: Users have intermittent internet access
- **Single user per device**: Authentication assumes one primary user per device installation
- **PostgreSQL availability**: Backend assumes PostgreSQL database is properly configured and accessible
- **Expo Go environment**: Development done through Expo Go app

### User Experience Assumptions
- **Simple categorization**: Users prefer predefined categories (Work, Personal, Learning, Other)
- **Standard priority levels**: Three-tier priority system (Low, Medium, High)
- **Date-based reminders**: Users primarily need deadline-based notifications

## Improvements if You Had More Time

### Core Functionality Enhancements
- **Real-time sync** across multiple devices using WebSockets (Socket.io)
- **Advanced recurring tasks** like daily, weekly, monthly patterns
- **Task dependencies** and subtask hierarchies
- **Collaborative features** for shared task lists and team workspaces

### User Experience Improvements
- **Refined visual design** with subtle color schemes to create a more elegant UI
- **Dark mode** toggle for better accessibility
- **Data visualization** with productivity analytics and completion trends

### Technical Enhancements
- **Offline-first architecture** with robust conflict resolution
- **Data export/import** functionality (CSV, JSON formats)
  
### Advanced Features
- **AI-powered task prioritization** based on deadlines and user behavior
- **Voice-to-text** task creation for hands-free input
- **Calendar integration** with Google Calendar and Outlook
- **Team collaboration** with task assignment and progress sharing
