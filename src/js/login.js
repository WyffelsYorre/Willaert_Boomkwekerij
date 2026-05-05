document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const formContent = document.getElementById('formContent');
    const successState = document.getElementById('successState');
    const btnStep2 = document.getElementById('btn-step-2');
    const btnStep3 = document.getElementById('btn-step-3');
    const submitBtn = document.getElementById('submitBtn');
    const lottieContainer = document.getElementById('lottieContainer');

    // Kleur #4E9D3A Plant-Check Animatie Data
    const plantCheckAnimation = {"v":"5.5.2","fr":30,"ip":0,"op":60,"w":200,"h":200,"nm":"PlantSuccess","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Check","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[100,100,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":15,"s":[0,0,100]},{"t":25,"s":[100,100,100]}],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-25,0],[-8,18],[25,-22]],"c":false},"ix":2},"nm":"Path 1","hd":false},{"ty":"st","c":{"a":0,"k":[1,1,1,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":8,"ix":5},"lc":2,"lj":2,"ml":4,"bm":0,"nm":"Stroke 1","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"r":{"a":0,"k":0,"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"a":{"a":0,"k":[0,0],"ix":1},"o":{"a":0,"k":100,"ix":4},"nm":"Transform"}],"nm":"Shape 1","bm":0,"ix":1,"hd":false}],"ip":15,"op":60,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"Circle","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[100,100,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":0,"s":[0,0,100]},{"t":20,"s":[100,100,100]}],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[120,120],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","hd":false},{"ty":"fl","c":{"a":0,"k":[0.306,0.616,0.227,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"r":{"a":0,"k":0,"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"a":{"a":0,"k":[0,0],"ix":1},"o":{"a":0,"k":100,"ix":4},"nm":"Transform"}],"nm":"Group 1","bm":0,"ix":1,"hd":false}],"ip":0,"op":60,"st":0,"bm":0}]};

    function checkSection(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return true;
        return [...container.querySelectorAll('[required]')].every(i => i.checkValidity());
    }

    function updateUI() {
        const s1 = checkSection('step1');
        const s3 = checkSection('step3');

        // Ontgrendel stap 2 en 3
        btnStep2.disabled = !s1;
        btnStep2.style.opacity = s1 ? "1" : "0.5";
        btnStep3.disabled = !s1;
        btnStep3.style.opacity = s1 ? "1" : "0.5";

        // Activeer verzendknop
        submitBtn.disabled = !(s1 && s3);
        submitBtn.style.opacity = (s1 && s3) ? "1" : "0.5";
    }

    // Gesloten vinkjes logica
    document.querySelectorAll('.c-form__hours-row').forEach(row => {
        const checkbox = row.querySelector('.form-check-input');
        const times = row.querySelectorAll('input[type="time"]');
        checkbox.addEventListener('change', () => {
            times.forEach(t => { 
                t.disabled = checkbox.checked; 
                if(checkbox.checked) t.value = "";
            });
        });
    });

    loginForm.addEventListener('input', (e) => {
        if(e.target.hasAttribute('required')) {
            e.target.classList.toggle('is-invalid', !e.target.checkValidity());
        }
        updateUI();
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Verberg form content en toon succes
        formContent.style.display = 'none';
        successState.style.display = 'block';

        // Start animatie
        lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: plantCheckAnimation
        });

        window.scrollTo({ top: successState.offsetTop - 100, behavior: 'smooth' });
    });
});