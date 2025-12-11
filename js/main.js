// Main application logic

let currentFigure = null;
let calculationHistory = [];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initCalculator();
    initExtras();
    // Don't initialize 3D scene here, it will be initialized when a figure is selected
});

// Initialize figures menu
function initMenu() {
    const figureCards = document.querySelectorAll('.figure-card');
    
    figureCards.forEach(card => {
        card.addEventListener('click', () => {
            const figureType = card.getAttribute('data-figure');
            showFigure(figureType);
        });
    });
}

// Show selected figure
function showFigure(figureType) {
    currentFigure = figureType;
    
    // Hide menu and show main content
    document.getElementById('figuresMenu').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // Initialize 3D scene only if not initialized, or resize it if it already exists
    // Check if renderer exists by checking if there's a canvas in the container
    const container = document.getElementById('canvas3D');
    const hasCanvas = container && container.querySelector('canvas');
    
    if (!hasCanvas) {
        init3DScene('canvas3D');
    } else {
        // Ensure renderer has correct size when container becomes visible
        if (container && typeof renderer !== 'undefined' && renderer) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width > 0 && height > 0) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        }
    }
    
    // Update title
    const titles = {
        cubo: 'Cube',
        esfera: 'Sphere',
        cilindro: 'Cylinder',
        cono: 'Cone',
        piramide: 'Pyramid',
        paraboloide: 'Paraboloid',
        elipsoide: 'Ellipsoid'
    };
    
    document.getElementById('figureTitle').textContent = titles[figureType];
    
    // Show formula
    document.getElementById('formulaText').textContent = Formulas[figureType];
    
    // Create inputs
    createInputs(figureType);
    
    // Create 3D figure with default dimensions
    // Use setTimeout to ensure container is completely visible
    setTimeout(() => {
        const defaultDimensions = getDefaultDimensions(figureType);
        createFigure(figureType, defaultDimensions);
    }, 50);
}

// Get default dimensions
function getDefaultDimensions(figureType) {
    switch (figureType) {
        case 'cubo':
            return { a: 1 };
        case 'esfera':
            return { r: 1 };
        case 'cilindro':
        case 'cono':
            return { r: 1, h: 2 };
        case 'piramide':
            return { l: 1, h: 2 };
        case 'paraboloide':
            return { h: 2 };
        case 'elipsoide':
            return { a: 2, b: 1, c: 3 }; // For 9x² + 36y² + 4z² = 36
        default:
            return {};
    }
}

// Create inputs dynamically
function createInputs(figureType) {
    const container = document.getElementById('inputsContainer');
    container.innerHTML = '';
    
    const inputs = FigureInputs[figureType];
    
    inputs.forEach(input => {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = input.label;
        label.setAttribute('for', input.id);
        
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.id = input.id;
        inputElement.min = '0.01';
        inputElement.step = '0.01';
        inputElement.value = getDefaultDimensions(figureType)[input.key] || '1';
        inputElement.required = true;
        
        // Update 3D visualization when values change
        inputElement.addEventListener('input', () => {
            updateFigureFromInputs();
        });
        
        group.appendChild(label);
        group.appendChild(inputElement);
        container.appendChild(group);
    });
    
    // Hide previous result
    document.getElementById('resultContainer').style.display = 'none';
}

// Update 3D figure from inputs
function updateFigureFromInputs() {
    if (!currentFigure) return;
    
    const inputs = FigureInputs[currentFigure];
    const dimensions = {};
    
    inputs.forEach(input => {
        const value = parseFloat(document.getElementById(input.id).value);
        if (!isNaN(value) && value > 0) {
            dimensions[input.key] = value;
        }
    });
    
    if (Object.keys(dimensions).length === inputs.length) {
        updateFigureDimensions(currentFigure, dimensions);
    }
}

// Initialize calculator
function initCalculator() {
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', () => {
        calculateCurrentVolume();
    });
    
    // Allow calculation with Enter key
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && document.getElementById('mainContent').style.display !== 'none') {
            calculateCurrentVolume();
        }
    });
}

// Calculate current volume
function calculateCurrentVolume() {
    if (!currentFigure) return;
    
    const inputs = FigureInputs[currentFigure];
    const inputValues = {};
    
    inputs.forEach(input => {
        const value = parseFloat(document.getElementById(input.id).value);
        inputValues[input.key] = value;
    });
    
    const volume = calculateVolume(currentFigure, inputValues);
    
    if (volume !== null && !isNaN(volume)) {
        showResult(volume);
        addToHistory(currentFigure, inputValues, volume);
    } else {
        alert('Please enter valid values greater than 0');
    }
}

// Show result
function showResult(volume) {
    const resultContainer = document.getElementById('resultContainer');
    const resultValue = document.getElementById('resultValue');
    
    resultValue.textContent = formatVolume(volume);
    resultContainer.style.display = 'block';
    
    // Animation
    resultContainer.style.animation = 'none';
    setTimeout(() => {
        resultContainer.style.animation = 'slideInUp 0.5s ease-out';
    }, 10);
}

// Add to history
function addToHistory(figureType, dimensions, volume) {
    const figureNames = {
        cubo: 'Cube',
        esfera: 'Sphere',
        cilindro: 'Cylinder',
        cono: 'Cone',
        piramide: 'Pyramid',
        paraboloide: 'Paraboloid',
        elipsoide: 'Ellipsoid'
    };
    
    const historyItem = {
        figure: figureNames[figureType],
        dimensions: { ...dimensions },
        volume: volume,
        timestamp: new Date()
    };
    
    calculationHistory.unshift(historyItem);
    
    // Limit to 10 items
    if (calculationHistory.length > 10) {
        calculationHistory = calculationHistory.slice(0, 10);
    }
    
    updateHistoryDisplay();
    saveHistory();
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No calculations yet</p>';
        return;
    }
    
    historyList.innerHTML = calculationHistory.map((item, index) => {
        const dimsText = Object.entries(item.dimensions)
            .map(([key, value]) => `${key} = ${value}`)
            .join(', ');
        
        return `
            <div class="history-item">
                <strong>${item.figure}</strong><br>
                ${dimsText}<br>
                <span style="color: #009640; font-weight: bold;">V = ${formatVolume(item.volume)} u³</span>
            </div>
        `;
    }).join('');
}

// Save history to localStorage
function saveHistory() {
    try {
        localStorage.setItem('calc_history', JSON.stringify(calculationHistory));
    } catch (e) {
        console.warn('Could not save history:', e);
    }
}

// Load history from localStorage
function loadHistory() {
    try {
        const saved = localStorage.getItem('calc_history');
        if (saved) {
            calculationHistory = JSON.parse(saved);
            updateHistoryDisplay();
        }
    } catch (e) {
        console.warn('Could not load history:', e);
    }
}

// Initialize extras
function initExtras() {
    const extrasToggle = document.getElementById('extrasToggle');
    const extrasContent = document.getElementById('extrasContent');
    const clearHistoryBtn = document.getElementById('clearHistory');
    
    extrasToggle.addEventListener('click', () => {
        const isVisible = extrasContent.style.display !== 'none';
        extrasContent.style.display = isVisible ? 'none' : 'block';
    });
    
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the history?')) {
            calculationHistory = [];
            updateHistoryDisplay();
            saveHistory();
        }
    });
    
    // Load history on startup
    loadHistory();
}

// Back button
document.getElementById('backButton').addEventListener('click', () => {
    document.getElementById('figuresMenu').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    clearScene();
    currentFigure = null;
});

