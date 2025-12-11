// Volume calculations for different 3D figures

const VolumeCalculator = {
    // Cube: V = a³
    cubo: (a) => {
        return Math.pow(a, 3);
    },

    // Sphere: V = (4/3)πr³
    esfera: (r) => {
        return (4 / 3) * Math.PI * Math.pow(r, 3);
    },

    // Cylinder: V = πr²h
    cilindro: (r, h) => {
        return Math.PI * Math.pow(r, 2) * h;
    },

    // Cone: V = (1/3)πr²h
    cono: (r, h) => {
        return (1 / 3) * Math.PI * Math.pow(r, 2) * h;
    },

    // Pyramid: V = (1/3)l²h
    piramide: (l, h) => {
        return (1 / 3) * Math.pow(l, 2) * h;
    },

    // Paraboloid: x² + y² = z, V = (π/2)h² where h is the maximum height
    paraboloide: (h) => {
        return (Math.PI / 2) * Math.pow(h, 2);
    },

    // Ellipsoid: 9x² + 36y² + 4z² = 36, normalized: x²/4 + y²/1 + z²/9 = 1
    // V = (4/3)πabc where a, b, c are the semi-axes
    elipsoide: (a, b, c) => {
        return (4 / 3) * Math.PI * a * b * c;
    }
};

// Formulas in text format
const Formulas = {
    cubo: 'V = a³',
    esfera: 'V = (4/3)πr³',
    cilindro: 'V = πr²h',
    cono: 'V = (1/3)πr²h',
    piramide: 'V = (1/3)l²h',
    paraboloide: 'V = (π/2)h² (x²+y²=z)',
    elipsoide: 'V = (4/3)πabc (9x²+36y²+4z²=36)'
};

// Input configuration for each figure
const FigureInputs = {
    cubo: [
        { label: 'Side (a)', id: 'input-a', key: 'a' }
    ],
    esfera: [
        { label: 'Radius (r)', id: 'input-r', key: 'r' }
    ],
    cilindro: [
        { label: 'Radius (r)', id: 'input-r', key: 'r' },
        { label: 'Height (h)', id: 'input-h', key: 'h' }
    ],
    cono: [
        { label: 'Radius (r)', id: 'input-r', key: 'r' },
        { label: 'Height (h)', id: 'input-h', key: 'h' }
    ],
    piramide: [
        { label: 'Base side (l)', id: 'input-l', key: 'l' },
        { label: 'Height (h)', id: 'input-h', key: 'h' }
    ],
    paraboloide: [
        { label: 'Maximum height (h)', id: 'input-h', key: 'h' }
    ],
    elipsoide: [
        { label: 'Semi-axis X (a)', id: 'input-a', key: 'a' },
        { label: 'Semi-axis Y (b)', id: 'input-b', key: 'b' },
        { label: 'Semi-axis Z (c)', id: 'input-c', key: 'c' }
    ]
};

// Function to calculate volume according to figure
function calculateVolume(figureType, inputs) {
    const calculator = VolumeCalculator[figureType];
    if (!calculator) return null;

    const values = Object.values(inputs).map(v => parseFloat(v));
    
    if (values.some(v => isNaN(v) || v <= 0)) {
        return null;
    }

    return calculator(...values);
}

// Function to format the result
function formatVolume(volume) {
    if (volume === null || isNaN(volume)) return 'Error';
    
    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(4) + ' × 10⁶';
    } else if (volume >= 1000) {
        return volume.toFixed(2);
    } else if (volume >= 1) {
        return volume.toFixed(3);
    } else {
        return volume.toFixed(6);
    }
}

