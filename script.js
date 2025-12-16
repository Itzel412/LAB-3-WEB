// script.js - solucion del laboratorio

const miFormulario = document.querySelector("#postForm")
const inputId = document.querySelector("#userIdInput")
const checkRecordar = document.querySelector("#rememberUser")
const divEstado = document.querySelector("#statusArea")
const listaResultados = document.querySelector("#postsList")
const botonLimpiar = document.querySelector("#clearResultsBtn")

// claves para el storage
const key_usuario = "lab_fetch_last_user_id"
const key_posts = "lab_fetch_posts_data"

// todo 1: cargar cosas al iniciar
window.addEventListener("DOMContentLoaded", function() {
    // primero vemos lo del id
    let idGuardado = localStorage.getItem(key_usuario)
    if(idGuardado) {
        inputId.value = idGuardado
        checkRecordar.checked = true
    }

    // ahora cargamos los posts si existen
    let postsGuardados = localStorage.getItem(key_posts)
    if(postsGuardados) {
        try {
            // intento convertir el texto a objeto
            let datosJson = JSON.parse(postsGuardados)
            renderPosts(datosJson)
            mensajeEstado("datos cargados del cache local", "success")
        } catch (error) {
            // si falla borro todo porque esta corrupto
            console.log("hubo error al leer el json asi que lo borro")
            localStorage.removeItem(key_posts)
        }
    }
})

// todo 2: manejar el envio
miFormulario.addEventListener("submit", function(e) {
    e.preventDefault() // para que no recargue

    let idUsuario = parseInt(inputId.value)

    // valido que este entre 1 y 10
    if(isNaN(idUsuario) || idUsuario < 1 || idUsuario > 10) {
        mensajeEstado("error el numero debe ser entre 1 y 10", "error")
        return // me salgo si esta mal
    }

    mensajeEstado("cargando informacion...", "loading")
    
    // llamo a la funcion asincrona
    fetchPostsByUser(idUsuario)
})

// todo 3: funcion asincrona con fetch
async function fetchPostsByUser(userId) {
    let url = "https://jsonplaceholder.typicode.com/posts?userId=" + userId

    try {
        // uso await como pedia la guia
        let respuesta = await fetch(url)

        if(!respuesta.ok) {
            throw new Error("error en la peticion http")
        }

        // esperamos a que se transforme a json
        let data = await respuesta.json()

        mensajeEstado("carga exitosa de " + data.length + " posts", "success")
        
        // pinto los posts
        renderPosts(data)

        // todo 5: guardar o borrar id
        if(checkRecordar.checked) {
            localStorage.setItem(key_usuario, userId)
        } else {
            localStorage.removeItem(key_usuario)
        }

    } catch (error) {
        console.log(error)
        mensajeEstado("ocurrio un error al intentar conectar", "error")
    }
}

// todo 4: mostrar en dom y guardar
function renderPosts(posts) {
    // vacio la lista primero
    listaResultados.innerHTML = ""

    posts.forEach(post => {
        // creo los elementos con createElement
        let itemLi = document.createElement("li")
        itemLi.className = "post-item"

        let titulo = document.createElement("p")
        titulo.className = "post-title"
        titulo.innerText = post.title

        let cuerpo = document.createElement("p")
        cuerpo.className = "post-body"
        cuerpo.innerText = post.body

        // meto los parrafos en el li
        itemLi.appendChild(titulo)
        itemLi.appendChild(cuerpo)

        // y meto el li en la lista grande
        listaResultados.appendChild(itemLi)
    })

    // guardo en localstorage el arreglo stringificado
    localStorage.setItem(key_posts, JSON.stringify(posts))
}

// todo 6: boton limpiar
botonLimpiar.addEventListener("click", function() {
    listaResultados.innerHTML = "" // borro visual
    localStorage.removeItem(key_posts) // borro memoria
    mensajeEstado("Aún no se ha hecho ninguna petición.", "")
    
    // quito las clases de colores del estado
    let span = divEstado.querySelector(".status-message")
    span.classList.remove("status-message--error", "status-message--success", "status-message--loading")
})

// funcion extra para los mensajitos
function mensajeEstado(texto, tipo) {
    let spanMensaje = divEstado.querySelector(".status-message")
    
    // reseteo clases
    spanMensaje.className = "status-message"

    if(tipo == "error") spanMensaje.classList.add("status-message--error")
    if(tipo == "success") spanMensaje.classList.add("status-message--success")
    if(tipo == "loading") spanMensaje.classList.add("status-message--loading")

    spanMensaje.innerText = texto
}