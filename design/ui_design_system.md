# UI Design System for Mobile Tyre Service Website

## Brand Identity

### Brand Values
- **Reliability:** Dependable service in emergency situations
- **Speed:** Quick response and efficient service
- **Trust:** Professional expertise and transparency
- **Accessibility:** Easy to use in stressful situations
- **Quality:** Premium service and products

### Color Palette

#### Primary Colors
- **Emergency Red:** #E53935
  - Used for emergency CTAs, alerts, and critical information
  - Conveys urgency and immediate attention
  - Accessibility: Passes WCAG 2.1 AA with white text

- **Brand Blue:** #1A73E8
  - Primary brand color for non-emergency elements
  - Used for buttons, links, and brand elements
  - Conveys trust, reliability, and professionalism
  - Accessibility: Passes WCAG 2.1 AA with white text

- **Neutral Black:** #212121
  - Used for primary text and high-contrast elements
  - Provides readability in outdoor conditions
  - Accessibility: Passes WCAG 2.1 AAA with white background

#### Secondary Colors
- **Success Green:** #2E7D32
  - Confirmation messages, completed states
  - Indicates successful actions and positive outcomes
  - Accessibility: Passes WCAG 2.1 AA with white text

- **Warning Amber:** #FF8F00
  - Used for warnings, important (but not critical) notifications
  - Indicates caution or attention required
  - Accessibility: Passes WCAG 2.1 AA with black text

- **Info Blue:** #0288D1
  - Informational messages, help text
  - Secondary actions and supporting elements
  - Accessibility: Passes WCAG 2.1 AA with white text

#### Neutral Colors
- **Dark Grey:** #424242
  - Secondary text, icons
  - Subtitles and less prominent information
  - Accessibility: Passes WCAG 2.1 AA with white background

- **Medium Grey:** #757575
  - Disabled states, tertiary text
  - Subtle UI elements and dividers
  - Accessibility: Passes WCAG 2.1 AA with white background

- **Light Grey:** #EEEEEE
  - Backgrounds, cards, form fields
  - Subtle separators and containers
  - Accessibility: Passes WCAG 2.1 AA with black text

- **White:** #FFFFFF
  - Primary background color
  - Text on dark backgrounds
  - High contrast elements
  - Accessibility: Passes WCAG 2.1 AAA with black text

### Typography

#### Font Family
- **Primary Font:** Inter
  - Clean, modern sans-serif with excellent readability
  - Available on Google Fonts with variable font support
  - Optimized for screen display and mobile devices
  - Extensive weight range for flexible hierarchy

- **Fallback Stack:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
  - Ensures consistent rendering across platforms
  - Optimized for each operating system

#### Type Scale
- **Display:** 36px/44px (2.25rem) - Bold (700)
  - Used for main headlines on landing pages
  - Limited to one per major section

- **Heading 1:** 30px/38px (1.875rem) - Bold (700)
  - Primary page headings
  - Section introductions

- **Heading 2:** 24px/32px (1.5rem) - Bold (700)
  - Section headings
  - Major content divisions

- **Heading 3:** 20px/28px (1.25rem) - Semibold (600)
  - Subsection headings
  - Feature headings

- **Heading 4:** 18px/26px (1.125rem) - Semibold (600)
  - Minor headings
  - Card titles

- **Body Large:** 18px/28px (1.125rem) - Regular (400)
  - Lead paragraphs
  - Important information
  - Enhanced readability contexts

- **Body:** 16px/24px (1rem) - Regular (400)
  - Primary body text
  - Form labels
  - General content

- **Body Small:** 14px/20px (0.875rem) - Regular (400)
  - Secondary information
  - Supporting text
  - Form help text

- **Caption:** 12px/16px (0.75rem) - Regular (400)
  - Captions
  - Legal text
  - Metadata

#### Type Treatments
- **Emergency Text:** Bold (700), slightly increased size (+2px), high contrast
- **Emphasis:** Semibold (600) or Medium (500) weight
- **Links:** Underlined on hover, brand blue color
- **Button Text:** 16px, Medium (500) or Semibold (600)
- **Error Text:** Emergency Red, 14px, Medium (500)

### Iconography

#### Icon System
- **Primary Set:** Material Design Icons
  - Comprehensive library with consistent style
  - Available in multiple formats (SVG, font)
  - Well-optimized for small sizes

- **Icon Sizes:**
  - Extra Small: 16×16px (UI elements, inline)
  - Small: 20×20px (compact buttons, dense UI)
  - Medium: 24×24px (standard UI elements)
  - Large: 32×32px (feature highlights)
  - Extra Large: 48×48px (hero elements, illustrations)

- **Icon Treatment:**
  - Filled style for primary actions
  - Outlined style for secondary actions
  - Consistent 2px stroke weight for outlined icons
  - Rounded corners (2px radius)

#### Key Icons
- **Emergency:** Bell, alert, warning triangle
- **Location:** Pin, map marker, current location
- **Vehicle:** Car, tyre, wheel
- **Service:** Wrench, toolbox, mobile service van
- **Communication:** Phone, message, email
- **Payment:** Credit card, secure payment, wallet
- **Time:** Clock, calendar, schedule
- **Navigation:** Arrows, chevrons, menu

## Components

### Buttons

#### Primary Button
- **Purpose:** Main calls to action, primary user path
- **Style:**
  - Background: Brand Blue (#1A73E8)
  - Text: White (#FFFFFF)
  - Height: 48px (mobile), 44px (desktop)
  - Padding: 16px 24px
  - Border Radius: 8px
  - Font: 16px Medium (500)
  - Icon: Optional, 20px, left or right aligned
- **States:**
  - Hover: 10% darker
  - Active: 15% darker
  - Disabled: 50% opacity, not clickable
- **Variations:**
  - Full Width (mobile primary)
  - Standard Width (desktop, secondary mobile)

#### Emergency Button
- **Purpose:** Emergency calls to action
- **Style:**
  - Background: Emergency Red (#E53935)
  - Text: White (#FFFFFF)
  - Height: 56px (mobile), 48px (desktop)
  - Padding: 16px 24px
  - Border Radius: 8px
  - Font: 18px Bold (700)
  - Icon: Optional, 24px, left aligned
  - Drop Shadow: subtle elevation
- **States:**
  - Hover: 10% darker
  - Active: 15% darker
  - Disabled: Not applicable (emergency buttons should always be enabled)
- **Variations:**
  - Call Button (with phone icon)
  - Location Button (with location icon)
  - Sticky Button (fixed to bottom of viewport)

#### Secondary Button
- **Purpose:** Alternative actions, secondary paths
- **Style:**
  - Background: White (#FFFFFF)
  - Border: 1px solid Brand Blue (#1A73E8)
  - Text: Brand Blue (#1A73E8)
  - Height: 44px (mobile), 40px (desktop)
  - Padding: 12px 20px
  - Border Radius: 8px
  - Font: 16px Medium (500)
- **States:**
  - Hover: Light blue background (#E8F0FE)
  - Active: Slightly darker blue background
  - Disabled: 50% opacity, not clickable

#### Tertiary Button
- **Purpose:** Minor actions, compact UI areas
- **Style:**
  - Background: Transparent
  - Text: Brand Blue (#1A73E8)
  - Height: 40px (mobile), 36px (desktop)
  - Padding: 8px 16px
  - Border Radius: 4px
  - Font: 14px Medium (500)
- **States:**
  - Hover: Light blue background (#E8F0FE)
  - Active: Slightly darker blue background
  - Disabled: 50% opacity, not clickable

#### Icon Button
- **Purpose:** Compact actions, UI density
- **Style:**
  - Background: Transparent
  - Icon: 24px, Brand Blue (#1A73E8)
  - Size: 48px × 48px (touch target)
  - Visual Size: 40px × 40px
  - Border Radius: 20px (circular)
- **States:**
  - Hover: Light blue background (#E8F0FE)
  - Active: Slightly darker blue background
  - Disabled: 50% opacity, not clickable

### Form Elements

#### Text Input
- **Style:**
  - Background: White (#FFFFFF)
  - Border: 1px solid Medium Grey (#BDBDBD)
  - Text: Neutral Black (#212121)
  - Height: 56px (mobile), 48px (desktop)
  - Padding: 16px
  - Border Radius: 8px
  - Font: 16px Regular (400)
  - Label: 14px Medium (500), positioned above input
  - Helper Text: 12px Regular (400), positioned below input
- **States:**
  - Focus: 2px border Brand Blue (#1A73E8)
  - Error: 2px border Emergency Red (#E53935), error message
  - Disabled: Light Grey background (#EEEEEE), 50% opacity text
  - Read-only: Light Grey background (#EEEEEE), normal text
- **Variations:**
  - With icon (left or right aligned)
  - With clear button (for search)
  - With action button (for search, verification)

#### Select Input
- **Style:**
  - Same base styling as Text Input
  - Dropdown Icon: Chevron down, right aligned
  - Selected Value: 16px Regular (400)
- **States:**
  - Same as Text Input
  - Open: Dropdown panel with options
- **Dropdown Panel:**
  - Background: White (#FFFFFF)
  - Border: 1px solid Light Grey (#EEEEEE)
  - Border Radius: 8px
  - Shadow: 0 4px 8px rgba(0,0,0,0.1)
  - Option Height: 48px
  - Option Padding: 16px
  - Selected Option: Light blue background (#E8F0FE)
  - Hover Option: Very light grey background (#F5F5F5)

#### Checkbox
- **Style:**
  - Size: 24px × 24px
  - Border: 2px solid Medium Grey (#757575)
  - Border Radius: 4px
  - Background (checked): Brand Blue (#1A73E8)
  - Checkmark: White (#FFFFFF)
  - Label: 16px Regular (400), positioned right of checkbox
- **States:**
  - Hover: Light grey background behind checkbox
  - Focus: Blue outline
  - Disabled: 50% opacity, not clickable

#### Radio Button
- **Style:**
  - Size: 24px × 24px (outer circle)
  - Inner Selected Circle: 12px × 12px
  - Border: 2px solid Medium Grey (#757575)
  - Border Radius: 50% (circular)
  - Background (selected): Brand Blue (#1A73E8)
  - Label: 16px Regular (400), positioned right of radio
- **States:**
  - Same as Checkbox

#### Toggle Switch
- **Style:**
  - Track Size: 36px × 20px
  - Thumb Size: 16px × 16px
  - Track Border Radius: 10px
  - Thumb Border Radius: 50% (circular)
  - Track Color (off): Light Grey (#BDBDBD)
  - Track Color (on): Brand Blue (#1A73E8)
  - Thumb Color: White (#FFFFFF)
  - Label: 16px Regular (400), positioned left of switch
- **States:**
  - Hover: Slight glow effect
  - Focus: Blue outline
  - Disabled: 50% opacity, not clickable

### Cards

#### Standard Card
- **Style:**
  - Background: White (#FFFFFF)
  - Border Radius: 12px
  - Shadow: 0 2px 8px rgba(0,0,0,0.08)
  - Padding: 20px
  - Title: 18px Semibold (600)
  - Content: 16px Regular (400)
- **Variations:**
  - With header image
  - With icon
  - With action buttons
  - With dividers between sections

#### Emergency Card
- **Style:**
  - Background: White (#FFFFFF)
  - Border: 2px solid Emergency Red (#E53935)
  - Border Radius: 12px
  - Shadow: 0 4px 12px rgba(0,0,0,0.12)
  - Padding: 24px
  - Title: 20px Bold (700), Emergency Red (#E53935)
  - Content: 16px Regular (400)
  - Icon: Alert/Emergency icon, 24px, Emergency Red
- **Variations:**
  - Full bleed emergency header
  - With countdown timer
  - With location information
  - With technician information

#### Service Card
- **Style:**
  - Background: White (#FFFFFF)
  - Border Radius: 12px
  - Shadow: 0 2px 8px rgba(0,0,0,0.08)
  - Padding: 16px
  - Icon: 32px, Brand Blue (#1A73E8)
  - Title: 18px Semibold (600)
  - Description: 14px Regular (400)
  - Price: 16px Bold (700)
- **Variations:**
  - With image
  - With comparison features
  - With action button
  - With rating/reviews

#### Review Card
- **Style:**
  - Background: White (#FFFFFF)
  - Border Radius: 12px
  - Shadow: 0 2px 4px rgba(0,0,0,0.04)
  - Padding: 16px
  - Rating: Star icons, 16px, Warning Amber (#FF8F00)
  - Quote: 16px Italic Regular (400)
  - Author: 14px Medium (500)
  - Date: 12px Regular (400), Medium Grey (#757575)
- **Variations:**
  - With user avatar
  - With service details
  - With verified badge
  - Compact version

### Navigation

#### Primary Navigation (Mobile)
- **Style:**
  - Bottom Navigation Bar
  - Background: White (#FFFFFF)
  - Shadow: 0 -2px 8px rgba(0,0,0,0.08)
  - Height: 64px
  - Icon Size: 24px
  - Label: 12px Medium (500)
  - Active Item: Brand Blue (#1A73E8)
  - Inactive Item: Medium Grey (#757575)
- **Items:**
  - Emergency (highlighted)
  - Services
  - Bookings
  - Account
  - More (overflow)

#### Primary Navigation (Desktop)
- **Style:**
  - Top Navigation Bar
  - Background: White (#FFFFFF)
  - Shadow: 0 2px 8px rgba(0,0,0,0.08)
  - Height: 72px
  - Logo: Left aligned
  - Nav Items: Right aligned
  - Item Spacing: 32px
  - Font: 16px Medium (500)
  - Active Item: Brand Blue (#1A73E8), underlined
  - Inactive Item: Neutral Black (#212121)
- **Items:**
  - Emergency (highlighted)
  - Services
  - Tyre Shop
  - About Us
  - Contact
  - Account/Login

#### Secondary Navigation
- **Style:**
  - Background: Light Grey (#F5F5F5)
  - Height: 48px
  - Font: 14px Medium (500)
  - Active Item: Brand Blue (#1A73E8), underlined
  - Inactive Item: Dark Grey (#424242)
  - Horizontal scrolling on mobile
- **Variations:**
  - Service categories
  - Tyre types
  - Information sections

#### Breadcrumbs
- **Style:**
  - Font: 14px Regular (400)
  - Separator: Chevron right icon, 12px
  - Current Page: Medium (500), not clickable
  - Previous Pages: Regular (400), clickable
  - Color: Dark Grey (#424242)
  - Spacing: 8px between items
- **Behavior:**
  - Collapse on mobile (show only current and previous level)
  - Full path on desktop
  - Horizontal scrolling if needed

### Alerts & Notifications

#### Emergency Alert
- **Style:**
  - Background: Emergency Red (#E53935)
  - Text: White (#FFFFFF)
  - Border Radius: 8px
  - Padding: 16px
  - Icon: Alert/Warning, 24px, White
  - Title: 16px Bold (700)
  - Content: 14px Regular (400)
  - Action: White underlined text or white outline button
- **Variations:**
  - Full width banner
  - Dismissible
  - With countdown
  - With action buttons

#### Success Alert
- **Style:**
  - Background: Success Green (#2E7D32)
  - Text: White (#FFFFFF)
  - Other properties same as Emergency Alert
- **Variations:**
  - Same as Emergency Alert

#### Warning Alert
- **Style:**
  - Background: Warning Amber (#FF8F00)
  - Text: Black (#212121)
  - Other properties same as Emergency Alert
- **Variations:**
  - Same as Emergency Alert

#### Info Alert
- **Style:**
  - Background: Info Blue (#0288D1)
  - Text: White (#FFFFFF)
  - Other properties same as Emergency Alert
- **Variations:**
  - Same as Emergency Alert

#### Toast Notification
- **Style:**
  - Background: Dark Grey (#424242)
  - Text: White (#FFFFFF)
  - Border Radius: 8px
  - Padding: 12px 16px
  - Font: 14px Regular (400)
  - Icon: Optional, 20px, left aligned
  - Shadow: 0 4px 12px rgba(0,0,0,0.2)
- **Behavior:**
  - Appears at bottom of screen on mobile
  - Appears at top right on desktop
  - Auto-dismisses after 5 seconds
  - Can be manually dismissed

### Specialized Components

#### Location Finder
- **Style:**
  - Input: Standard Text Input with location icon
  - Detect Button: Secondary Button with location icon
  - Results: List of service areas or confirmation
  - Map Preview: Optional, 200px height, rounded corners
- **States:**
  - Searching: Loading indicator
  - Found: Success confirmation with location name
  - Not Available: Warning with nearest available location
  - Error: Error message with retry option

#### Vehicle Selector
- **Style:**
  - Registration Input: Standard Text Input with car icon
  - Manual Toggle: Tertiary Button
  - Vehicle Display: Card with vehicle details
  - Make/Model Selectors: Standard Select Inputs
- **States:**
  - Initial: Empty input with prompt
  - Searching: Loading indicator
  - Found: Vehicle details display
  - Not Found: Error with manual entry option
  - Manual Mode: Series of select inputs

#### Booking Calendar
- **Style:**
  - Month Navigation: Icon Buttons with month name
  - Days: Grid layout
  - Day Cell: 44px × 44px, Light Grey background
  - Available Day: Brand Blue text (#1A73E8)
  - Selected Day: Brand Blue background, White text
  - Unavailable Day: Medium Grey text (#757575)
  - Time Slots: List of Select Inputs or button group
- **Variations:**
  - Compact daily view
  - Week view
  - With availability indicators
  - With price variations

#### Emergency Tracker
- **Style:**
  - Background: White (#FFFFFF)
  - Border: 2px solid Emergency Red (#E53935)
  - Border Radius: 12px
  - Padding: 20px
  - Map: 200px height, showing technician location
  - ETA: Large 24px Bold (700) text
  - Technician Info: Card with photo and details
  - Status Updates: Timeline component
- **States:**
  - Searching for technician
  - Technician assigned
  - En route (with live tracking)
  - Arriving soon (5 min warning)
  - Arrived

#### Review Component
- **Style:**
  - Star Rating: 5 stars, Warning Amber (#FF8F00)
  - Rating Input: Interactive star selection
  - Review Text: Standard Text Input (multiline)
  - Photo Upload: File input with preview
  - Submit: Primary Button
- **Variations:**
  - Simple (rating only)
  - Detailed (rating, text, photos)
  - Service-specific questions
  - With user details

## Layout System

### Grid System

#### Mobile Grid (320px-639px)
- **Container:** Fluid with 16px margins
- **Columns:** 4 columns
- **Gutters:** 16px
- **Margins:** 16px
- **Content Width:** Fluid (288px-607px)

#### Tablet Grid (640px-1023px)
- **Container:** Fluid with 24px margins
- **Columns:** 8 columns
- **Gutters:** 24px
- **Margins:** 24px
- **Content Width:** Fluid (592px-975px)

#### Desktop Grid (1024px-1279px)
- **Container:** Fixed 1000px with auto margins
- **Columns:** 12 columns
- **Gutters:** 24px
- **Margins:** Auto (centered)
- **Content Width:** 1000px

#### Large Desktop Grid (1280px+)
- **Container:** Fixed 1200px with auto margins
- **Columns:** 12 columns
- **Gutters:** 32px
- **Margins:** Auto (centered)
- **Content Width:** 1200px

### Spacing System

- **4px:** Minimum spacing, tight internal spacing
- **8px:** Default compact spacing, icon padding
- **16px:** Standard spacing, padding for most components
- **24px:** Medium spacing, padding for cards and sections
- **32px:** Large spacing, margins between components
- **48px:** Section spacing, vertical rhythm
- **64px:** Large section spacing, major page divisions
- **96px:** Extra large spacing, page sections on desktop

### Layout Patterns

#### Emergency Layout
- **Header:** Sticky emergency header with call button
- **Content:** Single column, focused on immediate action
- **Components:** Large, easy to tap buttons and inputs
- **Spacing:** Generous spacing for error-free interaction
- **Footer:** Minimal, focused on trust signals

#### Standard Layout
- **Header:** Standard navigation
- **Content:** Single column on mobile, multi-column on larger screens
- **Sidebar:** Hidden on mobile, visible on tablet and up
- **Components:** Standard sizing
- **Footer:** Full footer with all links and information

#### Dashboard Layout
- **Header:** Minimal with account information
- **Navigation:** Bottom tabs on mobile, side nav on desktop
- **Content:** Card-based, grid layout
- **Actions:** Floating action button for primary actions
- **Footer:** Minimal or absent

## Animation & Interaction

### Transition Speeds
- **Extra Fast:** 100ms - Micro-interactions, button states
- **Fast:** 200ms - Simple transitions, hover states
- **Standard:** 300ms - Most UI transitions
- **Slow:** 500ms - Complex or emphasis transitions
- **Extra Slow:** 800ms - Major view changes, celebrations

### Easing Functions
- **Standard:** cubic-bezier(0.4, 0.0, 0.2, 1) - Most transitions
- **Decelerate:** cubic-bezier(0.0, 0.0, 0.2, 1) - Elements entering the screen
- **Accelerate:** cubic-bezier(0.4, 0.0, 1, 1) - Elements leaving the screen
- **Sharp:** cubic-bezier(0.4, 0.0, 0.6, 1) - Quick emphasis

### Interaction States
- **Hover:** Subtle background change, cursor change
- **Focus:** Blue outline, visible focus ring
- **Active/Pressed:** Slight scale reduction (95%), darker color
- **Disabled:** 50% opacity, not clickable
- **Loading:** Pulse animation or progress indicator
- **Success:** Brief green highlight or checkmark animation
- **Error:** Shake animation, red highlight

### Micro-interactions
- **Button Press:** Slight scale reduction with ripple effect
- **Toggle Switch:** Smooth sliding animation
- **Form Validation:** Gentle shake for errors, subtle bounce for success
- **Notifications:** Slide in from top, fade out
- **Page Transitions:** Fade transition between pages
- **Loading States:** Pulsing animation or progress bar
- **Scroll to Top:** Smooth scroll animation

## Responsive Behavior

### Mobile-First Principles
- **Content Priority:** Critical content first
- **Progressive Enhancement:** Basic functionality, then enhanced
- **Touch Optimization:** All interactive elements min 44×44px
- **Simplified Navigation:** Focused on core user journeys
- **Performance Budget:** Fast loading on mobile networks

### Device-Specific Adaptations

#### Mobile Phones (320px-639px)
- Single column layouts
- Bottom navigation
- Collapsible sections
- Minimal form fields
- Large touch targets
- Click-to-call primary action
- Location detection prominence

#### Tablets (640px-1023px)
- Two-column layouts where appropriate
- Expanded navigation options
- Side-by-side comparisons
- Enhanced form capabilities
- Touch-optimized but with more detail
- Balance of call and form actions
- Map integrations more prominent

#### Desktops (1024px+)
- Multi-column layouts
- Persistent navigation and tools
- Advanced comparison tables
- Comprehensive forms with validation
- Hover states and tooltips
- Equal emphasis on call and form actions
- Full feature set visible

### Contextual Adaptations

#### Emergency Context
- Simplified layout
- Prominent call button
- Location services prioritized
- Minimal distractions
- High contrast for outdoor visibility
- Battery-efficient design
- Offline capabilities

#### Planning Context
- Detailed information
- Comparison tools
- Rich media content
- Advanced filtering
- Saved preferences
- Social proof elements
- Educational content

## Accessibility Guidelines

### Color & Contrast
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- Color not used as the only means of conveying information
- Additional indicators beyond color (icons, text)
- High contrast mode support

### Typography & Readability
- Minimum text size 16px for body text
- Line height at least 1.5× font size
- Maximum width of 70 characters per line
- Left-aligned text (not justified)
- Sufficient spacing between paragraphs
- Headings properly nested (H1 → H6)

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Skip navigation link
- Keyboard shortcuts for power users
- No keyboard traps

### Screen Reader Support
- Semantic HTML structure
- ARIA labels where necessary
- Alternative text for images
- Form labels properly associated
- Meaningful link text
- Landmark regions
- Dynamic content announcements

### Reduced Motion
- Respect prefers-reduced-motion media query
- Essential animations only when reduced motion preferred
- No autoplay videos
- No parallax effects
- Static alternatives to animations

## Dark Mode

### Color Adaptations
- **Background:** #121212 (Dark Grey)
- **Surface:** #1E1E1E (Slightly lighter Dark Grey)
- **Primary:** #90CAF9 (Lighter Brand Blue)
- **Emergency:** #EF9A9A (Lighter Emergency Red)
- **Text Primary:** #FFFFFF (White)
- **Text Secondary:** #B0B0B0 (Light Grey)

### Component Adaptations
- Reduced shadow usage
- 1dp elevation indicated by subtle lighter background
- Increased contrast for boundaries
- Softer emergency colors to prevent eye strain
- Reduced white space (more compact layouts)

### Implementation
- System preference detection
- Manual toggle option
- Persistent preference storage
- Smooth transition between modes
- Proper image adaptations (dimming, alternative assets)