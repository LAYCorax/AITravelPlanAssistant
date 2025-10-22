# Pages Directory

This directory contains all page-level components corresponding to routes.

## Structure

```
pages/
├── Auth/
│   ├── Login.tsx         # Login page
│   └── Register.tsx      # Registration page
├── Home/
│   └── Home.tsx          # Home/Dashboard page
├── TravelPlanner/
│   ├── PlannerInput.tsx  # Travel planning input page
│   └── PlanDetails.tsx   # Travel plan details page
├── MyPlans/
│   └── MyPlans.tsx       # User's travel plans list
├── Settings/
│   ├── Settings.tsx      # Settings main page
│   ├── APIConfig.tsx     # API key configuration
│   └── UserProfile.tsx   # User profile settings
└── NotFound/
    └── NotFound.tsx      # 404 page
```

## Page Components

- Each page is a container component that:
  - Handles routing logic
  - Manages page-level state
  - Composes smaller components
  - Handles data fetching
