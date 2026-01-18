const planetData = {
    'THE SUN': 'နေအဖွဲ့အစည်း၏ ဗဟိုချက်ဖြစ်သည်။',
    'MERCURY': 'နေနှင့် အနီးဆုံးဂြိုဟ်ဖြစ်သည်။',
    'VENUS': 'အပူဆုံးဂြိုဟ်ဖြစ်သည်။',
    'EARTH': 'သက်ရှိများရှင်သန်ရာ အပြာရောင်ဂြိုဟ်ဖြစ်သည်။',
    'MARS': 'ဂြိုဟ်နီကြီးဟု လူသိများသည်။',
    'JUPITER': 'အကြီးဆုံးသော ဓာတ်ငွေ့ဂြိုဟ်ကြီးဖြစ်သည်။',
    'SATURN': 'လှပသော ရေခဲကွင်းများရှိသည်။'
    'URANUS': 'ယူရေးနပ်စ်သည် အေးခဲနေသော ဓာတ်ငွေ့ဂြိုဟ်ကြီးဖြစ်ပြီး အလွန်အေးမြသည်။',
'NEPTUNE': 'နက်ပကျွန်းသည် နေအဖွဲ့အစည်း၏ အပြင်ဘက်ဆုံးနှင့် အဝေးဆုံးဂြိုဟ်ဖြစ်သည်။'
};

function showInfo(name) {
    document.getElementById('p-name').innerText = name;
    document.getElementById('p-desc').innerText = planetData[name];
    document.getElementById('infoModal').style.display = 'block';
}

function closePopup() {
    document.getElementById('infoModal').style.display = 'none';
}

function updateSpeed(val) {
    document.getElementById('speedVal').innerText = val;
    document.querySelectorAll('.orbit').forEach(orbit => {
        const base = orbit.dataset.speed;
        orbit.style.animationDuration = (base / val) + 's';
    });
}

function togglePlay() {
    const orbits = document.querySelectorAll('.orbit');
    const paused = orbits[0].style.animationPlayState === 'paused';
    orbits.forEach(o => o.style.animationPlayState = paused ? 'running' : 'paused');
    document.getElementById('playPauseBtn').innerText = paused ? 'PAUSE' : 'PLAY';
}

function resetSpeed() {
    document.getElementById('speedSlider').value = 1;
    updateSpeed(1);
}

/* COMET */
function createComet() {
    const comet = document.querySelector('.comet');
    setTimeout(() => {
        comet.style.left = Math.random() * 80 + 'vw';
        comet.style.top = '-150px';
        comet.style.opacity = 1;
        comet.style.animation = 'flyComet 1.5s linear forwards';

        setTimeout(() => {
            comet.style.animation = 'none';
            comet.style.opacity = 0;
            createComet();
        }, 1500);
    }, 7000);
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes flyComet {
    from { transform: translate(-100px,-100px) rotate(135deg); }
    to { transform: translate(120vw,120vh) rotate(135deg); }
}`;
document.head.appendChild(style);

createComet();
/* =====================
   ZOOM & PINCH CONTROL
===================== */

let scale = 1;
let startDist = 0;

/* Mouse wheel zoom (Desktop) */
document.addEventListener('wheel', e => {
    e.preventDefault();
    scale += e.deltaY * -0.001;
    scale = Math.min(Math.max(0.6, scale), 2.5);
    document.querySelector('.solar-system').style.transform = `scale(${scale})`;
}, { passive: false });

/* Pinch zoom (Mobile) */
document.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
        startDist = getDistance(e.touches[0], e.touches[1]);
    }
});

document.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
        const newDist = getDistance(e.touches[0], e.touches[1]);
        scale += (newDist - startDist) * 0.003;
        scale = Math.min(Math.max(0.6, scale), 2.5);
        document.querySelector('.solar-system').style.transform = `scale(${scale})`;
        startDist = newDist;
    }
});

function getDistance(t1, t2) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}
/* =====================
   DYNAMIC SUN LIGHT
===================== */

function updateLight() {
    const sun = document.querySelector('.sun-container').getBoundingClientRect();

    document.querySelectorAll('.planet').forEach(p => {
        const rect = p.getBoundingClientRect();
        const angle = Math.atan2(
            rect.top - sun.top,
            rect.left - sun.left
        ) * 180 / Math.PI;

        p.style.setProperty('--light-angle', `${angle}deg`);
    });

    requestAnimationFrame(updateLight);
}
updateLight();
