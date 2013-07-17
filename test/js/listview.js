$(function() {

	var data = {
		'Facultad de Estudios Superiores Aragón': {
			'Ingeniería en Computación': {
				'Teoría': {

				},
				'Laboratorios': {

				}
			}
		}
	}

	// Crear los elementos del control ListView
	$('#container')
		// Inicialización
		.listview({
			onCheckBoxSel: function(allcount, selcount, selarray) {
				console.log('Dentro de ' + this + ' hay ' + selcount + ' elemento(s) seleccionado(s) de ' + allcount +
					' elementos totales.');
			}
		})

		// Creación de columnas
		.listview('columns.new', 'Clave', '5%', null)
		.listview('columns.new', 'Asignatura<br>Profesor', '45%', null)
		.listview('columns.new', 'Salón', '10%', null)
		.listview('columns.new', 'Grupo', '5%', 3)
		.listview('columns.new', 'Horario', '25%', null)

		// Creación de elementos
		.listview('items.new', null, true, 'Quinto Semestre')
		.listview('items.new', null, false, {
			'Clave': '1500',
			'Asignatura<br>Profesor': '<strong>Diseño y Análisis de Algoritmos</strong><br>Sánchez Hernández Miguel Ángel',
			'Salón': 'A-213',
			'Grupo': '1507',
			'Horario': '<strong>Martes, Jueves</strong><br>11:15 - 13:30'
		})
		.listview('items.new', null, true, 'Sexto Semestre')
		.listview('items.new', null, false, {
			'Clave': '2129',
			'Asignatura<br>Profesor': '<strong>Calidad</strong><br>Navarro González Antonia',
			'Salón': 'A-216',
			'Grupo': '1607',
			'Horario': '<strong>Viernes</strong><br>10:00 - 13:00'
		});
	
});