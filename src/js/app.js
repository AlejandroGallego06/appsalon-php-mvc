let paso = 1;
const pasoInicial = 1;
const pasoFinal = 3;

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
};

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion(); //Muestra y oculta la seccion actual
    tabs(); //Cambia la seccion al dar click en los tabs
    botonesPaginador(); //Agregar funcionalidad a los botones de paginador
    paginaSiguiente(); //Funcionalidad para el boton siguiente
    paginaAnterior(); //Funcionalidad para el boton anterior

    consultarAPI(); //Consultar la API

    idCliente(); //Almacenar el id del cliente

    nombreCliente(); //Almacenar el nombre del cliente

    seleccionarFecha(); //Seleccionar la fecha

    seleccionarHora(); //Seleccionar la hora

    mostrarResumen(); //Muestra el resumen de la cita
}

function mostrarSeccion() {
    //Ocultar la seccion con la clase mostrar
    const seccionAnterior = document.querySelector('.mostrar');
    if(seccionAnterior) {
        seccionAnterior.classList.remove('mostrar');
    }

    //Seleccionar la seccion con el paso actual
    const seccion = document.querySelector(`#paso-${paso}`);
    seccion.classList.add('mostrar');

    //Eliminar la clase actual en el tab anterior
    const tabAnterior = document.querySelector('.actual');
    if(tabAnterior) {
        tabAnterior.classList.remove('actual');
    }

    //Resaltar el tab actual
    const tab = document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add('actual');
}

function tabs() {
    const botones = document.querySelectorAll('.tabs button');

    botones.forEach( boton => {
        boton.addEventListener('click', function(e) {
            paso = parseInt(e.target.dataset.paso);

            mostrarSeccion();
            botonesPaginador();
        });
    });
}

function botonesPaginador() {
    const anterior = document.querySelector('#anterior');
    const siguiente = document.querySelector('#siguiente');
    
    if(paso === 1) {
        anterior.classList.add('ocultar');
        siguiente.classList.remove('ocultar');
    } else if (paso === 3) {
        anterior.classList.remove('ocultar');
        siguiente.classList.add('ocultar');

        mostrarResumen();
    } else {
        anterior.classList.remove('ocultar');
        siguiente.classList.remove('ocultar');
    }

    mostrarSeccion();
}

function paginaAnterior() {
    const anterior = document.querySelector('#anterior');
    anterior.addEventListener('click', function() {
    
    if(paso <= pasoInicial) return;
    paso--;
    botonesPaginador();
    });
}

function paginaSiguiente() {
    const siguiente = document.querySelector('#siguiente');
    siguiente.addEventListener('click', function() {
    
    if(paso >= pasoFinal) return;
    paso++;
    botonesPaginador();
    });
}

async function consultarAPI() {
    try {
        const url = '/api/servicios';
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    } catch (error) {
        console.log(error);
    }
}

function mostrarServicios(servicios) {
    servicios.forEach( servicio => {
        const { id, nombre, precio } = servicio;
        
        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$ ${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function() {
            seleccionarServicio(servicio);
        }

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector('#servicios').appendChild(servicioDiv);
    });
}

function seleccionarServicio(servicio){
    const {id} = servicio;
    const {servicios} = cita;

    //Identificar si el servicio ya esta seleccionado
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

    //Comprobar si el servicio ya esta en el arreglo
    if(servicios.some( agregado => agregado.id === id)){
        //Eliminar el servicio del arreglo
        cita.servicios = servicios.filter( agregado => agregado.id !== id);
        divServicio.classList.remove('seleccionado');
    }else{
        //Agregarlo al arreglo
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('seleccionado');
    }
    
    // console.log(cita);
}

function idCliente() {
    const id = document.querySelector('#id').value;
    cita.id = id;
}

function nombreCliente() {
    const nombreInput = document.querySelector('#nombre').value;
    cita.nombre = nombreInput;
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function(e) {
        const dia = new Date(e.target.value).getUTCDay();
        
        if([0].includes(dia)){
            e.target.value = '';
            mostrarAlerta('No se pueden agendar citas los domingos', 'error', '.formulario');
        }else{
            cita.fecha = e.target.value;
        }
    });
}

function seleccionarHora() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', function(e) {
        const horaCita = e.target.value; // Formato "HH:MM"
        let [hora, minutos] = horaCita.split(':').map(Number);
        let periodo = 'AM';

        if (hora >= 12) {
            periodo = 'PM';
            if (hora > 12) {
                hora -= 12;
            }
        } else if (hora === 0) {
            hora = 12;
        }

        // Formatear hora y minutos con ceros iniciales si es necesario
        const horaFormateada = hora.toString().padStart(2, '0');
        const minutosFormateados = minutos.toString().padStart(2, '0');

        const horaFinal = `${horaFormateada}:${minutosFormateados} ${periodo}`;

        // Validar el rango de horas en formato de 24 horas
        const hora24 = parseInt(horaCita.split(':')[0], 10);
        if(hora24 < 9 || hora24 >= 18) {
            e.target.value = '';
            mostrarAlerta('Hora no válida. Debe ser entre 09:00 AM y 06:00 PM.', 'error', '.formulario');
        } else {
            cita.hora = horaCita;
            console.log(cita);
        }
    });
}


function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {

    //Si hay una alerta previa, no crear otra
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia) {
        alertaPrevia.remove();
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if(desaparece) {
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen');

    //Limpiar el contenido de resumen
    while(resumen.firstChild) {
        resumen.removeChild(resumen.firstChild);
    }
    if(Object.values(cita).includes('') || cita.servicios.length === 0) {
        mostrarAlerta('Falta seleccionar un servicio, fecha u hora', 'error', '.contenido-resumen', false);
        return
    }

    //Formatear el resumen
    const {nombre, fecha, hora, servicios} = cita;

    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`;

    //Formatear la fecha en español
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2;
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date( Date.UTC(year, mes, dia) );
    
    const opciones = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const fechaFormateada = fechaUTC.toLocaleDateString('es-CO', opciones);
    
    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    //Heading para servicios en resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de servicios';
    resumen.appendChild(headingServicios);

    //Iterando y mostrando los servicios
    servicios.forEach( servicio => {
        const {id, precio, nombre} = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);
        resumen.appendChild(contenedorServicio);
    });

    //Heading para cita
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de la cita';
    resumen.appendChild(headingCita);

    //Boton para crear la cita
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    resumen.appendChild(botonReservar);
}

async function reservarCita(){

    const {nombre, fecha, hora, servicios, id} = cita;

    const idServicios = servicios.map( servicio => servicio.id);

    const datos = new FormData();
    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('usuarioid', id);
    datos.append('servicios', idServicios);

    try {
        //Peticion hacia la api
        const url = '/api/citas';

        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        });

        const resultado = await respuesta.json();
        console.log(resultado.resultado);

        if(resultado.resultado){
            Swal.fire({
                icon: "success",
                title: "Cita creada",
                text: "Tu cita fue creada correctamente!",
                confirmButtonText: "Aceptar"
            }).then(() => {
                window.location.reload();
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al guardar la cita!",
        });
    }

    

    //console.log([...datos]);
}