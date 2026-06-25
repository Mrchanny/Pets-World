import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const LOCATIONS = [
  {
    id: 'giza',
    name: 'Pyramids of Giza',
    city: 'Giza',
    country: 'Egypt',
    flag: '🇪🇬',
    lat: 29.9792,
    lng: 31.1342,
    transmission: 'Reaching The Pyramids Of Giza, Egypt',
    duration: '0:56',
    views: 17,
    description: 'Ancient monuments meet modern signals. Operatives report an encrypted pulse emanating from the desert — something buried deeper than stone.',
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    flag: '🇹🇷',
    lat: 41.0082,
    lng: 28.9784,
    transmission: 'Pumpfun in Istanbul, Turkey',
    duration: '1:08',
    views: 25,
    description: 'Where East meets West, a new frequency emerges. The Bosphorus carries whispers of a token launch that shook the old city.',
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    city: 'Shanghai',
    country: 'China',
    flag: '🇨🇳',
    lat: 31.2304,
    lng: 121.4737,
    transmission: 'Surprises in Shanghai, China',
    duration: '1:48',
    views: 12,
    description: 'Neon towers and hidden alleys. Our source in Pudong intercepted unexpected data — the skyline holds more secrets than glass.',
  },
  {
    id: 'hongkong',
    name: 'Hong Kong',
    city: 'Hong Kong',
    country: 'China',
    flag: '🇭🇰',
    lat: 22.3193,
    lng: 114.1694,
    transmission: 'Conducting Research In Hong Kong',
    duration: '1:06',
    views: 10,
    description: 'Financial hub, research frontier. Anonymous cells are mapping connections between markets and the $WORLD network.',
  },
];

const WORLD_TRANSMISSION = {
  id: 'world',
  transmission: 'What is $WORLD',
  duration: '1:14',
  views: 69,
  featured: true,
};

let activeLocation = null;
let globe, markers = [], raycaster, mouse, camera, renderer, controls;

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function initGlobe() {
  const canvas = document.getElementById('globe-canvas');
  const container = canvas.parentElement;
  const size = container.clientWidth;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 2.8;

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.minPolarAngle = Math.PI * 0.3;
  controls.maxPolarAngle = Math.PI * 0.7;

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xe8a020, 1.2);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0x4466ff, 0.3);
  backLight.position.set(-3, -2, -4);
  scene.add(backLight);

  const radius = 1;
  const loader = new THREE.TextureLoader();
  const earthTexture = loader.load(
    'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
  );
  const bumpTexture = loader.load(
    'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'
  );

  const globeGeometry = new THREE.SphereGeometry(radius, 64, 64);
  const globeMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: bumpTexture,
    bumpScale: 0.015,
    specular: new THREE.Color(0x222222),
    shininess: 8,
  });

  globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.02, 64, 64);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xe8a020,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));

  const wireGeometry = new THREE.SphereGeometry(radius * 1.005, 32, 32);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    wireframe: true,
    transparent: true,
    opacity: 0.04,
  });
  scene.add(new THREE.Mesh(wireGeometry, wireMaterial));

  LOCATIONS.forEach((loc) => {
    const pos = latLngToVector3(loc.lat, loc.lng, radius * 1.01);

    const markerGroup = new THREE.Group();
    markerGroup.position.copy(pos);
    markerGroup.lookAt(0, 0, 0);
    markerGroup.userData = { location: loc };

    const dotGeometry = new THREE.SphereGeometry(0.025, 16, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xe8a020 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    markerGroup.add(dot);

    const ringGeometry = new THREE.RingGeometry(0.03, 0.045, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8a020,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.userData.isRing = true;
    markerGroup.add(ring);

    const pulseGeometry = new THREE.RingGeometry(0.04, 0.055, 32);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.userData.isPulse = true;
    markerGroup.add(pulse);

    globe.add(markerGroup);
    markers.push(markerGroup);
  });

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  canvas.addEventListener('click', onGlobeClick);
  canvas.addEventListener('mousemove', onGlobeHover);

  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    markers.forEach((m) => {
      m.children.forEach((child) => {
        if (child.userData.isRing) {
          child.scale.setScalar(1 + Math.sin(time * 2 + m.position.x) * 0.15);
        }
        if (child.userData.isPulse) {
          const s = 1 + Math.sin(time * 1.5) * 0.3;
          child.scale.setScalar(s);
          child.material.opacity = 0.15 + Math.sin(time * 1.5) * 0.15;
        }
      });
    });

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const newSize = container.clientWidth;
    renderer.setSize(newSize, newSize);
    camera.updateProjectionMatrix();
  });
}

function onGlobeClick(event) {
  const canvas = document.getElementById('globe-canvas');
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(markers, true);

  if (hits.length > 0) {
    let group = hits[0].object;
    while (group.parent && !group.userData.location) {
      group = group.parent;
    }
    if (group.userData.location) {
      selectLocation(group.userData.location);
      controls.autoRotate = false;
      setTimeout(() => { controls.autoRotate = true; }, 4000);
    }
  }
}

function onGlobeHover(event) {
  const canvas = document.getElementById('globe-canvas');
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(markers, true);
  canvas.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
}

function selectLocation(loc) {
  activeLocation = loc;
  updateLocationPanel(loc);
  updateQuickNav(loc.id);
  updateTransmissionCards(loc.id);

  document.getElementById('hud-coords').textContent =
    `LAT ${loc.lat.toFixed(2)}° · LNG ${loc.lng.toFixed(2)}°`;
  document.getElementById('hud-location').textContent =
    loc.city.toUpperCase() + ', ' + loc.country.toUpperCase();
}

function updateLocationPanel(loc) {
  const panel = document.getElementById('location-panel');
  panel.classList.add('active');
  panel.innerHTML = `
    <div class="location-panel__content">
      <div class="location-panel__flag">${loc.flag}</div>
      <div class="location-panel__country">${loc.country}</div>
      <h3 class="location-panel__city">${loc.city}</h3>
      <p class="location-panel__desc">${loc.description}</p>
      <div class="location-panel__transmission">
        <div class="location-panel__transmission-label">▶ Latest Transmission</div>
        <div class="location-panel__transmission-title">${loc.transmission}</div>
        <div class="location-panel__meta">
          <span>⏱ ${loc.duration}</span>
          <span>👁 ${loc.views} views</span>
        </div>
      </div>
    </div>
  `;
}

function buildQuickNav() {
  const nav = document.getElementById('location-nav');
  LOCATIONS.forEach((loc) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = `${loc.flag} ${loc.city}`;
    btn.dataset.id = loc.id;
    btn.addEventListener('click', () => selectLocation(loc));
    li.appendChild(btn);
    nav.appendChild(li);
  });
}

function updateQuickNav(id) {
  document.querySelectorAll('.location-quick-nav button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.id === id);
  });
}

function buildTransmissions() {
  const grid = document.getElementById('transmission-grid');
  const allTransmissions = [
    ...LOCATIONS.map((l) => ({ ...l, location: `${l.city}, ${l.country}` })),
    WORLD_TRANSMISSION,
  ];

  allTransmissions.sort((a, b) => b.views - a.views);

  allTransmissions.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'transmission-card' + (t.featured ? ' transmission-card__featured' : '');
    card.dataset.id = t.id || t.city?.toLowerCase();

    card.innerHTML = t.featured
      ? `
        <span class="transmission-card__duration">${t.duration}</span>
        <div>
          <div class="transmission-card__title">${t.transmission}</div>
          <div class="transmission-card__location">// classified briefing</div>
        </div>
        <span class="transmission-card__views">👁 ${t.views}</span>
      `
      : `
        <div class="transmission-card__duration">${t.duration}</div>
        <div class="transmission-card__title">${t.transmission}</div>
        <div class="transmission-card__location">${t.location}</div>
        <div class="transmission-card__views">👁 ${t.views} views</div>
      `;

    if (!t.featured) {
      card.addEventListener('click', () => {
        const loc = LOCATIONS.find((l) => l.id === t.id);
        if (loc) {
          selectLocation(loc);
          document.getElementById('globe').scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      card.addEventListener('click', () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
      });
    }

    grid.appendChild(card);
  });
}

function updateTransmissionCards(id) {
  document.querySelectorAll('.transmission-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.id === id);
  });
}

initGlobe();
buildQuickNav();
buildTransmissions();
