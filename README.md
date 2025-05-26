# 🎫 404 Tickets - Incident Management System

<div align="center">
  
![404 Tickets Logo](https://img.shields.io/badge/404%20Tickets-v1.0-blue?style=for-the-badge&logo=ticket)
![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

*A modern, mobile-first incident management system for streamlined technical support*

[Features](#-key-features) • [Installation](#-installation-and-setup) • [Usage](#-how-to-run) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Project Description

**404 Tickets** is a comprehensive incident management system designed to streamline technical support operations. This mobile and web application enables users to efficiently create, track, and manage support tickets while providing administrators with powerful tools for ticket assignment, status updates, and user management.

### 🎯 Problem Solved
- **Centralized Support**: Eliminates scattered support requests across multiple channels
- **Improved Response Times**: Prioritized ticket system ensures critical issues are addressed first
- **Enhanced Tracking**: Complete audit trail and history for all support interactions
- **Mobile Accessibility**: Support team can manage tickets on-the-go with native mobile experience
- **Role-Based Access**: Secure, hierarchical permission system for different user types

---

## ✨ Key Features

### 👤 **User Management**
- **Secure Authentication**: JWT-based login/registration system
- **Role-Based Access Control**: Distinct User and Administrator roles
- **Profile Management**: User profile customization and settings
- **Password Security**: Encrypted password storage with bcrypt

### 🎫 **Ticket Management**
- **Easy Ticket Creation**: Intuitive form with priority selection
- **Real-time Status Updates**: Live ticket status tracking (Pending, In Progress, Resolved, Closed)
- **Priority Levels**: Critical, High, Medium, Low priority classification
- **Rich Comments System**: Threaded conversations and updates
- **Attachment Support**: File uploads for detailed issue reporting
- **Search & Filter**: Advanced filtering by status, priority, date, and keywords

### 👑 **Admin Dashboard**
- **Comprehensive Analytics**: Real-time statistics and reporting
- **User Management**: Create, edit, and manage user accounts
- **Ticket Assignment**: Assign tickets to specific team members
- **Bulk Operations**: Mass status updates and assignments
- **System Overview**: Health monitoring and performance metrics

### 📱 **Mobile Experience**
- **Native Performance**: React Native for smooth, responsive interface
- **Modern UI/UX**: Material Design with custom gradients and animations
- **Offline Support**: AsyncStorage for offline data persistence
- **Push Notifications**: Real-time alerts for ticket updates
- **Dark/Light Mode**: Adaptive theming support

---

## 🛠 Technologies Used

### **Frontend (Mobile)**
| Technology | Purpose | Version |
|------------|---------|---------|
| ![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=flat&logo=react&logoColor=black) | Mobile Framework | ^0.72.0 |
| ![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white) | Development Platform | ^49.0.0 |
| ![React Navigation](https://img.shields.io/badge/React%20Navigation-6C47FF?style=flat) | Navigation Library | ^6.0.0 |
| ![React Native Paper](https://img.shields.io/badge/RN%20Paper-6200EE?style=flat) | UI Component Library | ^5.0.0 |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white) | HTTP Client | ^1.5.0 |
| ![LinearGradient](https://img.shields.io/badge/Linear%20Gradient-FF6B6B?style=flat) | Visual Effects | ^12.3.0 |

### **Backend (API)**
| Technology | Purpose | Version |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) | Runtime Environment | ^18.0.0 |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) | Web Framework | ^4.18.0 |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) | Database | ^6.0.0 |
| ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat) | ODM Library | ^7.0.0 |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white) | Authentication | ^9.0.0 |
| ![bcryptjs](https://img.shields.io/badge/bcrypt-FF6B35?style=flat) | Password Hashing | ^2.4.3 |

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

### **Required Software**
- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** - [Download here](https://git-scm.com/)

### **Database**
- **MongoDB** (Local installation or cloud service)
  - Local: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Recommended)

### **Mobile Development**
- **Expo Go** app on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator) - Optional

---

## 🚀 Installation and Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/404-tickets.git
cd 404-tickets
```

### **2. Backend Setup**
```bash
cd backend
npm install
# or
yarn install
```

#### **Environment Configuration**
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/404-tickets
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/404-tickets

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

#### **Database Seeding (Optional)**
```bash
# Create admin user and sample data
npm run seed
```

### **3. Frontend Setup**
```bash
cd ../frontend
npm install
# or
yarn install
```

#### **API Configuration**
Update the API configuration in `src/config/api.js`:

```javascript
const API_CONFIG = {
  BASE_URL: 'http://your-backend-ip:5000/api', // Update this
  TIMEOUT: 10000,
};
```

For local development:
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:5000/api`)
- **Emulator**: Use `http://localhost:5000/api` or `http://10.0.2.2:5000/api` (Android)

---

## 🏃‍♂️ How to Run

### **1. Start the Backend Server**
```bash
cd backend
npm start
# or
yarn start

# For development with auto-reload
npm run dev
# or
yarn dev
```

✅ **Backend Status**: Server should start on `http://localhost:5000`

### **2. Run the Mobile Application**
```bash
cd frontend
npx expo start
# or
yarn start
```

#### **Running Options:**
- **📱 Physical Device**: Scan QR code with Expo Go app
- **🤖 Android Emulator**: Press `a` in terminal
- **📱 iOS Simulator**: Press `i` in terminal (macOS only)
- **🌐 Web Browser**: Press `w` in terminal

---

## 📁 Project Structure

```
404-tickets/
├── 📁 backend/                    # Node.js/Express API
│   ├── 📁 controllers/           # Route controllers
│   ├── 📁 middleware/            # Custom middleware
│   ├── 📁 models/                # Mongoose schemas
│   ├── 📁 routes/                # API route definitions
│   ├── 📁 utils/                 # Utility functions
│   ├── 📁 uploads/               # File upload directory
│   ├── 📄 .env                   # Environment variables
│   ├── 📄 server.js              # Entry point
│   └── 📄 package.json
│
├── 📁 frontend/                   # React Native Mobile App
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── 📄 ErrorMessage.js
│   │   │   ├── 📄 LoadingScreen.js
│   │   │   ├── 📄 StatusChip.js
│   │   │   └── 📄 PriorityChip.js
│   │   ├── 📁 contexts/          # React Context providers
│   │   │   └── 📄 AuthContext.js
│   │   ├── 📁 navigation/        # Navigation configuration
│   │   │   ├── 📄 AuthNavigator.js
│   │   │   └── 📄 MainNavigator.js
│   │   ├── 📁 screens/           # Screen components
│   │   │   ├── 📁 auth/         # Authentication screens
│   │   │   │   ├── 📄 LoginScreen.js
│   │   │   │   └── 📄 RegisterScreen.js
│   │   │   └── 📁 main/         # Main app screens
│   │   │       ├── 📄 HomeScreen.js
│   │   │       ├── 📄 TicketsScreen.js
│   │   │       ├── 📄 TicketDetailsScreen.js
│   │   │       ├── 📄 CreateTicketScreen.js
│   │   │       ├── 📄 ProfileScreen.js
│   │   │       └── 📄 AdminDashboardScreen.js
│   │   ├── 📁 services/          # API service layer
│   │   │   └── 📄 ticketService.js
│   │   ├── 📁 theme/             # Design system
│   │   │   └── 📄 index.js
│   │   └── 📁 utils/             # Utility functions
│   ├── 📄 App.js                 # Root component
│   ├── 📄 app.json               # Expo configuration
│   └── 📄 package.json
│
├── 📄 README.md                  # Project documentation
└── 📄 .gitignore                 # Git ignore rules
```

---

## 🔌 API Documentation

### **Authentication Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |

### **Ticket Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets` | Get user tickets | ✅ |
| POST | `/api/tickets` | Create new ticket | ✅ |
| GET | `/api/tickets/:id` | Get ticket details | ✅ |
| PUT | `/api/tickets/:id` | Update ticket | ✅ |
| DELETE | `/api/tickets/:id` | Delete ticket | ✅ |
| POST | `/api/tickets/:id/comments` | Add comment | ✅ |

### **Admin Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/tickets` | Get all tickets | ✅ (Admin) |
| GET | `/api/admin/users` | Get all users | ✅ (Admin) |
| PUT | `/api/admin/users/:id/role` | Update user role | ✅ (Admin) |
| GET | `/api/admin/stats` | Get system statistics | ✅ (Admin) |

---

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
npm test
# or
yarn test

# Run tests with coverage
npm run test:coverage
```

### **Frontend Testing**
```bash
cd frontend
npm test
# or
yarn test
```

---

## 🚢 Deployment

### **Backend Deployment (Heroku)**
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your-production-mongo-uri
heroku config:set JWT_SECRET=your-production-jwt-secret

# Deploy
git push heroku main
```

### **Mobile App Deployment**
```bash
# Build for production
npx expo build:android
npx expo build:ios

# Or use EAS Build (Recommended)
npm install -g @expo/cli
eas build --platform all
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### **1. Fork the Repository**
```bash
git fork https://github.com/your-username/404-tickets.git
```

### **2. Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

### **3. Commit Your Changes**
```bash
git commit -m "Add amazing feature"
```

### **4. Push to Branch**
```bash
git push origin feature/amazing-feature
```

### **5. Open a Pull Request**
Create a detailed pull request with description of changes.

#### **Contribution Guidelines**
- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages
- Keep pull requests focused and small

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 404 Tickets

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Support & Contact

### **Getting Help**
- 📖 **Documentation**: Check our [Wiki](https://github.com/your-username/404-tickets/wiki)
- 🐛 **Bug Reports**: [Create an Issue](https://github.com/your-username/404-tickets/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Request a Feature](https://github.com/your-username/404-tickets/issues/new?template=feature_request.md)
- 💬 **Discussions**: [Community Forum](https://github.com/your-username/404-tickets/discussions)

### **Contact Information**
- **Email**: support@404tickets.com
- **Website**: [https://404tickets.com](https://404tickets.com)
- **Twitter**: [@404tickets](https://twitter.com/404tickets)

---

## 🙏 Acknowledgments

- **React Native Team** for the amazing framework
- **Expo Team** for simplifying mobile development
- **MongoDB Team** for the robust database solution
- **Material Design** for the beautiful UI guidelines
- **Open Source Community** for inspiration and support

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/your-username/404-tickets?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/404-tickets?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/404-tickets)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/404-tickets)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/404-tickets)

---

<div align="center">

**Made with ❤️ by the 404 Tickets Team**

*If you found this project helpful, please give it a ⭐ star!*

</div>
