# BST Visualization Engine

An interactive Binary Search Tree (BST) visualization engine built with React, TypeScript, and Vite. This application provides real-time visual animations of BST operations with step-by-step algorithm execution.

## Features

### 🌲 Tree Operations
- **Insert**: Add nodes to the BST while maintaining the binary search tree property
- **Search**: Find nodes in the tree with visual path highlighting
- **Delete**: Remove nodes from the tree with proper restructuring
- **Create**: Generate random or default BST structures

### 🎯 Advanced Operations
- **Predecessor**: Find the in-order predecessor of a given node
- **Successor**: Find the in-order successor of a given node
- **K-th Selection**: Select the k-th smallest element in the tree

### 🔄 Tree Traversals
- **In-order Traversal**: Left → Root → Right traversal visualization
- **Pre-order Traversal**: Root → Left → Right traversal visualization
- **Post-order Traversal**: Left → Right → Root traversal visualization

### 🎬 Animation & Visualization
- **Step-by-step Animation**: Watch algorithms execute one step at a time
- **Playback Controls**: Play, pause, and navigate through animation steps
- **Variable Speed**: Adjust animation speed (0.5x, 1x, 2x, 4x)
- **Visual Highlighting**: 
  - **Visiting nodes** (green) - nodes being compared/traversed
  - **Found nodes** (orange) - search target found
  - **Inserting nodes** (cyan) - nodes being inserted
  - **Removing nodes** (red) - nodes being removed
  - **Path edges** (yellow) - active path highlighting

### 📊 Algorithm Panel
- Real-time pseudocode display
- Active line highlighting synchronized with animation
- Step-by-step description log
- Operation tracking with input values

### 🎨 User Interface
- Interactive canvas-based tree rendering
- Responsive sidebar with operation controls
- Modal input for operation parameters
- Control bar with playback controls
- Clean, modern design with smooth animations

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **HTML5 Canvas** - Tree rendering and visualization
- **CSS3** - Styling and animations

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── core/          # BST algorithms and data structures
├── canvas/        # Canvas rendering and animation logic
├── components/    # React components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ControlBar.tsx
│   ├── InputModal.tsx
│   └── AlgorithmPanel.tsx
├── types.ts       # TypeScript type definitions
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Features in Detail

### Interactive Visualization
The engine uses HTML5 Canvas to render the BST in real-time, with automatic layout calculation and smooth transitions between states.

### Animation System
A sophisticated playback system that:
- Captures each step of algorithm execution
- Maintains tree snapshots at each step
- Synchronizes visual highlights with code execution
- Provides frame-by-frame control

### Educational Value
Perfect for:
- Learning data structures and algorithms
- Understanding BST operations visually
- Teaching computer science concepts
- Debugging tree algorithms

## License

This project is open source and available under the MIT License.