# **App Name**: CubeAce

## Core Features:

- Automated State Input: Cube state detection using image recognition and AI algorithms from user photo or upload. This feature analyzes images to determine the current arrangement of colors on each face of the cube, which it passes to the solving tool.
- AI Solver: AI powered solution generation. Uses the cube state reported by the detection feature as input for an LLM tool to generate an efficient sequence of moves to solve the cube, based on the chosen solving method (beginner's or advanced).
- Animated Solution Display: Interactive 3D cube animation which follows the solution from the AI to provide a visual guide for each move.
- Solving Method Toggle: User-selectable solving methods (beginner's layer-by-layer and advanced CFOP algorithm).
- Practice Mode: Practice mode which features a built-in scramble generator and a timer to track solving times.
- Multiple Cube Sizes: Support for 2x2, 3x3 and 4x4 cube types.
- Theme Selection: Switchable light and dark themes for user preference.
- Step-by-Step Hint Mode: Users can choose to reveal moves one at a time instead of seeing the whole solution at once.
- Solve Statistics: After each solve, show move count, solve time, and efficiency rating (Beginner / Average / Expert).
- Custom Themes: Already have light/dark; add a few preset cube color themes (classic, pastel, high contrast).
- Scramble History: Save the last 5 scrambles so users can retry them later.
- Daily Challenge: One preset scramble per day with a small leaderboard (local, not online).

## Style Guidelines:

- Primary Color: Deep Blue (#2E86C1). This still gives the trust/intelligence vibe but feels richer and more premium.
- Secondary Color: Cube Yellow (#F1C40F) as a secondary accent to match Rubik’s Cube colors and create variation beyond orange.
- Background Colors: Light Mode: Very light gray (#F0F2F5)
- Background Colors: Dark Mode: Dark charcoal gray (#212529) for deeper contrast.
- Accent Color: Orange (#E67E22) for buttons and highlights, but use hover and pressed states (slightly lighter or darker tones).
- Headlines: Poppins (bold for titles, medium for subheaders).
- Body: PT Sans (regular for content, italic for hints/tooltips).
- Minimalistic, outlined icons with subtle fill on hover for an interactive feel.
- Use ease-in-out 300ms transitions for cube rotations, theme switches, and button presses.
- Slight scale-up on hover for interactive elements.
- Responsive Layout: Optimize cube and controls placement for one-handed use on mobile.
- Cube-Themed Touch: Subtle cube-pattern watermark in background (very low opacity) to tie in with the app theme without clutter.