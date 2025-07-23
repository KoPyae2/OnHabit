# 🌱 OneHabit - Build Habits Alone or Together

A minimalist habit tracker designed for individuals and couples. Build consistency through daily check-ins, streak tracking, and partner synchronization.

![OneHabit Banner](https://github.com/KoPyae2/OnHabit/blob/master/public/screenshoot.png)

## ✨ Features

### 🎯 **Core Habit Tracking**
- **Daily Check-ins**: Simple one-tap habit completion
- **Streak Tracking**: Monitor current and best streaks
- **Mood Logging**: Track how you feel with each habit
- **Notes & Reflection**: Add personal notes to your check-ins
- **Smart Categories**: Organize habits by Health, Productivity, Mindfulness, etc.

### 👥 **Partner Features**
- **Sync Bonuses**: Extra points when both partners complete habits
- **Shared Progress**: See your partner's daily achievements
- **Motivation System**: Encourage each other with real-time updates
- **Partner Dashboard**: Dedicated view for couple's progress

### 📊 **Analytics & Insights**
- **Habit Patterns**: AI-powered analysis of your habit completion
- **Weekly/Monthly Reports**: Track long-term progress
- **Best Performance Days**: Identify your most productive days
- **Completion Rates**: Detailed statistics for each habit

### 🎯 **Goal Management**
- **Monthly Goals**: Set and track monthly objectives
- **Progress Monitoring**: Visual progress bars and completion rates
- **Goal Categories**: Personal, Health, Career, and Relationship goals
- **Achievement Celebrations**: Celebrate when you reach milestones

### 📱 **Mobile-First Design**
- **Responsive Layout**: Perfect for phones, tablets, and desktop
- **Touch-Friendly**: Optimized for mobile interactions
- **Fast Loading**: Instant updates with real-time sync
- **Clean Interface**: Minimalist design focused on usability

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router & TypeScript
- **Backend**: Convex (Real-time database & serverless functions)
- **Authentication**: NextAuth.js with Google OAuth
- **UI Framework**: Tailwind CSS + Radix UI components
- **Icons**: Lucide React
- **Deployment**: Vercel (Frontend) + Convex (Backend)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Convex account
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/onehabit.git
cd onehabit
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your environment variables:
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Convex
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url
```

4. **Set up Convex**
```bash
npx convex dev
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📱 Mobile Experience

OneHabit is designed mobile-first with:
- **Touch-optimized buttons** (44px minimum touch targets)
- **Smooth animations** for habit completion
- **Responsive navigation** that works on all screen sizes
- **Fast loading** with optimized images and fonts
- **Offline-ready** (coming soon)

## 🏗️ Project Structure

```
onehabit/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Main app pages
│   │   ├── today/        # Daily habit tracking
│   │   ├── time/         # Time-based analytics
│   │   ├── goals/        # Goal management
│   │   └── me/           # Profile settings
│   ├── home/             # Landing page
│   └── login/            # Authentication
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── layouts/          # Layout components
├── convex/               # Backend functions
│   ├── users.ts          # User management
│   ├── habits.ts         # Habit CRUD operations
│   ├── checkins.ts       # Check-in tracking
│   └── goals.ts          # Goal management
└── lib/                  # Utility functions
```

## 🎨 Design System

- **Colors**: Green-focused palette for growth and positivity
- **Typography**: Geist font family for modern readability
- **Components**: Consistent Radix UI components
- **Animations**: Smooth micro-interactions for better UX
- **Icons**: Lucide React for consistent iconography

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Convex
npx convex dev       # Start Convex development
npx convex deploy    # Deploy to production
npx convex dashboard # Open Convex dashboard
```

### Key Features Implementation

- **Real-time Updates**: Convex provides instant sync across devices
- **Authentication**: Secure Google OAuth with NextAuth.js
- **State Management**: React hooks with Convex queries/mutations
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **Type Safety**: Full TypeScript coverage

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Convex)
```bash
npx convex deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Convex](https://convex.dev) for real-time backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Radix UI](https://radix-ui.com) for accessible components
- [Lucide](https://lucide.dev) for beautiful icons

---

**Built with ❤️ for building better habits together** 🌱
