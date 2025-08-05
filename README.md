# 🚀 Forward - Accelerator Platform

A comprehensive web-based management system for 2-week startup sprint programs. Built with Next.js 14, Firebase, and modern React technologies.

![TypeScript](https://img.shields.io/badge/TypeScript-98.7%25-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Firebase](https://img.shields.io/badge/Firebase-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-cyan)

## ✨ Features

### 🎯 **Project Management**
- Create and manage startup projects with clear Point A → Point B goals
- Beautiful card-based layout with horizontal scrolling daily updates
- Visual 14-day sprint progress tracking
- Project discovery and filtering

### 📊 **Daily Progress Tracking**
- Structured daily update forms
- Visual progress indicators with pastel colors
- Timeline view of 2-week sprints
- Progress accountability system

### 👥 **Team Collaboration**
- User discovery and networking
- Role-based access (Founder/Expert/Team Member)
- Team formation and project joining
- Expert-founder connection system

### 📅 **Calendar & Booking System**
- Google Calendar-style interface
- Expert availability management
- Session booking system (similar to Focusmate)
- Click-to-add availability slots

### 💬 **Expert Feedback System**
- Threaded comment system
- Expert insights and mentoring
- Real-time feedback and guidance
- Project-specific discussions

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI + Shadcn/ui** - Component library

### **Backend & Database**
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Admin SDK** - Server-side operations
- **Next.js API Routes** - RESTful endpoints

### **UI/UX**
- **Modern gradient design** - Cyan-to-blue aesthetic
- **Responsive design** - Mobile-first approach
- **Accessibility** - WCAG-compliant components
- **Loading states & animations** - Smooth user experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project
- Yarn or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SvetlanaNev/Forward_Kangaru.git
   cd Forward_Kangaru/app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Firebase configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or use existing `forward-2e9b1`

### 2. Enable Services
- **Authentication** → Enable Email/Password
- **Firestore** → Create database
- **Service Account** → Generate private key

### 3. Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... see .env.example for complete list
```

## 📁 Project Structure

```
app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (Firebase)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── [features]/       # Feature components
├── lib/                  # Utilities & config
│   ├── firebase.ts       # Firebase client config
│   ├── firebase-admin.ts # Firebase admin config
│   └── firebase-*.ts     # Firebase services
└── contexts/             # React contexts
```

## 🎨 Key Components

### **Project Cards**
Beautiful horizontal layout with:
- Project information and goals
- Team member avatars
- 14-day progress visualization
- Daily update cards with status indicators

### **Calendar Interface**
- Weekly/daily view toggle
- Click-to-add availability
- Color-coded time slots
- Session booking modals

### **Daily Updates**
- Structured update forms
- Progress visualization
- Expert feedback integration
- Timeline view

## 🔒 Security

- Firebase Authentication for user management
- Firestore security rules for data protection
- Role-based access control
- API route authentication with Firebase Admin

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Add environment variables
3. Deploy automatically

### **Manual Deployment**
```bash
npm run build
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📋 User Roles

### 🎯 **Founders**
- Create and manage projects
- Submit daily progress updates
- Track sprint progress
- Manage team invitations

### 🧑‍🏫 **Experts**
- Review and comment on projects
- Set availability for mentoring
- Book and manage coaching calls
- Provide structured feedback

### 👨‍💼 **Team Members**
- Discover and explore projects
- Book sessions with experts
- Network with other participants
- Join project teams

## 🎯 Core Features

### **2-Week Sprint Management**
- Point A (current state) → Point B (goal) framework
- Visual progress tracking with completion indicators
- Daily accountability through structured updates
- Expert feedback and guidance system

### **Networking & Collaboration**
- User discovery with role filtering
- Skills and expertise display
- Project-based team formation
- Expert-founder matching

### **Calendar & Booking**
- Expert availability management
- Session booking system
- Meeting room generation
- Attendee management

## 📊 Analytics & Progress

- Visual 14-day sprint timeline
- Daily completion tracking
- Progress indicators with color coding
- Expert engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 📞 Support

For support and questions, please open an issue or contact the development team.

---

**Built with ❤️ for startup founders, experts, and team members building the future.** 