# Voice-to-Text Review Interface Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from modern e-commerce platforms (Shopify, Etsy) combined with productivity tools (Linear, Notion) for clean, functional UI. Focus on clarity, accessibility, and seamless user flow.

## Core Design Principles
1. **Functional Clarity**: Every state change must be immediately obvious
2. **Progressive Disclosure**: Show complexity only when needed
3. **Global Accessibility**: High contrast, clear iconography, multilingual support
4. **Smooth Transitions**: Gentle state changes to reduce cognitive load

---

## Typography System

**Font Family**: Inter (via Google Fonts CDN)
- Primary: Inter Regular (400) for body text
- Emphasis: Inter Medium (500) for labels and buttons
- Headers: Inter SemiBold (600) for section titles

**Type Scale**:
- Page title: text-2xl (24px)
- Section headers: text-lg (18px)
- Body/transcription text: text-base (16px)
- Button labels: text-sm (14px) uppercase
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
- Max width: max-w-2xl (672px) for review section
- Mobile: Full width with px-4 padding
- Desktop: Centered with comfortable margins

---

## Component Specifications

### 1. Review Section Container
- Rounded card: rounded-xl
- Subtle border treatment
- Section padding: p-6 md:p-8
- Vertical spacing between elements: space-y-6

### 2. Microphone Button (Idle State)
- Large, prominent circular button (w-16 h-16 md:w-20 md:h-20)
- Center-aligned with supporting text below
- Icon: Heroicons microphone (solid variant)
- Text: "Tap to Speak Your Review" - text-base, positioned mt-3
- Shadow for depth

### 3. Recording State Interface
**Waveform Animation Area**:
- Full-width container: w-full h-24
- Centered waveform bars (8-12 vertical bars)
- Animated height variations using simple transform
- Timer display: Positioned top-right, text-lg tabular-nums

**Stop Recording Button**:
- Same size as initial microphone button
- Icon changes to stop square (Heroicons stop)
- Positioned center below waveform
- "Tap to Stop" helper text

### 4. Transcription Display
**Text Box**:
- Multi-line textarea: min-h-32 (128px)
- Rounded: rounded-lg
- Border treatment with focus states
- Padding: p-4
- Font: text-base with line-height-relaxed
- Placeholder: "Your review will appear here..."

**Language Indicator**:
- Positioned top-right of text box
- Small pill badge: px-3 py-1 rounded-full
- Icon (Heroicons language) + detected language
- Translation preview below if applicable: text-sm italic

### 5. Action Buttons
**Edit Button**:
- Secondary style (outline or ghost variant)
- Icon: Heroicons pencil + "Edit Review"
- Positioned left in button group

**Submit Button**:
- Primary emphasis (solid background)
- Icon: Heroicons paper-airplane + "Submit Review"
- Positioned right in button group

**Button Group Layout**:
- Flex container with gap-3
- Mobile: Stack vertically (flex-col)
- Desktop: Horizontal (flex-row justify-end)
- Both buttons: px-6 py-3, rounded-lg

---

## State Management & Transitions

**Three Primary States**:

1. **Idle**: Microphone button visible, encouraging CTA text
2. **Recording**: Waveform animation active, timer running, stop button prominent
3. **Review**: Transcription visible, language badge shown, edit/submit actions available

**Transitions**:
- Fade transitions between states: duration-300
- Scale animations for button press: scale-95 on active
- Smooth height adjustments for expanding text areas

---

## Iconography
**Library**: Heroicons (CDN link)
- Microphone (solid): Recording trigger
- Stop (solid): End recording
- Language: Auto-detect indicator
- Pencil: Edit action
- Paper-airplane: Submit action
- Check-circle: Success confirmation

**Icon Sizing**:
- Primary buttons: w-6 h-6
- Helper icons: w-4 h-4
- Success states: w-5 h-5

---

## Accessibility Features
- High contrast text ratios (WCAG AA minimum)
- Clear focus indicators on all interactive elements (ring-2 ring-offset-2)
- ARIA labels for all icon-only buttons
- Keyboard navigation support (tab order logical)
- Screen reader announcements for state changes
- Large touch targets for mobile (minimum 44x44px)

---

## Responsive Behavior
**Mobile (< 768px)**:
- Full-width components
- Stacked button layout
- Larger touch targets (buttons at least h-12)
- Generous spacing between elements

**Desktop (≥ 768px)**:
- Constrained max-width for comfortable reading
- Horizontal button arrangements
- Slightly more compact spacing

---

## Product Context Integration
This review section should feel integrated within a product page:
- Position below product details/images
- Clear visual separation from product content
- Consistent with overall e-commerce design language
- Optional product reference thumbnail at top of review section