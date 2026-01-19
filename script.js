const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2.5, 1000);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x444444));

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
const planets = [];
let targetPlanet = null; // Zoom ဆွဲရမယ့် ဂြိုဟ်ကို မှတ်ဖို့
let isZoomed = false;

// Stars
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0; i<15000; i++) starPos.push((Math.random()-0.5)*2000, (Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.5})));

function createPlanet(size, tex, dist, name, hasRings = false) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 64), new THREE.MeshStandardMaterial({ map: loader.load(tex) }));
    const pivot = new THREE.Object3D();
    scene.add(pivot);
    pivot.add(mesh);
    mesh.position.x = dist;
    mesh.userData = { name: name, size: size };

    if(hasRings) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(size * 1.5, size * 2.5, 64), new THREE.MeshBasicMaterial({ map: loader.load(tex), side: THREE.DoubleSide, transparent: true, opacity: 0.5 }));
        ring.rotation.x = Math.PI/2;
        mesh.add(ring);
    }
    planets.push({ mesh, pivot, name });
    return mesh;
}

// Objects
const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), new THREE.MeshBasicMaterial({ map: loader.load('sun.jpg') }));
scene.add(sunMesh);

createPlanet(0.8, 'mercury.jpg', 15, 'MERCURY');
createPlanet(1.2, 'venus.jpg', 22, 'VENUS');
createPlanet(1.3, 'earth.jpg', 30, 'EARTH');
createPlanet(1.0, 'mars.jpg', 38, 'MARS');
createPlanet(3.5, 'Jupiter.jpg', 55, 'JUPITER');
createPlanet(3.0, 'saturn.jpg', 75, 'SATURN', true);
createPlanet(2.0, 'uranus.jpg', 90, 'URANUS');
createPlanet(2.0, 'neptune.jpg', 105, 'NEPTUNE');

camera.position.set(0, 120, 180);
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
        const obj = intersects[0].object.userData.name ? intersects[0].object : intersects[0].object.parent;
        const name = obj.userData.name;
        
        if(name && planetData[name]) {
            targetPlanet = obj;
            isZoomed = true;
            document.getElementById('p-name').innerText = name;
            document.getElementById('p-history').innerText = planetData[name].history;
            document.getElementById('p-distance').innerText = planetData[name].dist;
            document.getElementById('infoModal').style.display = 'flex';
        }
    }
}
window.addEventListener('mousedown', onInteract);
window.addEventListener('touchstart', onInteract);

function animate() {
    requestAnimationFrame(animate);
    
    sunMesh.rotation.y += 0.003;
    planets.forEach((p, i) => {
        p.pivot.rotation.y += 0.008 / (i + 1);
        p.mesh.rotation.y += 0.01;
    });

    if (isZoomed && targetPlanet) {
        // ဂြိုဟ်ရဲ့ ကမ္ဘာလုံးဆိုင်ရာ တည်နေရာကို တွက်ချက်ခြင်း
        const targetPos = new THREE.Vector3();
        targetPlanet.getWorldPosition(targetPos);
        
        // Camera ကို ဂြိုဟ်နားအထိ ဖြည်းဖြည်းချင်း တိုးသွားစေခြင်း (Lerp)
        const zoomOffset = targetPlanet.userData.size * 5;
        camera.position.lerp(new THREE.Vector3(targetPos.x, targetPos.y + zoomOffset, targetPos.z + zoomOffset), 0.05);
        camera.lookAt(targetPos);
    } else {
        // ပုံမှန် မြင်ကွင်း (အဝေးကနေ ငုံ့ကြည့်နေတဲ့ vibe) သို့ ပြန်သွားခြင်း
        camera.position.lerp(new THREE.Vector3(0, 120, 180), 0.02);
        camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
}
animate();

function closeModal() {
    isZoomed = false;
    targetPlanet = null;
    document.getElementById('infoModal').style.display = 'none';
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
        
