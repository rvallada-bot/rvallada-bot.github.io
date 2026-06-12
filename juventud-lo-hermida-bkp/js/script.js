// ----- DATOS COMPLETOS CATEGORÍAS CON NOMBRES REALES Y SOPORTE DE IMAGEN LOCAL -----
const categoriasData = {
    '3ra-adulto': {
        titulo: '3ra Adulto',
        integrantes: ['Carlos Pérez', 'Luis González', 'Miguel Soto', 'Fernando Rojas', 'Andrés Díaz', 'Ricardo Muñoz', 'Emilio Fuentes'],
        img: 'img/3ra_adulto/equipo.jpg'
    },
    '2da-adulto': {
        titulo: '2da Adulto',
        integrantes: ['Juan López', 'Pedro Martínez', 'Sergio Ramírez', 'Diego Castro', 'Pablo Herrera', 'Cristián Fuentes', 'Álvaro Morales'],
        img: 'img/2da_adulto/equipo.jpg'
    },
    '1ra-adulto': {
        titulo: '1ra Adulto (Primera División)',
        integrantes: ['Marcelo Salas', 'Iván Zamorano', 'Claudio Bravo', 'Arturo Vidal', 'Gary Medel', 'Charles Aránguiz', 'Eduardo Vargas'],
        img: 'img/1ra_adulto/equipo.jpg'
    },
    'infantiles': {
        titulo: 'Infantiles (Sub 12 - Sub 15)',
        integrantes: ['Tomás Álvarez', 'Benjamín Soto', 'Matías Rojas', 'Nicolás Díaz', 'Felipe Mora', 'Joaquín Castillo', 'Lucas Herrera'],
        img: 'img/categorias/infantiles.jpg'
    },
    'superseniors': {
        titulo: 'Superseniors 50+',
        integrantes: ['José Ramírez', 'Hugo Sánchez', 'Luis Jiménez', 'René Ortega', 'Mario Kempes', 'Daniel Passarella', 'Jorge Campos'],
        img: 'img/categorias/superseniors.jpg'
    }
};

// FUNCIÓN PARA MOSTRAR SECCIÓN
function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    // Actualizar clase activa en navegación
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = Array.from(document.querySelectorAll('nav ul li a')).find(a => a.getAttribute('onclick')?.includes(sectionId));
    if (activeLink) activeLink.classList.add('active');
}

// Función mostrar categoría
function showCategoria(categoria) {
    const data = categoriasData[categoria];
    if (data) {
        const container = document.getElementById('contenido-categoria');
        let integrantesHTML = `<div class="integrantes-grid">`;
        data.integrantes.forEach(integrante => {
            integrantesHTML += `<div class="integrante-item"><i class="fas fa-user-circle"></i> ${integrante}</div>`;
        });
        integrantesHTML += `</div>`;

        const imgSrc = data.img;
        const imageHtml = `
            <div class="categoria-imagen-wrapper">
                <img class="categoria-imagen" src="${imgSrc}" alt="Equipo ${data.titulo}" 
                     onerror="this.onerror=null; this.src='https://placehold.co/800x450/001D3D/F5B700?text=Juventud+lo+Hermida';">
            </div>
        `;

        container.innerHTML = `
            <div class="categoria-detalle">
                <h3><i class="fas fa-shield-alt"></i> ${data.titulo}</h3>
                ${imageHtml}
                <h4><i class="fas fa-users"></i> Plantilla Oficial</h4>
                ${integrantesHTML}
                <div style="margin-top: 20px; background:#F5F7FC; padding: 12px; border-radius: 28px; text-align:center; font-size:0.9rem">
                    <i class="fas fa-calendar-alt"></i> Próximo partido: consulta en sección Encuentros
                </div>
            </div>
        `;
        showSection('categorias');
    }
}

// Carga de noticias, encuentros y resultados desde archivos .txt
async function cargarNoticias() {
    const noticiasFiles = ['noticia1', 'noticia2'];
    const container = document.getElementById('noticias-content');
    container.innerHTML = '';
    for (let file of noticiasFiles) {
        try {
            const res = await fetch(`noticias/${file}.txt`);
            if (res.ok) {
                const txt = await res.text();
                container.innerHTML += `<div class="card"><div class="card-content"><h3><i class="fas fa-newspaper"></i> Noticia</h3><p>${txt}</p></div></div>`;
            } else throw new Error();
        } catch (e) {
            container.innerHTML += `<div class="card"><div class="card-content"><h3><i class="fas fa-futbol"></i> Pretemporada 2025</h3><p>Juventud lo Hermida intensifica trabajos con miras al torneo de clausura. ¡Gran convocatoria!</p></div></div>`;
        }
    }
}

async function cargarEncuentros() {
    const encuentrosFiles = ['encuentro1', 'encuentro2','encuentro3'];
    const container = document.getElementById('encuentros-content');
    container.innerHTML = '';
    for (let file of encuentrosFiles) {
        try {
            const res = await fetch(`encuentros/${file}.txt`);
            if (res.ok) {
                const txt = await res.text();
                container.innerHTML += `<div class="card"><div class="card-content"><h3><i class="fas fa-clock"></i> Próximo partido</h3><p>${txt}</p></div></div>`;
            } else throw new Error();
        } catch (e) {
            container.innerHTML += `<div class="card"><div class="card-content"><h3><i class="fas fa-calendar-week"></i> 1ra Adulto vs Universidad</h3><p>Sábado 21 de junio - 16:00 hrs - Estadio Lo Hermida</p></div></div>`;
        }
    }
}

async function cargarResultados() {
    const resFiles = ['resultado1', 'resultado2'];
    const container = document.getElementById('resultados-content');
    container.innerHTML = '';
    for (let file of resFiles) {
        try {
            const res = await fetch(`resultados/${file}.txt`);
            if (res.ok) {
                const txt = await res.text();
                container.innerHTML += `<div class="card"><div class="card-content"><h3><i class="fas fa-chart-line"></i> Resultado oficial</h3><p>${txt}</p></div></div>`;
            } else throw new Error();
        } catch (e) {
            container.innerHTML += `<div class="card"><div class="card-content"><h3><i class="fas fa-trophy"></i> Fecha anterior</h3><p>3ra Adulto 3-1 | 2da Adulto 2-2 | Superseniors 1-0 victoria agónica</p></div></div>`;
        }
    }
}

// GESTIÓN DE PREGUNTAS (localStorage)
function cargarPreguntasGuardadas() {
    const preguntas = JSON.parse(localStorage.getItem('preguntasJuventud')) || [];
    const lista = document.getElementById('lista-preguntas');
    lista.innerHTML = '';
    if (preguntas.length === 0) {
        lista.innerHTML = '<li style="color:#777;">No hay preguntas aún. ¡Sé el primero en consultar!</li>';
        return;
    }
    preguntas.slice(0, 12).forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<strong><i class="fas fa-user"></i> ${escapeHtml(p.nombre)}:</strong> ${escapeHtml(p.pregunta)} <br><small style="color:#F5B700;">📅 ${p.fecha}</small>`;
        lista.appendChild(li);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// LOGO DINÁMICO
function initLogo() {
    const logoImg = document.getElementById('dynamicLogo');
    const fallbackDiv = document.getElementById('fallback-icon');
    logoImg.onerror = function () {
        logoImg.src = 'img/logo.svg';
        logoImg.onerror = function () {
            logoImg.style.display = 'none';
            if (fallbackDiv) fallbackDiv.style.display = 'flex';
        };
    };
    logoImg.onload = function () {
        if (fallbackDiv) fallbackDiv.style.display = 'none';
        logoImg.style.display = 'block';
    };
    if (logoImg.complete && logoImg.naturalHeight === 0) {
        logoImg.onerror();
    }
}

// Inicialización
window.onload = () => {
    showSection('inicio');
    cargarNoticias();
    cargarEncuentros();
    cargarResultados();
    cargarPreguntasGuardadas();
    initLogo();

    // Agregar clase active al inicio en navbar
    document.querySelectorAll('nav ul li a').forEach(a => a.classList.remove('active'));
    const inicioLink = Array.from(document.querySelectorAll('nav ul li a')).find(a => a.getAttribute('onclick')?.includes('inicio'));
    if (inicioLink) inicioLink.classList.add('active');
};

// Formulario de preguntas
document.getElementById('pregunta-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const pregunta = document.getElementById('pregunta').value.trim();
    if (!nombre || !email || !pregunta) return alert('Completa todos los campos');
    const nueva = {
        nombre: nombre,
        email: email,
        pregunta: pregunta,
        fecha: new Date().toLocaleString('es-CL')
    };
    const preguntas = JSON.parse(localStorage.getItem('preguntasJuventud')) || [];
    preguntas.unshift(nueva);
    localStorage.setItem('preguntasJuventud', JSON.stringify(preguntas.slice(0, 15)));
    cargarPreguntasGuardadas();
    document.getElementById('pregunta-form').reset();
    alert('✅ Pregunta enviada con éxito. ¡Gracias por comunicarte!');
});