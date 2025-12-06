# Voice-to-Text Review Interface Design Guidelines

## Design Approach
**Vibrant & Fun**: A playful, modern design with rich gradients and interactive elements. Inspired by consumer apps that feel approachable and engaging while maintaining accessibility and clarity.

## Color Palette

### Primary Colors (Purple/Pink Gradient Theme)
- **Primary**: Purple (280, 85%, 60%) - Vibrant purple for main actions
- **Secondary**: Pink tones (320, 70%) - Playful accent color
- **Accent**: Golden yellow (45, 95%, 65%) - For highlights and emphasis

### Background
- **Light Mode**: Soft gradient from purple-50 via pink-50 to orange-50
- **Dark Mode**: Deep purple tones (270, 30%, 8%) with subtle pink accents

### Surface Colors
- Cards use white/80% opacity with backdrop blur for a frosted glass effect
- Borders use soft purple tones (purple-100 light, purple-900/30 dark)

## Core Design Principles
1. **Playful Interactivity**: Buttons and elements have gradient backgrounds with subtle glow effects
2. **Visual Delight**: Animations and transitions make the interface feel alive
3. **Approachable Design**: Rounded corners, soft shadows, and friendly colors
4. **Global Accessibility**: High contrast maintained despite colorful design

---

## Typography System

**Font Family**: Inter (via Google Fonts CDN)
- Primary: Inter Regular (400) for body text
- Emphasis: Inter Medium (500) for labels and buttons
- Headers: Inter SemiBold (600) for section titles

**Gradient Text**: Headers use gradient text (purple-600 to pink-600) for visual impact

**Type Scale**:
- Page title: text-2xl (24px)
- Section headers: text-lg (18px) with gradient
- Body/transcription text: text-base (16px)
- Button labels: text-sm (14px)
- Helper text: text-xs (12px)
- Timer/metadata: text-sm tabular-nums

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-6
- Section spacing: space-y-4
- Button spacing: px-6 py-3
- Icon margins: mr-2, ml-2

**Container Structure**:
- Max width: max-w-4xl for page, max-w-2xl for review section
- Background: Gradient (from-purple-50 via-pink-50 to-orange-50)
- Cards: bg-white/80 with backdrop-blur-sm

---

## Component Specifications

### 1. Header
- Gradient logo icon (purple-500 to pink-500)
- Brand name with gradient text
- Frosted glass background (bg-white/80 backdrop-blur-md)

### 2. Review Section Container
- White card with 80% opacity and backdrop blur
- Soft purple border (border-purple-100)
- Shadow with purple tint (shadow-lg)
- Gradient icon and title

### 3. Microphone Button
- Large circular button (w-16 h-16 md:w-20 md:h-20)
- Gradient background (purple-500 to pink-500)
- Subtle glow effect behind button
- Recording state: Red-pink gradient with ping animation
- Smooth transitions on hover/active

### 4. Language Support
- Subtle hint with Globe icon
- Tooltip on hover showing supported languages
- Non-intrusive, discoverable on demand

### 5. Star Rating
- Interactive stars with smooth transitions
- Clear visual feedback on selection

### 6. Action Buttons
- Primary button: Solid gradient or primary color
- Secondary buttons: Ghost variant
- Consistent sizing and spacing

---

## Animations & Interactions

**Microphone Button**:
- Idle: Subtle purple glow behind button
- Recording: Ping animation with red/pink gradient
- Pulse effect for visual feedback

**Transitions**:
- Duration: 200ms for most interactions
- Active state: scale-95 for press feedback
- Hover: shadow-xl and color intensification

---

## Iconography
**Library**: Lucide React
- Microphone: Recording trigger
- Square: Stop recording
- Globe: Language support indicator
- MessageSquare: Review section icon
- Keyboard: Text input toggle

**Icon Sizing**:
- Primary buttons: w-6 h-6 to w-8 h-8
- Header icons: w-4 h-4
- Helper icons: w-3 h-3 to w-4 h-4

---

## Accessibility Features
- High contrast text ratios maintained
- Clear focus indicators
- ARIA labels for all interactive elements
- Large touch targets (min 44x44px)
- Keyboard navigation support
- Screen reader announcements

---

## Responsive Behavior
**Mobile (< 768px)**:
- Full-width components
- Stacked button layouts
- Larger touch targets

**Desktop (≥ 768px)**:
- Constrained max-width
- Horizontal button arrangements
- Slightly more compact spacing

---

## Dark Mode
- Deep purple background tones
- Cards with subtle transparency
- Gradient text adjusts to lighter purple-400 to pink-400
- Shadows use purple tints for cohesion
