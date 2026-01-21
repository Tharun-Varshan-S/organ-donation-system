# React Blood UI - Healthcare Authentication Portal

A production-ready React application converted from HTML/CSS/JS, featuring a glassmorphism design with video background and multi-role authentication.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
react-blood-ui/
├── public/
│   └── 5452-183788682_small.mp4    # Background video
├── src/
│   ├── components/
│   │   ├── VideoBackground.jsx      # Fullscreen video component
│   │   ├── VideoBackground.css
│   │   ├── RoleTabs.jsx            # Role selection tabs
│   │   ├── RoleTabs.css
│   │   ├── AuthForm.jsx            # Dynamic authentication form
│   │   ├── AuthForm.css
│   │   ├── AuthPage.jsx            # Main page component
│   │   └── AuthPage.css
│   ├── App.jsx                     # Root component
│   ├── App.css
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## ✨ Features

### UI/UX
- **Fullscreen video background** with autoplay and fallbacks
- **Glassmorphism design** with backdrop blur effects
- **Smooth animations** and transitions
- **Fully responsive** layout
- **Accessibility compliant** with ARIA labels

### Authentication
- **Multi-role support**: User, Hospital, Admin
- **Dynamic form fields** based on selected role
- **Login/Register toggle** with smooth animations
- **Form validation** with error messages
- **Mock API integration** with loading states

### Role-Specific Fields
- **User**: Email, Password, Full Name
- **Hospital**: + Hospital Name, License Number
- **Admin**: + Secret Key

## 🔧 Technical Details

### React Patterns Used
- **Functional components** with hooks
- **useState** for state management
- **useEffect** for side effects
- **useRef** for DOM manipulation
- **Component composition** for reusability

### State Management
```javascript
// Main state in AuthPage component
const [selectedRole, setSelectedRole] = useState('user')
const [authMode, setAuthMode] = useState('login')
const [statusMessage, setStatusMessage] = useState({ text: '', type: '' })
const [isLoading, setIsLoading] = useState(false)
```

### Key Components

#### VideoBackground
- Handles video autoplay with multiple fallback strategies
- Responsive video overlay and fallback gradient

#### RoleTabs
- Animated role selector with smooth indicator movement
- Accessible with proper ARIA attributes

#### AuthForm
- Dynamic form fields based on role and auth mode
- Built-in validation and error handling
- Controlled components with React state

#### AuthPage
- Main container managing all state
- Handles form submission with mock API calls
- Auto-hiding status messages

## 🎨 Styling

- **CSS Custom Properties** for consistent theming
- **Component-scoped CSS** files
- **Responsive design** with mobile-first approach
- **Smooth animations** using CSS transitions
- **Glassmorphism effects** with backdrop-filter

## 🔒 Form Validation

- Required field validation
- Role-specific field requirements
- Real-time error feedback
- Accessible error messages

## 📱 Responsive Design

- Mobile-optimized layout
- Touch-friendly interactions
- Scalable typography
- Flexible grid system

## 🚀 Production Ready

- Optimized build with Vite
- Tree-shaking for smaller bundles
- Modern ES6+ syntax
- Performance optimized components

## 🎯 Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Status**: Production-ready React authentication portal with glassmorphism design ✨