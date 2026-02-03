# LifeBridge - Organ Donation System

A modern React application for managing organ donation with separate dashboards for donors, hospitals, and administrators.

## Project Structure

```
ORGAN DONATION SYSTEM/
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx       # Authentication context and provider
│   ├── components/
│   │   ├── AnimatedBackground.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── DonorRow.jsx
│   │   ├── Footer.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── SearchFilters.jsx
│   │   └── Select.jsx
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── DonorDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── HospitalDashboard.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                # Global styles with Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Features

- **Home Page**: Landing page with information about organ donation
- **Login/Register**: Authentication for donors, hospitals, and admins
- **Donor Dashboard**: Profile management and donation status
- **Hospital Dashboard**: Search and filter donors, view matches
- **Admin Dashboard**: User management and system overview

## Technologies

- React 18
- Vite
- Tailwind CSS
- Lucide React (Icons)

## Notes

- All white text on light backgrounds has been changed to black for better visibility
- White text on dark backgrounds (navbar, footer) remains white as intended
- The application uses a context-based authentication system


## 📚 System Documentation

For detailed information about the system architecture, workflows, and features, please refer to the following documents:

- **[System Workflow](SYSTEM_WORKFLOW.md)**: Complete overview of the organ transplant lifecycle.
- **[Feature List](FINALIZED_FEATURE_LIST.md)**: Comprehensive list of all base and enhanced features.
- **[Enhanced Features](ENHANCED_FEATURES_DOCUMENTATION.md)**: Technical documentation of the advanced modules.
- **[Quick Reference](QUICK_REFERENCE_SUMMARY.md)**: At-a-glance summary for administrators and developers.
