const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Lighting - နေကနေ အလင်းထွက်တဲ့ vibe
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const planetData = {
    'MERCURY': { history: 'နေနှင့်အနီးဆုံး၊ အလွန်ပူပြင်းပြီး သံဓာတ်ကြွယ်ဝသော ဂြိုဟ်ဖြစ်သည်။', dist: 'Distance: 91.7 Million km' },
    'VENUS': { history: 'အလွန်တောက်ပသော်လည်း လေထုဖိအားနှင့် အပူချိန် အလွန်မြင့်မားသည်။', dist: 'Distance: 41 Million km' },
    'EARTH': { history: 'ကျွန်ုပ်တို့၏ တစ်ခုတည်းသော သက်ရှိများရှင်သန်ရာ အပြာရောင်ကမ္ဘာ။', dist: 'Our Home' },
    'MARS': { history: 'အနီရောင်ဂြိုဟ်၊ ရှေးဟောင်းရေစီးကြောင်း လက္ခဏာများ ရှိသည်။', dist: 'Distance: 78.3 Million km' },
    'JUPITER': { history: 'နေအဖွဲ့အစည်း၏ အကြီးဆုံး ဧရာမဓာတ်ငွေ့ဂြိုဟ်ကြီးဖြစ်သည်။', dist: 'Distance: 628.7 Million km' },
    'SATURN': { history: 'လှပသော ရေခဲကွင်းများစွာ ပိုင်ဆိုင်ထားသည့် ဂြိုဟ်ဖြစ်သည်။', dist: 'Distance: 1.2 Billion km' },
    'URANUS': { history: 'ဘေးတိုက်စောင်း၍ လည်ပတ်နေသော အေးခဲဓာတ်ငွေ့ဂြိုဟ်။', dist: 'Distance: 2.6 Billion km' },
    'NEPTUNE': { history: 'နေနှင့်အဝေးဆုံး၊ လေပြင်းများတိုက်ခတ်နေသော အပြာရောင်ဂြိုဟ်။', dist: 'Distance: 4.3 Billion km' }
};

const loader = new THREE.TextureLoader();

// Stars & Comets (ကြယ်ကြွေတာ)
function addStars() {
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for(let i=0; i<15000; i++) starPos.push((Math.random()-0.5)*2000, (Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.5});
    scene.add(new THREE.Points(starGeo, starMat));
}
addStars();

// Planet Creator
const planets = [];
function createPlanet(size, tex, dist, name, hasRings = false) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 64, 64),
        new THREE.MeshStandardMaterial({ 
            map: loader.load(tex),
            roughness: 0.7,
            metalness: 0.2
        })
    );
    const pivot = new THREE.Object3D();
    scene.add(pivot);
    pivot.add(mesh);
    mesh.position.x = dist;
    mesh.userData = { name: name };

    if(hasRings) { // Saturn's Rings
        const ringGeo = new THREE.RingGeometry(size * 1.5, size * 2.5, 64);
        const ringMat = new THREE.MeshBasicMaterial({ 
            map: loader.load('saturn.jpg'), // ဘရိုဆီကပုံကိုပဲ Ring အဖြစ်သုံးမယ်
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI/2;
        mesh.add(ring);
    }

    planets.push({ mesh, pivot, name });
    return mesh;
}

// Moon Creator
function createMoon(parent, dist) {
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 32, 32),
        new THREE.MeshStandardMaterial({ map: loader.load('mercury.jpg') }) // Mercury ပုံကို လ အဖြစ်သုံးမယ်
    );
    parent.add(moon);
    moon.position.x = dist;
    return moon;
}

// Create The Sun (နေလုံးကြီးကိုလည်း လည်စေမယ်)
const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(6, 64, 64),
    new THREE.MeshBasicMaterial({ map: loader.load('sun.jpg') })
);
scene.add(sunMesh);

// Init Planets
createPlanet(0.8, 'mercury.jpg', 15, 'MERCURY');
createPlanet(1.2, 'venus.jpg', 22, 'VENUS');
const earth = createPlanet(1.3, 'earth.jpg', 30, 'EARTH');
const moon = createMoon(earth, 2.5);
createPlanet(1.0, 'mars.jpg', 38, 'MARS');
createPlanet(3.5, 'Jupiter.jpg', 55, 'JUPITER');
createPlanet(3.0, 'saturn.jpg', 75, 'SATURN', true);
createPlanet(2.0, 'uranus.jpg', 90, 'URANUS');
createPlanet(2.0, 'neptune.jpg', 105, 'NEPTUNE');

// Camera Positioning (Cinematic View)
camera.position.set(0, 100, 150);
camera.lookAt(0, 0, 0);

// Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onInteract(e) {
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if(intersects.length > 0) {
        const target = intersects[0].object.userData.name || intersects[0].object.parent.userData.name;
        if(target && planetData[target]) {
            document.getElementById('p-name').innerText = target;
            document.getElementById('p-history').innerText = planetData[target].history;
            document.getElementById('p-distance').innerText = planetData[target].dist;
            document.getElementById('infoModal').style.display = 'flex';
        }
    }
}
window.addEventListener('mousedown', onInteract);
window.addEventListener('touchstart', onInteract);

// Animation Loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    sunMesh.rotation.y += 0.005; // နေကို လည်စေတာ

    planets.forEach((p, i) => {
        p.pivot.rotation.y += 0.01 / (i + 1); // Orbit Speed
        p.mesh.rotation.y += 0.02; // Self Rotation
    });

    moon.rotation.y += 0.05; // လကို လည်စေတာ

    // Camera Gentle Floating (အာကာသထဲ ရောက်နေတဲ့ vibe)
    camera.position.x = Math.sin(time) * 10;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function closeModal() { document.getElementById('infoModal').style.display = 'none'; }
