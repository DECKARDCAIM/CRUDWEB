function IngresarPelicula(event) {
    // Prevenir el comportamiento por defecto del formulario
    event.preventDefault();

    const pelicula = {
        imdbID: document.getElementById('imdbID').value,
        title: document.getElementById('title').value,
        year: document.getElementById('year').value,
        type: document.getElementById('type').value,
        poster: document.getElementById('poster').value,
        description: document.getElementById('description').value,
        ubication: document.getElementById('ubication').value,
        estado: parseInt(document.getElementById('estado').value), // Convertir el valor a entero
    };

    // URL de la API donde se va a enviar la petición POST
    const url = 'https://movie.azurewebsites.net/api/cartelera';

    // Hacer la petición POST con fetch
    fetch(url, {
        method: 'POST', // Método POST
        headers: {
            'Content-Type': 'application/json', // Tipo de contenido JSON
        },
        body: JSON.stringify(pelicula) // Convertir el objeto 'pelicula' a JSON
    })
    .then(response => {
        if (response.ok) { // Si la respuesta es correcta
            return response.json();
        } else {
            throw new Error('Error al enviar los datos');
        }
    })
    .then(data => {
        // Si la operación fue exitosa, mostrar SweetAlert2
        Swal.fire({
            title: "¡Buen trabajo!",
            text: "¡Película agregada con éxito!",
            icon: "success"
        });
        cargarPeliculas();  // Refresca la lista completa después de agregar
        console.log(data); // Mostrar la respuesta del servidor en la consola
        
    })
    .catch(error => {
        // Si ocurre un error, mostrar SweetAlert2 con el mensaje de error
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "¡Algo salió mal!",
            footer: '<a href="#">¿Por qué tengo este problema?</a>'
        });
        console.error('Error:', error);
    });
}

// Asociar el evento 'submit' del formulario con la función
document.getElementById('movieForm').addEventListener('submit', IngresarPelicula);













// Función para cargar las películas al cargar la página
function cargarPeliculas() {
    fetch('https://movie.azurewebsites.net/api/cartelera?title=&ubication=')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(peliculas => {
        const contenedorPeliculas = document.getElementById('movie-list');
        contenedorPeliculas.innerHTML = '';  // Limpiar el contenedor antes de añadir nuevo contenido

        peliculas.forEach((pelicula, index) => {
            // Salta la primera película si no tiene título
            if (index === 0 && !pelicula.Title) return;

            contenedorPeliculas.innerHTML += `
                <div class="col-md-4 mb-3">
                <div class="card">
                <img src="${pelicula.Poster}" class="card-img-top" alt="${pelicula.Title}">
                <div class="card-body">
                <h5 class="card-title">${pelicula.Title}</h5>
                <p class="card-text">${pelicula.description.substring(0, 100)}...</p> <!-- Cortar el texto si es muy largo -->
                <button class="btn btn-warning" onclick="verMasDetalles('${pelicula.imdbID}')">Ver más</button>
                <p class="card-text"><small class="text-muted">${pelicula.Year}</small></p>
                <button class="btn btn-primary" onclick="actualizarPelicula('${pelicula.imdbID}')">Actualizar</button>
                <button class="btn btn-danger" onclick="eliminarPelicula('${pelicula.imdbID}')">Eliminar</button>
                </div>
                </div>
                </div>
            `;

        });
    })
    .catch(error => {
        console.error('Error al cargar las películas:', error);
        alert('Error al cargar las películas: ' + error.message);
    });
}

// Llamar a cargarPeliculas al cargar la página
window.onload = cargarPeliculas;














function verMasDetalles(imdbID) {
    // URL para obtener los detalles de la película
    const url = `https://movie.azurewebsites.net/api/cartelera?imdbID=${imdbID}`;

    // Hacer una petición GET a la API para obtener los detalles de la película
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener los detalles de la película');
        }
        return response.json();
    })
    .then(pelicula => {
        // Obtener los elementos del modal donde se mostrarán los detalles
        const titleElement = document.getElementById('detailsModalLabel');
        const bodyElement = document.getElementById('detailsModalBody');

        // Verificar si los elementos existen antes de intentar modificarlos
        if (titleElement && bodyElement) {
            // Rellenar el título del modal con el título de la película
            titleElement.innerText = pelicula.Title;
            
            // Rellenar el cuerpo del modal con la descripción y otros detalles
            bodyElement.innerHTML = `
                <p><strong>Descripción:</strong> ${pelicula.description}</p>
                <p><strong>Año:</strong> ${pelicula.Year}</p>
                <p><strong>Ubicación:</strong> ${pelicula.Ubication}</p>
                <p><strong>Estado:</strong> ${pelicula.Estado === 1 ? 'Activo' : 'Inactivo'}</p>
            `;

            // Mostrar el modal utilizando Bootstrap
            const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
            modal.show();
        } else {
            console.error('No se encontraron los elementos del modal');
        }
    })
    .catch(error => {
        console.error('Error al cargar los detalles de la película:', error);
        alert('Error al cargar los detalles de la película: ' + error.message);
    });
}

















function eliminarPelicula(imdbID) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo!'
    }).then((result) => {
        if (result.isConfirmed) {
            const url = `https://movie.azurewebsites.net/api/cartelera?imdbID=${imdbID}`;
            fetch(url, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire(
                        '¡Eliminado!',
                        'La película ha sido eliminada.',
                        'success'
                    );
                    cargarPeliculas(); // Recargar la lista de películas
                } else {
                    throw new Error('No se pudo eliminar la película');
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: '¡Algo salió mal! ' + error.message
                });
            });
        }
    });
}










function actualizarPelicula(imdbID) {
    const url = `https://movie.azurewebsites.net/api/cartelera?imdbID=${imdbID}`;
    fetch(url)
    .then(response => response.json())
    .then(pelicula => {
        document.getElementById('updateImdbID').value = pelicula.imdbID;
        document.getElementById('updateTitle').value = pelicula.Title;
        document.getElementById('updateYear').value = pelicula.Year;
        document.getElementById('updateType').value = pelicula.Type;
        document.getElementById('updatePoster').value = pelicula.Poster;
        document.getElementById('updateEstado').value = pelicula.Estado.toString();
        document.getElementById('updateDescription').value = pelicula.description;
        document.getElementById('updateUbication').value = pelicula.Ubication;

        var modal = new bootstrap.Modal(document.getElementById('updateMovieModal'));
        modal.show();
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('updateMovieForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const updatedData = {
        imdbID: document.getElementById('updateImdbID').value,
        Title: document.getElementById('updateTitle').value,
        Year: document.getElementById('updateYear').value,
        Type: document.getElementById('updateType').value,
        Poster: document.getElementById('updatePoster').value,
        Estado: document.getElementById('updateEstado').value === 'true',
        description: document.getElementById('updateDescription').value,
        Ubication: document.getElementById('updateUbication').value
    };

    const url = `https://movie.azurewebsites.net/api/cartelera?imdbID=${updatedData.imdbID}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (response.ok) {
            Swal.fire("¡Actualizado!", "La película ha sido actualizada con éxito.", "success");
            cargarPeliculas(); // Recargar la lista de películas
        } else {
            throw new Error('Error al actualizar la película');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire("Error", "No se pudo actualizar la película: " + error.message, "error");
    });
});
