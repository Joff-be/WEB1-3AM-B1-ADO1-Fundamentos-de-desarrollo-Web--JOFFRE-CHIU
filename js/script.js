
"use strict";


const STORAGE_KEY = "autocare_solicitudes";

const usuarios = [
    {
        id: 1,
        nombre: "Carlos Pérez",
        correo: "cliente@autocare.com",
        clave: "Cliente123",
        telefono: "0991234567",
        rol: "Cliente",
        activo: true
    },
    {
        id: 2,
        nombre: "María López",
        correo: "maria@autocare.com",
        clave: "Maria123",
        telefono: "0987654321",
        rol: "Cliente",
        activo: true
    },
    {
        id: 3,
        nombre: "Administrador",
        correo: "admin@autocare.com",
        clave: "Admin123",
        telefono: "0991112233",
        rol: "Administrador",
        activo: true
    }
];

const estados = [
    "Pendiente",
    "En revisión",
    "En proceso",
    "Finalizado",
    "Cancelado"
];

let usuarioActual = null;
let solicitudes = cargarSolicitudes();

function cargarSolicitudes() {
    try {
        const datos = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(datos) ? datos : [];

    } catch (error) {
        console.error(error);
        return [];
    }
}

function guardarSolicitudes() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(solicitudes)
    );
}


function alerta(icono, titulo, mensaje = "") {

    return Swal.fire({
        icon: icono,
        title: titulo,
        text: mensaje,
        confirmButtonColor: "#1769aa"
    });
}



function mostrarVentana(nombre) {

    const protegidas = [
        "perfil",
        "solicitud",
        "misSolicitudes",
        "admin"
    ];

    if (protegidas.includes(nombre) && !usuarioActual) {

        alerta(
            "warning",
            "Inicia sesión",
            "Debes iniciar sesión para acceder."
        );

        nombre = "login";
    }

    if (
        nombre === "admin" &&
        usuarioActual?.rol !== "Administrador"
    ) {

        alerta(
            "error",
            "Acceso denegado",
            "No tienes permisos de administrador."
        );

        nombre = "inicio";
    }

    document.querySelectorAll(".ventana").forEach(ventana => {
        ventana.classList.remove("activa");
    });

    const destino = document.getElementById(nombre);

    if (destino) {
        destino.classList.add("activa");
    }

    const menu = document.getElementById("menu");

    if (menu.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }

    if (nombre === "perfil") {
        mostrarPerfil();
    }

    if (nombre === "misSolicitudes") {
        mostrarMisSolicitudes();
    }

    if (nombre === "admin") {
        mostrarAdministracion();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}



function actualizarMenu() {

    const conectado = Boolean(usuarioActual);

    document.getElementById("btnLogin").hidden = conectado;

    document.getElementById("menuCerrar").hidden = !conectado;

    document.getElementById("menuPerfil").hidden = !conectado;

    document.getElementById("menuSolicitudes").hidden = !conectado;

    document.getElementById("menuAdmin").hidden =
        !conectado ||
        usuarioActual.rol !== "Administrador";
}



function iniciarSesion(correo, clave) {

    const usuario = usuarios.find(item =>
        item.correo.toLowerCase() === correo.toLowerCase().trim() &&
        item.clave === clave &&
        item.activo === true
    );

    if (!usuario) {

        alerta(
            "error",
            "Acceso incorrecto",
            "Verifica tus credenciales o el estado de tu cuenta."
        );

        return;
    }

    usuarioActual = usuario;

    actualizarMenu();

    Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Hola ${usuario.nombre}`,
        confirmButtonColor: "#1769aa"
    }).then(() => {

        if (usuario.rol === "Administrador") {
            mostrarVentana("admin");
        } else {
            mostrarVentana("perfil");
        }

    });
}

/* ==========================================
   CERRAR SESIÓN
========================================== */

function cerrarSesion() {

    usuarioActual = null;

    actualizarMenu();

    alerta(
        "success",
        "Sesión cerrada",
        "Has cerrado sesión correctamente."
    );

    mostrarVentana("inicio");
}

/* ==========================================
   PERFIL
========================================== */

function mostrarPerfil() {

    if (!usuarioActual) return;

    document.getElementById("avatarPerfil").textContent =
        usuarioActual.nombre.charAt(0).toUpperCase();

    document.getElementById("nombrePerfil").textContent =
        usuarioActual.nombre;

    document.getElementById("emailPerfil").textContent =
        usuarioActual.correo;

    document.getElementById("telefonoPerfil").textContent =
        usuarioActual.telefono;

    document.getElementById("rolPerfil").textContent =
        usuarioActual.rol;

    document.getElementById("tipoPerfil").textContent =
        usuarioActual.rol;
}


function abrirFormulario(solicitud = null) {

    if (!usuarioActual) {
        mostrarVentana("login");
        return;
    }

    if (
        solicitud &&
        usuarioActual.rol !== "Administrador"
    ) {
        alerta("error", "Acceso denegado");
        return;
    }

    const formulario = document.getElementById("formSolicitud");

    formulario.reset();

    document.getElementById("idEdicion").value =
        solicitud ? solicitud.id : "";

    document.getElementById("tituloFormulario").textContent =
        solicitud
            ? "Editar mantenimiento"
            : "Solicitud de mantenimiento";

    if (solicitud) {

        document.getElementById("nombreCliente").value =
            solicitud.nombre;

        document.getElementById("emailCliente").value =
            solicitud.correo;

        document.getElementById("telefonoCliente").value =
            solicitud.telefono;

        document.getElementById("placa").value =
            solicitud.placa;

        document.getElementById("marca").value =
            solicitud.marca;

        document.getElementById("modelo").value =
            solicitud.modelo;

        document.getElementById("anio").value =
            solicitud.anio;

        document.getElementById("kilometraje").value =
            solicitud.kilometraje;

        document.getElementById("servicio").value =
            solicitud.servicio;

        document.getElementById("fecha").value =
            solicitud.fecha;

        document.getElementById("descripcion").value =
            solicitud.descripcion || "";

        document.querySelectorAll('input[name="horario"]').forEach(radio => {
            radio.checked = radio.value === solicitud.horario;
        });

        document.querySelectorAll('input[name="extras"]').forEach(check => {
            check.checked = solicitud.extras.includes(check.value);
        });

    } else {

        document.getElementById("nombreCliente").value =
            usuarioActual.nombre;

        document.getElementById("emailCliente").value =
            usuarioActual.correo;

        document.getElementById("telefonoCliente").value =
            usuarioActual.telefono;
    }

    mostrarVentana("solicitud");
}



function validarSolicitud() {

    const formulario = document.getElementById("formSolicitud");

    const nombre = document.getElementById("nombreCliente").value.trim();

    const telefono = document.getElementById("telefonoCliente").value.trim();

    const placa = document.getElementById("placa").value
        .trim()
        .toUpperCase();

    const anio = Number(document.getElementById("anio").value);

    const kilometraje = Number(
        document.getElementById("kilometraje").value
    );

    const fecha = document.getElementById("fecha").value;

    const horario = document.querySelector(
        'input[name="horario"]:checked'
    );

    if (!formulario.checkValidity()) {

        formulario.reportValidity();

        return false;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{3,70}$/.test(nombre)) {

        alerta(
            "warning",
            "Nombre incorrecto",
            "Ingresa nombres y apellidos válidos."
        );

        return false;
    }

    if (!/^09\d{8}$/.test(telefono)) {

        alerta(
            "warning",
            "Teléfono incorrecto",
            "Ingresa un celular ecuatoriano de 10 dígitos."
        );

        return false;
    }

    if (!/^[A-Z]{3}-?\d{3,4}$/.test(placa)) {

        alerta(
            "warning",
            "Placa incorrecta",
            "Utiliza un formato como ABC-123 o ABC-1234."
        );

        return false;
    }

    if (
        anio < 1950 ||
        anio > new Date().getFullYear()
    ) {

        alerta(
            "warning",
            "Año incorrecto",
            "El año debe estar entre 1950 y el año actual."
        );

        return false;
    }

    if (
        !Number.isInteger(kilometraje) ||
        kilometraje < 0 ||
        kilometraje > 2000000
    ) {

        alerta(
            "warning",
            "Kilometraje incorrecto",
            "Ingresa un kilometraje válido."
        );

        return false;
    }

    const fechaSeleccionada = new Date(fecha + "T00:00:00");

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    if (
        !fecha ||
        Number.isNaN(fechaSeleccionada.getTime()) ||
        fechaSeleccionada < hoy
    ) {

        alerta(
            "warning",
            "Fecha incorrecta",
            "Selecciona una fecha igual o posterior a hoy."
        );

        return false;
    }

    if (!horario) {

        alerta(
            "warning",
            "Horario requerido",
            "Selecciona un horario."
        );

        return false;
    }

    return true;
}



function guardarSolicitud(evento) {

    evento.preventDefault();

    if (!usuarioActual) {
        mostrarVentana("login");
        return;
    }

    if (!validarSolicitud()) return;

    const idEdicion = document.getElementById("idEdicion").value;

    const existente = idEdicion
        ? solicitudes.find(s => s.id === Number(idEdicion))
        : null;

    if (
        existente &&
        usuarioActual.rol !== "Administrador"
    ) {

        alerta(
            "error",
            "Acceso denegado",
            "No puedes modificar solicitudes."
        );

        return;
    }

    const correo = document.getElementById("emailCliente")
        .value.trim().toLowerCase();

    const usuarioCliente = usuarios.find(u =>
        u.correo.toLowerCase() === correo &&
        u.rol === "Cliente"
    );

    const extras = Array.from(
        document.querySelectorAll('input[name="extras"]:checked')
    ).map(elemento => elemento.value);

    const nuevaSolicitud = {

        id: existente ? existente.id : Date.now(),

        usuarioId: existente
            ? existente.usuarioId
            : usuarioActual.rol === "Administrador"
                ? (usuarioCliente ? usuarioCliente.id : 0)
                : usuarioActual.id,

        nombre: document.getElementById("nombreCliente").value.trim(),

        correo: correo,

        telefono: document.getElementById("telefonoCliente").value.trim(),

        placa: document.getElementById("placa").value.trim().toUpperCase(),

        marca: document.getElementById("marca").value.trim(),

        modelo: document.getElementById("modelo").value.trim(),

        anio: Number(document.getElementById("anio").value),

        kilometraje: Number(
            document.getElementById("kilometraje").value
        ),

        servicio: document.getElementById("servicio").value,

        fecha: document.getElementById("fecha").value,

        horario: document.querySelector(
            'input[name="horario"]:checked'
        ).value,

        extras: extras,

        descripcion: document.getElementById("descripcion").value.trim(),

        estado: existente ? existente.estado : "Pendiente",

        fechaRegistro: existente
            ? existente.fechaRegistro
            : new Date().toISOString()
    };

    if (existente) {

        solicitudes = solicitudes.map(s =>
            s.id === existente.id
                ? nuevaSolicitud
                : s
        );

    } else {

        solicitudes.push(nuevaSolicitud);
    }

    guardarSolicitudes();

    Swal.fire({
        icon: "success",
        title: existente
            ? "Solicitud actualizada"
            : "Solicitud registrada",
        text: "Los datos se guardaron correctamente.",
        confirmButtonColor: "#1769aa"
    }).then(() => {

        if (usuarioActual.rol === "Administrador") {
            mostrarVentana("admin");
        } else {
            mostrarVentana("misSolicitudes");
        }

    });
}


function claseEstado(estado) {

    const clases = {
        "Pendiente": "pendiente",
        "En revisión": "revision",
        "En proceso": "proceso",
        "Finalizado": "finalizado",
        "Cancelado": "cancelado"
    };

    return clases[estado] || "";
}

function mostrarEstado(estado) {

    return `
        <span class="estado ${claseEstado(estado)}">
            ${escapar(estado)}
        </span>
    `;
}



function generarTabla(datos, administrador = false) {

    if (datos.length === 0) {

        return `
            <div class="vacio">
                <h4>No existen solicitudes registradas</h4>
                <p>Cuando registres un mantenimiento aparecerá aquí.</p>
            </div>
        `;
    }

    const filas = datos.map(solicitud => {

        const accionesAdmin = administrador ? `

            <td>
                <select class="form-select form-select-sm"
                    data-estado="${solicitud.id}"
                    aria-label="Cambiar estado">

                    ${estados.map(estado => `
                        <option value="${estado}"
                            ${estado === solicitud.estado ? "selected" : ""}>
                            ${estado}
                        </option>
                    `).join("")}

                </select>
            </td>

            <td>
                <button class="btn btn-sm btn-outline-primary mb-1"
                    data-editar="${solicitud.id}">
                    Editar
                </button>

                <button class="btn btn-sm btn-outline-danger mb-1"
                    data-eliminar="${solicitud.id}">
                    Eliminar
                </button>
            </td>

        ` : `
            <td>${mostrarEstado(solicitud.estado)}</td>
        `;

        return `
            <tr>

                <td>#${solicitud.id}</td>

                <td>
                    <strong>${escapar(solicitud.nombre)}</strong><br>
                    <small>${escapar(solicitud.correo)}</small>
                </td>

                <td>
                    <strong>${escapar(solicitud.placa)}</strong><br>
                    <small>${escapar(solicitud.marca)}
                    ${escapar(solicitud.modelo)}</small>
                </td>

                <td>${escapar(solicitud.servicio)}</td>

                <td>
                    ${escapar(solicitud.fecha)}<br>
                    <small>${escapar(solicitud.horario)}</small>
                </td>

                ${accionesAdmin}

            </tr>
        `;

    }).join("");

    return `
        <table class="tabla">

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Vehículo</th>
                    <th>Servicio</th>
                    <th>Fecha / hora</th>
                    <th>Estado</th>
                    ${administrador ? "<th>Acciones</th>" : ""}
                </tr>
            </thead>

            <tbody>
                ${filas}
            </tbody>

        </table>
    `;
}



function mostrarMisSolicitudes() {

    if (!usuarioActual) return;

    const propias = solicitudes.filter(s =>
        s.usuarioId === usuarioActual.id
    );

    document.getElementById("tablaMisSolicitudes").innerHTML =
        generarTabla(propias, false);
}



function mostrarAdministracion() {

    if (usuarioActual?.rol !== "Administrador") return;

    document.getElementById("totalSolicitudes").textContent =
        solicitudes.length;

    document.getElementById("totalPendientes").textContent =
        solicitudes.filter(s => s.estado === "Pendiente").length;

    document.getElementById("totalProceso").textContent =
        solicitudes.filter(s => s.estado === "En proceso").length;

    document.getElementById("totalFinalizados").textContent =
        solicitudes.filter(s => s.estado === "Finalizado").length;

    const busqueda = document.getElementById("buscarAdmin")
        .value.trim().toLowerCase();

    const filtro = document.getElementById("filtroEstado").value;

    const resultados = solicitudes.filter(s => {

        const coincideTexto = [
            s.nombre,
            s.correo,
            s.placa,
            s.servicio
        ].some(valor =>
            String(valor).toLowerCase().includes(busqueda)
        );

        const coincideEstado =
            !filtro || s.estado === filtro;

        return coincideTexto && coincideEstado;
    });

    document.getElementById("tablaAdmin").innerHTML =
        generarTabla(resultados, true);
}



function cambiarEstado(id, nuevoEstado) {

    if (
        usuarioActual?.rol !== "Administrador" ||
        !estados.includes(nuevoEstado)
    ) {

        alerta("error", "Acceso denegado");
        return;
    }

    solicitudes = solicitudes.map(s => {

        if (s.id === id) {
            return {
                ...s,
                estado: nuevoEstado
            };
        }

        return s;
    });

    guardarSolicitudes();

    mostrarAdministracion();

    alerta(
        "success",
        "Estado actualizado",
        `Nuevo estado: ${nuevoEstado}`
    );
}



async function eliminarSolicitud(id) {

    if (usuarioActual?.rol !== "Administrador") {

        alerta("error", "Acceso denegado");
        return;
    }

    const resultado = await Swal.fire({

        title: "¿Eliminar solicitud?",

        text: "Esta acción no se puede deshacer.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonColor: "#c0392b",

        cancelButtonColor: "#6c757d",

        confirmButtonText: "Sí, eliminar",

        cancelButtonText: "Cancelar"

    });

    if (!resultado.isConfirmed) return;

    solicitudes = solicitudes.filter(s => s.id !== id);

    guardarSolicitudes();

    mostrarAdministracion();

    alerta(
        "success",
        "Solicitud eliminada",
        "El registro se eliminó correctamente."
    );
}




function eventosTabla(evento) {

    const botonEditar = evento.target.closest("[data-editar]");

    const botonEliminar = evento.target.closest("[data-eliminar]");

    if (botonEditar) {

        const id = Number(botonEditar.dataset.editar);

        const solicitud = solicitudes.find(s => s.id === id);

        if (solicitud) {
            abrirFormulario(solicitud);
        }
    }

    if (botonEliminar) {

        const id = Number(botonEliminar.dataset.eliminar);

        eliminarSolicitud(id);
    }
}




document.addEventListener("click", evento => {

    const enlace = evento.target.closest("[data-view]");

    const accion = evento.target.closest("[data-action]");

    if (enlace) {

        evento.preventDefault();

        mostrarVentana(enlace.dataset.view);
    }

    if (accion && accion.dataset.action === "solicitar") {

        evento.preventDefault();

        if (!usuarioActual) {
            mostrarVentana("login");
        } else {
            abrirFormulario();
        }
    }
});



document.getElementById("formLogin")
    .addEventListener("submit", evento => {

        evento.preventDefault();

        const correo = document.getElementById("correoLogin")
            .value.trim();

        const clave = document.getElementById("claveLogin").value;

        if (!correo || !clave) {

            alerta(
                "warning",
                "Campos obligatorios",
                "Ingresa tu correo y contraseña."
            );

            return;
        }

        iniciarSesion(correo, clave);
    });



document.getElementById("btnCerrar")
    .addEventListener("click", cerrarSesion);



document.getElementById("formSolicitud")
    .addEventListener("submit", guardarSolicitud);




document.getElementById("buscarAdmin")
    .addEventListener("input", mostrarAdministracion);

document.getElementById("filtroEstado")
    .addEventListener("change", mostrarAdministracion);

document.getElementById("tablaAdmin")
    .addEventListener("click", eventosTabla);

document.getElementById("tablaAdmin")
    .addEventListener("change", evento => {

        const selector = evento.target.closest("[data-estado]");

        if (selector) {

            cambiarEstado(
                Number(selector.dataset.estado),
                selector.value
            );
        }
    });



document.getElementById("fecha").min =
    new Date().toLocaleDateString("en-CA");



actualizarMenu();

mostrarVentana("inicio");
