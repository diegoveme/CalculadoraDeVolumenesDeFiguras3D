# 3D Volume Calculator

Interactive web page to calculate volumes of 3D geometric figures with real-time 3D visualization.

## 🎨 Features

- **7 3D Figures**: Cube, Sphere, Cylinder, Cone, Pyramid, Paraboloid, and Ellipsoid
- **Interactive 3D Visualization**: Rotatable figures using Three.js with orbit controls
- **Volume Calculation**: Precise formulas for each figure
- **Modern Design**: Attractive interface with a professional color scheme
- **Calculation History**: Saves the last 10 calculations performed
- **Responsive**: Adaptable to different screen sizes
- **Real-time Updates**: 3D figures update dynamically as you change dimensions

## 🎨 Color Palette

- **Vibrant Green**: `#009640`
- **Professional Dark Blue**: `#003366`
- **White**: `#FFFFFF`
- **Light Gray**: `#CCCCCC`

## 📐 Available Figures

1. **Cube** (Hexahedron)
   - Formula: V = a³
   - Parameter: Side (a)

2. **Sphere**
   - Formula: V = (4/3)πr³
   - Parameter: Radius (r)

3. **Cylinder**
   - Formula: V = πr²h
   - Parameters: Radius (r), Height (h)

4. **Cone**
   - Formula: V = (1/3)πr²h
   - Parameters: Radius (r), Height (h)

5. **Pyramid** (Square pyramid)
   - Formula: V = (1/3)l²h
   - Parameters: Base side (l), Height (h)

6. **Paraboloid**
   - Formula: V = (π/2)h² (x²+y²=z)
   - Parameter: Maximum height (h)

7. **Ellipsoid**
   - Formula: V = (4/3)πabc (9x²+36y²+4z²=36)
   - Parameters: Semi-axis X (a), Semi-axis Y (b), Semi-axis Z (c)

## 🚀 Usage

1. Open `index.html` in your browser
2. Select a figure from the main menu
3. Enter the required dimensions
4. Click "Calculate Volume" or press Enter
5. View the result and the interactive 3D figure

## 📁 Project Structure

```
/
├── index.html          # Main page
├── css/
│   └── styles.css      # Styles and animations
├── js/
│   ├── main.js         # Main application logic
│   ├── figures.js      # 3D visualizations with Three.js
│   └── calculations.js # Volume calculations
└── README.md           # Documentation
```

## 🛠️ Technologies

- HTML5
- CSS3 (with animations and gradients)
- JavaScript (ES6+)
- Three.js (for 3D visualizations)
- OrbitControls (for interactive camera controls)

## ✨ Features Implemented

- Smooth animations in transitions
- Visual effects in the background
- Persistent history (localStorage)
- Interactive 3D visualization with mouse controls (rotate, zoom, pan)
- Responsive design for mobile and tablets
- Input validation
- Smart result formatting
- Real-time 3D figure updates when changing dimensions

## 📝 Notes

- Calculations are automatically saved in the browser
- 3D figures update in real-time when changing dimensions
- History is limited to 10 calculations to optimize performance
- Use mouse to rotate, scroll to zoom, and drag to pan the 3D figures

---

**3D Volume Calculator** - Calculate volumes of geometric figures with interactive 3D visualization
