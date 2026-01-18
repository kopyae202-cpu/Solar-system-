const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ဂြိုဟ်အချက်အလက်များ
const planetData = {
    'MERCURY': { history: 'နေနှင့်အနီးဆုံးဂြိုဟ်ဖြစ်ပြီး အလွန်ပူပြင်းသည်။', dist: 'ကမ္ဘာမှ ၉၁.၇ သန်း ကီလိုမီတာ' },
    'VENUS': { history: 'အရောင်အဝါအလွန်တောက်ပသဖြင့် သောကြာဂြိုဟ်ဟုခေါ်သည်။', dist: 'ကမ္ဘာမှ ၄၁ သန်း ကီလိုမီတာ' },
    'EARTH': { history: 'ကျွန်ုပ်တို့ နေထိုင်ရာ သက်ရှိများရှိသည့် တစ်ခုတည်းသော ဂြိုဟ်ဖြစ်သည်။', dist: 'မိခင်ကမ္ဘာမြေ' },
    'MARS': { history: 'အနီရောင်ဂြိုဟ်ဟု လူသိများသည်။', dist: 'ကမ္ဘာမှ ၇၈.၃ သန်း ကီလိုမီတာ' },
    'JUPITER': { history: 'နေအဖွဲ့အစည်းတွင် အကြီးဆုံးဂြိုဟ်ဖြစ်ပြီး ဧရာမဓာတ်ငွေ့လုံးကြီးဖြစ်သည်။', dist: 'ကမ္ဘာမှ ၆၂၈.၇ သန်း ကီလိုမီတာ' },
    'SATURN': { history: 'လှပသော ကွင်းများရှိသည့် ဂြိုဟ်ဖြစ်သည်။', dist: 'ကမ္ဘာမှ ၁.၂ ဘီလီယံ ကီလိုမီတာ' },
    'URANUS': { history: 'ဘေးတိုက်လည်ပတ်နေသော အေးခဲဓာတ်ငွေ့ဂြိုဟ်ဖြစ်သည်။', dist: 'ကမ္ဘာမှ ၂.၆ ဘီလီယံ ကီလိုမီတာ' },
    'NEPTUNE': { history: 'နေနှင့် အဝေးဆုံးမှာရှိသည့် အပြာရောင်ဂြိုဟ်ဖြစ်သည်။', dist: 'ကမ္ဘာမှ ၄.၃ ဘီလီယံ ကီလိုမီတာ' }
};

// Stars Background
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0; i<10000; i++) starPos.push((Math.random()-0.5)*2000, (Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.7})));

const loader = new THREE.TextureLoader();
const planets = [];

function makePlanet(size, tex, dist, name) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 32), new THREE.MeshBasicMaterial({map: loader.load(tex)}));
    const pivot = new THREE.Object3D();
    scene.add(pivot);
    pivot.add(mesh);
    mesh.position.x = dist;
    mesh.userData = { name: name };
    planets.push({ mesh, pivot, dist });
    return mesh;
}

// နေ
const sun = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32), new THREE.MeshBasicMaterial({map: loader.load('sun.jpg')}));
scene.add(sun);

// ဂြိုဟ်များ (Jupiter.jpg နာမည်ကို သတိထားပါ)
makePlanet(0.6, 'mercury.jpg', 10, 'MERCURY');
makePlanet(0.9, 'venus.jpg', 15, 'VENUS');
makePlanet(1, 'earth.jpg', 20, 'EARTH');
makePlanet(0.8, 'mars.jpg', 25, 'MARS');
makePlanet(2.5, 'Jupiter.jpg', 35, 'JUPITER'); // ဘရိုတင်ထားတဲ့ J အကြီးနဲ့ ပြင်ပေးထားတယ်
makePlanet(2.2, 'saturn.jpg', 48, 'SATURN');
makePlanet(1.6, 'uranus.jpg', 58, 'URANUS');
makePlanet(1.6, 'neptune.jpg', 68, 'NEPTUNE');

camera.position.z = 75; camera.position.y = 35; camera.lookAt(0,0,0);

// Interaction (နှိပ်ရင် စာပေါ်ဖို့)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function handleClick(e) {
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if(intersects.length > 0) {
        const obj = intersects[0].object;
        const name = obj.userData.name;
        if(name) {
            document.getElementById('p-name').innerText = name;
            document.getElementById('p-history').innerText = planetData[name].history;
            document.getElementById('p-distance').innerText = "Distance: " + planetData[name].dist;
            document.getElementById('infoModal').style.display = 'flex';
        }
    }
}
window.addEventListener('mousedown', handleClick);
window.addEventListener('touchstart', handleClick);

let speed = 1;
function animate() {
    requestAnimationFrame(animate);
    planets.forEach((p, i) => {
        p.pivot.rotation.y += (0.01 / (i + 1)) * speed;
        p.mesh.rotation.y += 0.02;
    });
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function togglePlay() { speed = speed === 0 ? 1 : 0; }
document.getElementById('speedRange').oninput = (e) => { speed = e.target.value; };
