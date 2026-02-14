
const credenciales = {
  admin: "admin123",
  usuario: "1234",
  demo: "demo",
};

const STORAGE_KEYS = {
  user: "usuarioGuardado",
  movies: "peliculas",
};

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


document.addEventListener("DOMContentLoaded", () => {
  montarEventos();
  restaurarSesion();
});

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
    cerrarSesion();
  });

  
  $("inputBuscar")?.addEventListener("keyup", aplicarFiltros);
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

  const ok = credenciales[user] && credenciales[user] === pass;

  if (!ok) {
    alert("Usuario o contraseña incorrectos");
    return;
  }

  sesion.usuario = user;
  guardarEnStorage(STORAGE_KEYS.user, user);
  irAlDashboard();
}

function onRegistro(e) {
  e.preventDefault();

  const nombre = $("inputNombre").value.trim();
  const email = $("inputEmail").value.trim();
  const user = $("inputUserReg").value.trim();
  const pass = $("inputPasswordReg").value;
  const pass2 = $("inputConfirmPassword").value;

 
  if (user.length < 4) return alert("El usuario debe tener al menos 4 caracteres");
  if (pass.length < 6) return alert("La contraseña debe tener al menos 6 caracteres");
  if (pass !== pass2) return alert("Las contraseñas no coinciden");
  if (credenciales[user]) return alert("El usuario ya existe");

  credenciales[user] = pass;
  alert("Cuenta creada exitosamente. Por favor, inicia sesión.");
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
}


function irAlDashboard() {
  setVisible("loginSection", "none");
  setVisible("mainContent", "block");
  setVisible("btnAgregar", "inline-block");
  setVisible("btnLogout", "inline-block");
  setVisible("btnLogin", "none");


  const delStorage = leerDeStorage(STORAGE_KEYS.movies, null);
  sesion.lista = Array.isArray(delStorage) ? delStorage : (Array.isArray(peliculas) ? peliculas : []);

  
  guardarEnStorage(STORAGE_KEYS.movies, sesion.lista);

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

    col.innerHTML = `
      <div class="movie-card">
        <img src="${m.imagen}" alt="${m.titulo}" class="movie-image">
        <div class="movie-content">
          <h5 class="movie-title">${m.titulo}</h5>
          <span class="movie-genre">${m.genero}</span>
          <p class="movie-meta"><strong>Director:</strong> ${m.director}</p>
          <p class="movie-meta"><strong>Año:</strong> ${m.ano}</p>
          <p class="movie-rating">⭐ ${m.calificacion}/10</p>
          <p class="movie-description">${m.descripcion}</p>
          <div class="movie-actions">
            <button class="btn-sm btn-info" onclick="verDetalles(${m.id})" data-bs-toggle="modal" data-bs-target="#modalDetalles">
              <i class="bi bi-eye"></i> Ver
            </button>
            <button class="btn-sm btn-warning" onclick="editarPelicula(${m.id})" data-bs-toggle="modal" data-bs-target="#modalPelicula">
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

    card.innerHTML = `
      <img src="${m.imagen}" alt="${m.titulo}" style="cursor:pointer;">
      <div class="slider-movie-info">
        <h6>${m.titulo}</h6>
        <small class="text-muted">${m.ano}</small>
        <div style="color:#ffc107;">⭐ ${m.calificacion}</div>
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
}

function guardarCambiosPelicula() {
  const datos = leerFormularioPelicula();
  if (!datos) return; 

  const { titulo, genero, director, ano, calificacion, descripcion, imagen } = datos;

  if (sesion.editId != null) {
    const m = sesion.lista.find((x) => x.id === sesion.editId);
    if (m) {
      Object.assign(m, { titulo, genero, director, ano, calificacion, descripcion, imagen });
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
  }

  guardarEnStorage(STORAGE_KEYS.movies, sesion.lista);

  pintarGrid(sesion.lista);
  pintarSlider();


  const modalEl = $("modalPelicula");
  const instance = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
  instance?.hide();

  alert(sesion.editId != null ? "Película actualizada" : "Película agregada");
  sesion.editId = null;
  $("formPelicula")?.reset();
}

function eliminarPelicula(id) {
  const ok = confirm("¿Estás seguro de que deseas eliminar esta película?");
  if (!ok) return;

  sesion.lista = (sesion.lista || []).filter((m) => m.id !== id);
  guardarEnStorage(STORAGE_KEYS.movies, sesion.lista);

  pintarGrid(sesion.lista);
  pintarSlider();

  alert("Película eliminada");
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
    alert("Por favor completa todos los campos ");
    return null;
  }

  if (calificacion < 1 || calificacion > 10) {
    alert("La calificación debe estar entre 1 y 10");
    return null;
  }

  return { titulo, genero, director, ano, calificacion, descripcion, imagen };
}

function generarNuevoId(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return 1;
  const maxId = Math.max(...lista.map((m) => Number(m.id) || 0));
  return maxId + 1;
}
