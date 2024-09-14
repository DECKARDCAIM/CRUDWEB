function IngresarPelicula(event) {
    event.preventDefault();
    const pelicula = {
        imdbID: document.getElementById('imdbID').value,
        title: document.getElementById('title').value,
        year: document.getElementById('year').value,
        type: document.getElementById('type').value,
        poster: document.getElementById('poster').value,
        description: document.getElementById('description').value,
        ubication: document.getElementById('ubication').value,
        estado: parseInt(document.getElementById('estado').value),
    };
    const url = 'https://movie.azurewebsites.net/api/cartelera';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pelicula)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error al enviar los datos');
            }
        })
        .then(data => {
            Swal.fire({
                title: "¡Buen trabajo!",
                text: "¡Película agregada con éxito!",
                icon: "success"
            });
            cargarPeliculas();
            console.log(data);
            document.getElementById('movieForm').reset();
        })
        .catch(error => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "¡Algo salió mal!",
                footer: '<a href="#">¿Por qué tengo este problema?</a>'
            });
            console.error('Error:', error);
        });
}
document.getElementById('movieForm').addEventListener('submit', IngresarPelicula);

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
                                <p class="card-text"><small class="text-muted">${pelicula.Year}</small></p>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-warning" onclick="verMasDetalles('${pelicula.imdbID}')">Ver más</button>
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
window.onload = cargarPeliculas;

function verMasDetalles(imdbID) {
    const url = `https://movie.azurewebsites.net/api/cartelera?imdbID=${imdbID}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los detalles de la película');
            }
            return response.json();
        })
        .then(pelicula => {
            const titleElement = document.getElementById('detailsModalLabel');
            const bodyElement = document.getElementById('detailsModalBody');
            if (titleElement && bodyElement) {
                titleElement.innerText = pelicula.Title;
                bodyElement.innerHTML = `
                <p><strong>Descripción:</strong> ${pelicula.description}</p>
                <p><strong>Año:</strong> ${pelicula.Year}</p>
                <p><strong>Ubicación:</strong> ${pelicula.Ubication}</p>
                <p><strong>Estado:</strong> ${pelicula.Estado === 1 ? 'Inactivo' : 'Activo'}</p>
            `;
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
                        cargarPeliculas();
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
document.getElementById('updateMovieForm').addEventListener('submit', function (event) {
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
                cargarPeliculas();
            } else {
                throw new Error('Error al actualizar la película');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire("Error", "No se pudo actualizar la película: " + error.message, "error");
        });
});