const credenciales = {
  admin: "admin123",
  usuario: "1234",
  demo: "demo",
};

const STORAGE_KEYS = {
  user: "usuarioGuardado",
  movies: "peliculas",
  users: "usuarios",
};

const peliculasInicio = [
  {
    id: 1,
    titulo: "Inception",
    genero: "Ciencia Ficción",
    director: "Christopher Nolan",
    ano: 2010,
    calificacion: 8.8,
    descripcion: "Un ladrón que roba secretos corporativos a través de la tecnología de sueños compartidos.",
    imagen: "https://via.placeholder.com/300x450/667eea/ffffff?text=Inception",
    reciente: true,
  },
  {
    id: 2,
    titulo: "The Dark Knight",
    genero: "Acción",
    director: "Christopher Nolan",
    ano: 2008,
    calificacion: 9.0,
    descripcion: "Batman enfrenta al Joker, un criminal que desea sumergir Gotham en el caos.",
    imagen: "https://via.placeholder.com/300x450/764ba2/ffffff?text=Dark+Knight",
    reciente: true,
  },
  {
    id: 3,
    titulo: "Forrest Gump",
    genero: "Drama",
    director: "Robert Zemeckis",
    ano: 1994,
    calificacion: 8.8,
    descripcion: "La vida de un hombre con discapacidad intelectual que presencia eventos históricos.",
    imagen: "https://via.placeholder.com/300x450/667eea/ffffff?text=Forrest+Gump",
    reciente: false,
  },
  {
    id: 4,
    titulo: "Interestelar",
    genero: "Ciencia Ficción",
    director: "Christopher Nolan",
    ano: 2014,
    calificacion: 8.6,
    descripcion: "Un equipo de astronautas viaja a través de un agujero de gusano en busca de un nuevo hogar.",
    imagen: "https://via.placeholder.com/300x450/764ba2/ffffff?text=Interestelar",
    reciente: true,
  },
  {
    id: 5,
    titulo: "Toy Story",
    genero: "Aventura",
    director: "John Lasseter",
    ano: 1995,
    calificacion: 8.3,
    descripcion: "Las aventuras de Woody y Buzz en el mundo de los juguetes.",
    imagen: "https://via.placeholder.com/300x450/667eea/ffffff?text=Toy+Story",
    reciente: false,
  },
  {
    id: 6,
    titulo: "It",
    genero: "Terror",
    director: "Andrés Muschietti",
    ano: 2017,
    calificacion: 7.3,
    descripcion: "Un grupo de amigos lucha contra una entidad maligna que aparece cada 27 años.",
    imagen: "https://via.placeholder.com/300x450/764ba2/ffffff?text=It",
    reciente: false,
  },
];

let sesion = {
  usuario: null,
  editId: null,
  lista: [],
};


const $ = (id) => document.getElementById(id);

function setVisible(id, display) {
  const el = $(id);
  if (el) el.style.display = display;
}

function guardarEnStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function leerDeStorage(key, fallback = null) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Sistema de notificaciones elegante
function mostrarNotificacion(mensaje, tipo = "info") {
  const colores = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };

  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colores[tipo]};
    color: ${tipo === "warning" ? "#333" : "white"};
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-weight: 500;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;

  notification.textContent = mensaje;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Agregar estilos de animación si no existen
if (!document.querySelector("style[data-notifications]")) {
  const style = document.createElement("style");
  style.setAttribute("data-notifications", "true");
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}


document.addEventListener("DOMContentLoaded", () => {
  initCredenciales();
  montarEventos();
  restaurarSesion();
});

// Inicializar credenciales desde storage (si existen) o persistir las por defecto
function initCredenciales() {
  const stored = leerDeStorage(STORAGE_KEYS.users, null);
  if (stored && typeof stored === "object") {
    Object.assign(credenciales, stored);
  } else {
    guardarEnStorage(STORAGE_KEYS.users, credenciales);
  }
}

function restaurarSesion() {
  const user = leerDeStorage(STORAGE_KEYS.user, null);
  if (user) {
    sesion.usuario = user;
    irAlDashboard();
  } else {
  
    setVisible("loginSection", "flex");
    setVisible("mainContent", "none");
    setVisible("btnAgregar", "none");
    setVisible("btnLogout", "none");
    setVisible("btnLogin", "inline-block");
    setTimeout(() => $("inputUser")?.focus(), 100);
  }
}


function montarEventos() {
 
  $("formLogin")?.addEventListener("submit", onLogin);
  $("formRegistro")?.addEventListener("submit", onRegistro);

  $("linkLogin")?.addEventListener("click", (e) => {
    e.preventDefault();
    $("login-tab")?.click();
  });

  
  $("btnLogout")?.addEventListener("click", cerrarSesion);
  $("btnLogin")?.addEventListener("click", (e) => {
    e.preventDefault();
    // Mostrar la sección de login (no forzar un 'logout' si ya está desconectado)
    setVisible("loginSection", "flex");
    setVisible("mainContent", "none");
    setVisible("btnAgregar", "none");
    setVisible("btnLogout", "none");
    setVisible("btnLogin", "inline-block");
    $("formLogin")?.reset();
  });

  
  // `inputBuscar` será enlazado con debounce más abajo; solo enlazamos el select aquí
  $("selectGenero")?.addEventListener("change", aplicarFiltros);

  
  $("btnGuardarPelicula")?.addEventListener("click", guardarCambiosPelicula);

  
  const modal = $("modalPelicula");
  modal?.addEventListener("show.bs.modal", (e) => {
    const target = e.relatedTarget;
    const abrePorAgregar = !target || target.id === "btnAgregar";

    if (abrePorAgregar) {
      sesion.editId = null;
      $("modalTitulo").textContent = "Agregar Película";
      $("formPelicula")?.reset();
    }
  });
}


function onLogin(e) {
  e.preventDefault();

  const user = $("inputUser").value.trim();
  const pass = $("inputPassword").value;

  if (!user || !pass) {
    mostrarNotificacion("Por favor completa todos los campos", "warning");
    return;
  }

  const ok = credenciales[user] && credenciales[user] === pass;

  if (!ok) {
    mostrarNotificacion("Usuario o contraseña incorrectos", "error");
    return;
  }

  sesion.usuario = user;
  guardarEnStorage(STORAGE_KEYS.user, user);
  mostrarNotificacion(`¡Bienvenido ${user}!`, "success");
  irAlDashboard();
}

function onRegistro(e) {
  e.preventDefault();

  const nombre = $("inputNombre").value.trim();
  const email = $("inputEmail").value.trim();
  const user = $("inputUserReg").value.trim();
  const pass = $("inputPasswordReg").value;
  const pass2 = $("inputConfirmPassword").value;

  // Validaciones
  if (!nombre || !email || !user || !pass || !pass2) {
    mostrarNotificacion("Por favor completa todos los campos", "warning");
    return;
  }

  if (user.length < 4) {
    mostrarNotificacion("El usuario debe tener al menos 4 caracteres", "warning");
    return;
  }

  if (pass.length < 6) {
    mostrarNotificacion("La contraseña debe tener al menos 6 caracteres", "warning");
    return;
  }

  if (pass !== pass2) {
    mostrarNotificacion("Las contraseñas no coinciden", "warning");
    return;
  }

  if (credenciales[user]) {
    mostrarNotificacion("El usuario ya existe", "warning");
    return;
  }

  // Validar email básicamente
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarNotificacion("Email inválido", "warning");
    return;
  }

  credenciales[user] = pass;
  // Persistir usuarios
  guardarEnStorage(STORAGE_KEYS.users, credenciales);
  mostrarNotificacion("Cuenta creada exitosamente. Por favor, inicia sesión.", "success");
  $("formRegistro")?.reset();
  $("login-tab")?.click();
}

function cerrarSesion() {
  sesion.usuario = null;
  sesion.editId = null;

  localStorage.removeItem(STORAGE_KEYS.user);

  setVisible("loginSection", "flex");
  setVisible("mainContent", "none");
  setVisible("btnAgregar", "none");
  setVisible("btnLogout", "none");
  setVisible("btnLogin", "inline-block");

  $("formLogin")?.reset();
  setTimeout(() => $("inputUser")?.focus(), 100);
}


function irAlDashboard() {
  setVisible("loginSection", "none");
  setVisible("mainContent", "block");
  setVisible("btnAgregar", "inline-block");
  setVisible("btnLogout", "inline-block");
  setVisible("btnLogin", "none");

  const delStorage = leerDeStorage(STORAGE_KEYS.movies, null);
  
  if (delStorage && Array.isArray(delStorage)) {
    sesion.lista = delStorage;
  } else {
    sesion.lista = JSON.parse(JSON.stringify(peliculasInicio));
    guardarEnStorage(STORAGE_KEYS.movies, sesion.lista);
  }

  pintarGrid(sesion.lista);
  pintarSlider();
}


function pintarGrid(lista) {
  const grid = $("gridPeliculas");
  const empty = $("sinResultados");

  if (!grid) return;
  grid.innerHTML = "";

  if (!lista || lista.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  lista.forEach((m) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 col-xl-3";

    const safeTitulo = escapeHtml(m.titulo);
    const safeGenero = escapeHtml(m.genero);
    const safeDirector = escapeHtml(m.director);
    const safeAno = escapeHtml(m.ano);
    const safeCalificacion = escapeHtml(m.calificacion);
    const safeDescripcion = escapeHtml(m.descripcion);
    const safeImagen = escapeHtml(m.imagen);

    col.innerHTML = `
      <div class="movie-card">
        <img src="${safeImagen}" alt="${safeTitulo}" class="movie-image">
        <div class="movie-content">
          <h5 class="movie-title">${safeTitulo}</h5>
          <span class="movie-genre">${safeGenero}</span>
          <p class="movie-meta"><strong>Director:</strong> ${safeDirector}</p>
          <p class="movie-meta"><strong>Año:</strong> ${safeAno}</p>
          <p class="movie-rating">⭐ ${safeCalificacion}/10</p>
          <p class="movie-description">${safeDescripcion}</p>
          <div class="movie-actions">
            <button class="btn-sm btn-info" onclick="verDetalles(${m.id})">
              <i class="bi bi-eye"></i> Ver
            </button>
            <button class="btn-sm btn-warning" onclick="editarPelicula(${m.id})">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn-sm btn-danger" onclick="eliminarPelicula(${m.id})">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(col);
  });
}


function pintarSlider() {
  const cont = $("carouselMovies");
  if (!cont) return;

  cont.innerHTML = "";
  const recientes = (sesion.lista || []).filter((m) => m.reciente);

  recientes.forEach((m) => {
    const card = document.createElement("div");
    card.className = "slider-movie-card";
    card.onclick = () => verDetalles(m.id);

    const sTitulo = escapeHtml(m.titulo);
    const sAno = escapeHtml(m.ano);
    const sCal = escapeHtml(m.calificacion);
    const sImg = escapeHtml(m.imagen);

    card.innerHTML = `
      <img src="${sImg}" alt="${sTitulo}" style="cursor:pointer;">
      <div class="slider-movie-info">
        <h6>${sTitulo}</h6>
        <small class="text-muted">${sAno}</small>
        <div style="color:#ffc107;">⭐ ${sCal}</div>
      </div>
    `;

    cont.appendChild(card);
  });
}


function scrollSlider(direction) {
  const carousel = $("carouselMovies");
  if (!carousel) return;

  const step = 200;
  carousel.scrollLeft += direction === 1 ? step : -step;
}


function aplicarFiltros() {
  const q = ($("inputBuscar")?.value || "").toLowerCase();
  const gen = $("selectGenero")?.value || "";

  const filtradas = (sesion.lista || []).filter((m) => {
    const texto = `${m.titulo} ${m.director} ${m.descripcion}`.toLowerCase();
    const matchTexto = texto.includes(q);
    const matchGenero = gen === "" || m.genero === gen;
    return matchTexto && matchGenero;
  });

  pintarGrid(filtradas);
}


function verDetalles(id) {
  const m = (sesion.lista || []).find((x) => x.id === id);
  if (!m) return;

  $("detallesTitulo").textContent = m.titulo;
  $("detallesImagen").src = m.imagen;
  $("detallesGenero").textContent = m.genero;
  $("detallesDirector").textContent = m.director;
  $("detallesAno").textContent = m.ano;
  $("detallesCalificacion").textContent = m.calificacion;
  $("detallesDescripcion").textContent = m.descripcion;
  showModalById("modalDetalles");
}

function editarPelicula(id) {
  const m = (sesion.lista || []).find((x) => x.id === id);
  if (!m) return;

  sesion.editId = id;

  $("modalTitulo").textContent = "Editar Película";
  $("inputTitulo").value = m.titulo;
  $("inputGenero").value = m.genero;
  $("inputDirector").value = m.director;
  $("inputAno").value = m.ano;
  $("inputCalificacion").value = m.calificacion;
  $("inputDescripcion").value = m.descripcion;
  $("inputImagen").value = m.imagen;
  showModalById("modalPelicula");
}

function guardarCambiosPelicula() {
  const datos = leerFormularioPelicula();
  if (!datos) return;

  const { titulo, genero, director, ano, calificacion, descripcion, imagen } = datos;

  if (sesion.editId != null) {
    const m = sesion.lista.find((x) => x.id === sesion.editId);
    if (m) {
      Object.assign(m, { titulo, genero, director, ano, calificacion, descripcion, imagen });
      mostrarNotificacion("Película actualizada con éxito", "success");
    }
  } else {
    const nuevoId = generarNuevoId(sesion.lista);
    sesion.lista.push({
      id: nuevoId,
      titulo,
      genero,
      director,
      ano,
      calificacion,
      descripcion,
      imagen,
      reciente: true,
    });
    mostrarNotificacion("Película agregada con éxito", "success");
  }

  guardarEnStorage(STORAGE_KEYS.movies, sesion.lista);

  pintarGrid(sesion.lista);
  pintarSlider();

  hideModalById("modalPelicula");

  sesion.editId = null;
  $("formPelicula")?.reset();
}

function eliminarPelicula(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar esta película?")) {
    return;
  }

  sesion.lista = (sesion.lista || []).filter((m) => m.id !== id);
  guardarEnStorage(STORAGE_KEYS.movies, sesion.lista);

  pintarGrid(sesion.lista);
  pintarSlider();

  mostrarNotificacion("Película eliminada con éxito", "success");
}

function leerFormularioPelicula() {
  const titulo = $("inputTitulo").value.trim();
  const genero = $("inputGenero").value.trim();
  const director = $("inputDirector").value.trim();
  const ano = Number.parseInt($("inputAno").value, 10);
  const calificacion = Number.parseFloat($("inputCalificacion").value);
  const descripcion = $("inputDescripcion").value.trim();
  const imagen = $("inputImagen").value.trim();

  if (!titulo || !genero || !director || !ano || !calificacion || !descripcion || !imagen) {
    mostrarNotificacion("Por favor completa todos los campos", "warning");
    return null;
  }

  if (calificacion < 1 || calificacion > 10) {
    mostrarNotificacion("La calificación debe estar entre 1 y 10", "warning");
    return null;
  }

  if (ano < 1900 || ano > new Date().getFullYear()) {
    mostrarNotificacion(`El año debe estar entre 1900 y ${new Date().getFullYear()}`, "warning");
    return null;
  }

  // Validar URL de imagen
  if (!esUrlValida(imagen)) {
    mostrarNotificacion("URL de imagen inválida", "warning");
    return null;
  }

  return { titulo, genero, director, ano, calificacion, descripcion, imagen };
}

// Helper para validar URLs
function esUrlValida(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function generarNuevoId(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return 1;
  const maxId = Math.max(...lista.map((m) => Number(m.id) || 0));
  return maxId + 1;

}

// Small utilities and protections
function debounce(fn, wait = 200) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Re-bind buscador with debounce (avoid duplicate handlers)
function bindBuscador() {
  const buscador = $("inputBuscar");
  if (!buscador) return;
  // remove any inline handler
  buscador.onkeyup = null;
  buscador.addEventListener("keyup", debounce(aplicarFiltros, 250));
}

// Bind buscador now and also when dashboard is shown
bindBuscador();

// Safe modal hide helper to avoid runtime errors when bootstrap is not available
function hideModalById(id) {
  const modalEl = $(id);
  if (!modalEl) return;
  if (typeof bootstrap !== "undefined" && bootstrap.Modal && typeof bootstrap.Modal.getInstance === "function") {
    const instance = bootstrap.Modal.getInstance(modalEl);
    instance?.hide();
  } else {
    // Fallback: just remove 'show' classes and backdrop if present
    modalEl.classList.remove("show");
    modalEl.style.display = "none";
    const backdrop = document.querySelector('.modal-backdrop');
    backdrop?.remove();
  }
}

// Safe modal show helper
function showModalById(id) {
  const modalEl = $(id);
  if (!modalEl) return;
  if (typeof bootstrap !== "undefined" && bootstrap.Modal && typeof bootstrap.Modal.getOrCreateInstance === "function") {
    const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
    instance.show();
  } else {
    modalEl.classList.add("show");
    modalEl.style.display = "block";
    // add a simple backdrop
    if (!document.querySelector('.modal-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }
}

// Escapar HTML para evitar inyección cuando se usa innerHTML
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}