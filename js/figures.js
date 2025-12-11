// 3D visualizations of figures using Three.js

let scene, camera, renderer, currentMesh = null;
let animationId = null;
let controls = null;

// Initialize 3D scene
function init3DScene(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous content
    if (renderer) {
        container.innerHTML = '';
    }

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);

    // Create camera - use container dimensions or default values if hidden
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // If container is hidden, use reasonable default dimensions
    if (width === 0 || height === 0) {
        width = 600;
        height = 400;
    }
    
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer - optimized for better performance
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio); // Optimize for different screens
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Orbit controls (rotation and zoom with mouse)
    try {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 0.5; // Allows getting much closer
        controls.maxDistance = 100; // Allows getting much farther
        controls.zoomSpeed = 1.2; // Faster zoom speed
    } catch (e) {
        console.warn('OrbitControls not available, using manual controls');
        initManualControls(renderer.domElement);
    }

    // Handle resizing
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// Create 3D figure
function createFigure(figureType, dimensions = {}) {
    // Ensure renderer has correct size before creating figure
    const container = document.getElementById('canvas3D');
    if (container && renderer) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    }
    
    // Show loader
    const loader = document.getElementById('loader3D');
    if (loader) {
        loader.classList.remove('hidden');
    }

    // Clear previous figure
    if (currentMesh) {
        scene.remove(currentMesh);
        if (currentMesh.children) {
            currentMesh.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        if (currentMesh.geometry) currentMesh.geometry.dispose();
        if (currentMesh.material) currentMesh.material.dispose();
    }

    // Use fixed dimensions for all figures (static size)
    const material = new THREE.MeshPhongMaterial({
        color: 0x009640,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x003366,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    let geometry;
    // Use real dimensions from inputs or default values
    const r = dimensions.r || 1;
    const h = dimensions.h || 2;
    const a = dimensions.a || 1;
    const b = dimensions.b || 1;
    const c = dimensions.c || 1;
    const l = dimensions.l || 1;
    
    switch (figureType) {
        case 'cubo':
            geometry = new THREE.BoxGeometry(a, a, a);
            break;

        case 'esfera':
            geometry = new THREE.SphereGeometry(r, 32, 32);
            break;

        case 'cilindro':
            // Radius in X and Z, height in Y
            geometry = new THREE.CylinderGeometry(r, r, h, 32);
            break;

        case 'cono':
            geometry = new THREE.ConeGeometry(r, h, 32);
            break;

        case 'piramide':
            // Base radius = l/√2 so square base has side l
            const baseRadius = l / Math.sqrt(2);
            geometry = new THREE.ConeGeometry(baseRadius, h, 4);
            break;

        case 'paraboloide':
            // Paraboloid: x² + y² = z
            geometry = createParaboloidGeometry(h);
            break;

        case 'elipsoide':
            // Ellipsoid: 9x² + 36y² + 4z² = 36 -> x²/4 + y²/1 + z²/9 = 1
            // Use semi-axes a, b, c
            geometry = createEllipsoidGeometry(a, b, c);
            break;

        default:
            geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    // Create group for figure with solid and wireframe material
    const group = new THREE.Group();
    
    const solidMesh = new THREE.Mesh(geometry, material);
    group.add(solidMesh);
    
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    group.add(wireframeMesh);

    currentMesh = group;
    scene.add(currentMesh);

    // Center the figure
    const box = new THREE.Box3().setFromObject(currentMesh);
    const center = box.getCenter(new THREE.Vector3());
    currentMesh.position.sub(center);

    // Adjust camera according to figure size
    adjustCameraToFigure(box);

    // Render first frame immediately
    renderer.render(scene, camera);

    // Wait for frame to render before hiding loader
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Hide loader only after it has been rendered
            if (loader) {
                loader.classList.add('hidden');
            }
            // Start continuous animation
            animate();
        });
    });
}

// Animation with controls (no automatic rotation)
function animate() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    function render() {
        if (controls) {
            controls.update(); // Update orbit controls
        }
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(render);
    }

    // Start animation loop
    render();
}

// Manual controls (fallback if OrbitControls is not available)
function initManualControls(domElement) {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };

    domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        domElement.style.cursor = 'grabbing';
    });

    domElement.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        rotation.y += deltaX * 0.01;
        rotation.x += deltaY * 0.01;
        
        if (currentMesh) {
            currentMesh.rotation.y = rotation.y;
            currentMesh.rotation.x = rotation.x;
        }
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    domElement.addEventListener('mouseup', () => {
        isDragging = false;
        domElement.style.cursor = 'grab';
    });

    domElement.addEventListener('mouseleave', () => {
        isDragging = false;
        domElement.style.cursor = 'grab';
    });

    domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * 0.01;
        // Allow much wider zoom
        camera.position.z = Math.max(0.5, Math.min(100, camera.position.z + delta));
    });

    domElement.style.cursor = 'grab';
}

// Update figure dimensions dynamically
function updateFigureDimensions(figureType, dimensions) {
    if (!currentMesh || !scene) return;
    
    // Get dimension values
    const r = dimensions.r || 1;
    const h = dimensions.h || 2;
    const a = dimensions.a || 1;
    const b = dimensions.b || 1;
    const c = dimensions.c || 1;
    const l = dimensions.l || 1;
    
    let newGeometry;
    
    switch (figureType) {
        case 'cubo':
            newGeometry = new THREE.BoxGeometry(a, a, a);
            break;

        case 'esfera':
            newGeometry = new THREE.SphereGeometry(r, 32, 32);
            break;

        case 'cilindro':
            // Radius in X and Z, height in Y
            newGeometry = new THREE.CylinderGeometry(r, r, h, 32);
            break;

        case 'cono':
            newGeometry = new THREE.ConeGeometry(r, h, 32);
            break;

        case 'piramide':
            const baseRadius = l / Math.sqrt(2);
            newGeometry = new THREE.ConeGeometry(baseRadius, h, 4);
            break;

        case 'paraboloide':
            newGeometry = createParaboloidGeometry(h);
            break;

        case 'elipsoide':
            newGeometry = createEllipsoidGeometry(a, b, c);
            break;

        default:
            newGeometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    // Update geometry of both meshes (solid and wireframe)
    if (currentMesh.children && currentMesh.children.length >= 2) {
        // Dispose old geometries
        currentMesh.children[0].geometry.dispose();
        currentMesh.children[1].geometry.dispose();
        
        // Assign new geometries
        currentMesh.children[0].geometry = newGeometry;
        currentMesh.children[1].geometry = newGeometry;
        
        // Recalculate center and reposition
        const box = new THREE.Box3().setFromObject(currentMesh);
        const center = box.getCenter(new THREE.Vector3());
        currentMesh.position.sub(center);
        
        // Adjust camera to new size
        adjustCameraToFigure(box);
    }
}

// Create paraboloid geometry: x² + y² = z
function createParaboloidGeometry(height) {
    const segments = 32;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    // Create paraboloid points
    for (let i = 0; i <= segments; i++) {
        const z = (i / segments) * height;
        const radius = Math.sqrt(z);
        
        for (let j = 0; j <= segments; j++) {
            const theta = (j / segments) * Math.PI * 2;
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta);
            
            vertices.push(x, z, y);
        }
    }
    
    // Create indices for faces
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + segments + 1;
            
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }
    
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    return geometry;
}

// Create ellipsoid geometry with semi-axes a, b, c
function createEllipsoidGeometry(a, b, c) {
    // Use a sphere and scale it
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Scale vertices
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        positions.setX(i, positions.getX(i) * a);
        positions.setY(i, positions.getY(i) * b);
        positions.setZ(i, positions.getZ(i) * c);
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
}

// Adjust camera according to figure size
function adjustCameraToFigure(box) {
    if (!box || !camera || !controls) return;
    
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Calculate optimal distance based on figure size
    // Use a factor that allows seeing the entire figure comfortably
    const distance = maxDim * 2.5;
    
    // Adjust camera position
    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);
    
    // Update controls
    if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
        
        // Adjust zoom limits according to size
        controls.minDistance = maxDim * 0.3; // Can get as close as 30% of size
        controls.maxDistance = maxDim * 10; // Can get as far as 10x the size
    }
}

// Clear scene
function clearScene() {
    if (currentMesh) {
        scene.remove(currentMesh);
        if (currentMesh.children) {
            currentMesh.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        if (currentMesh.geometry) currentMesh.geometry.dispose();
        if (currentMesh.material) currentMesh.material.dispose();
        currentMesh = null;
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

