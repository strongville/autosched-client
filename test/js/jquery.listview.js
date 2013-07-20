/*! ListView
Requiere jQuery 1.10.* o 2.*
(C) 2013, Villafuerte Arredondo Guillermo */

(function($) {
	if (typeof $ === "undefined")
		return;

	// Constructor del plugin más funciones privadas
	function ListView(element, options) {
		this.element = element;
		this.options = $.extend({}, this.defaults, options);
	}

	// Funciones públicas del plugin
	ListView.prototype = {
		defaults: {
			useCheckboxes: true,
			onCheckBoxSel: null
		},

		_updateproc: function() {

			var collection = $(this.element).find('#colheader, li:not(.separator)'),
				current;

			// Ajustar la apariencia de acuerdo a la opción de casillas de verificación
			if (this.options.useCheckboxes) {
				// Agregar todas la columnas necesarias solo en caso de que no existan
				for (var i = 0; i < collection.length; i++) {
					current = collection.get(i);
					if ( ! $(current).find('div:first').hasClass('checkcol') )
						$(current).prepend('<div class="checkcol" data-width="30px"><input type="checkbox" id="tickmark" /></div>');
				}
			}
			else {
				// Retirar todas las casillas de verificación
				$(this.element).find('.checkcol').remove();
			}

			// Ajustar el ancho de todas las columnas
			var columns = $(this.element).find('#colheader div').length,
				items = $(this.element).find('li:not(.separator)').length;
			for (var i = 1; i <= items; i++) {
				var currentdom = $(this.element).find('li:not(.separator)').get(i - 1),
					offset = (this.options.useCheckboxes) ? 1 : 0;
				for (var j = 1; j <= columns; j++) {
					$(currentdom).find('div:nth-child(' + (j + offset) + ')')
						.width( this._getWidthFromCol(j) );
				}
			}
		},

		// DATOS DE COLUMNA
		// Al realizar operaciones con columnas, la de casillas no debe contar ni ser accesible, en caso de existir.
		_getWidthFromCol: function(index) {
			// Para el usuario, la columna de casillas NO DEBE CONTAR.
			if (this.options.useCheckboxes)
				index++;
			return $(this.element).find('#colheader div:nth-child(' + index + ')').data('width');
		},

		_getTitleFromCol: function(index) {
			// El que llama esta función debe considerar la presencia de la columna adicional.
			return $(this.element).find('#colheader div:nth-child(' + index + ')').html().trim();
		},

		_getColumnsCount: function() {
			var colcount = $(this.element).find('#colheader div').length;
			// La columna de casillas se excluye del conteo.
			return (this.options.useCheckboxes) ? --colcount : colcount;
		},

		// ELEMENTOS DE LISTA
		_getAllItemsCount: function() {
			return $('li:not(.separator, #colheader)', this.element).length;
		},

		_getSelectedCount: function() {
			if (this.options.useCheckboxes)
				return $('li:not(.separator, #colheader)', this.element).find('.checkcol #tickmark:checked').length;
			else
				return -1;
		},

		_getDataFromItem: function(num) {
			// Aislar a partir de la lista el elemento del cual se sacarán los datos.
			var result = {},
				desired = $('li:not(.separator, #colheader)', this.element).get(num - 1);

			// Boolean checked: Indica si el elemento está seleccionado o no.
			// Integer index: Repite el índice del elemento en base 0.
			// Boolean separator: Indica si el objeto se visualiza como un separador o no.
			// Object data: Envía los datos encontrados en cada columna como un arreglo asociativo. null si es separador.
			// String caption: Título que muestra el separador. null si NO es separador.
			//result['separator'] = $(desired).hasClass('separator');
			result['index'] = num - 1;

			// Verificar las condiciones para que exista una casilla de verificación (valga la redundancia)
			//     antes de siquiera intentar acceder a los datos de la misma.
			if (/*!result.separator &&*/ this.options.useCheckboxes)
				result['checked'] = $(desired).find('.checkcol #tickmark').is(':checked');
			/*else
				result['checked'] = false;*/

			// El desplazamiento debe ser indicado para no devolver los datos de las casillas
			/*if (!result.separator) {*/
				result['data'] = {};
				var despla = 0;
				if (this.options.useCheckboxes)
					despla++;

				for (var i = 1; i <= this._getColumnsCount(); i++) {
					result.data[ this._getTitleFromCol(i + despla) ] =
						$(desired).find('div:nth-child(' + (i + despla) + ')').html().trim();
				}
				//result['caption'] = null;
			/*}
			else {
				result['caption'] = $(desired).find('div').html().trim();
				result['data'] = null;
			}*/

			return result;
		},

		// OBTENER DATOS DE LA LISTA
		_getSelectedArray: function() {
			if (this.options.useCheckboxes) {
				var result = [], currdata = {};
				for (var i = 1; i <= this._getAllItemsCount(); i++) {
					currdata = this._getDataFromItem(i);
					if (currdata.checked)
						result.push(currdata);
				}
				return result;
			}
			else
				return null;
		},

		// INICIALIZACIÓN
		init: function() {
			var base = this;

			// Preparar el contenedor
			$(this.element).empty();
			$('<li id="colheader" />').appendTo(this.element);

			
			if (this.options.useCheckboxes) {
				
				// Delegar evento al cambiar el valor de la casilla de cualquier elemento
				$(this.element).on('change.listview', '.checkcol #tickmark', function() {

					// (Des)habilitar todos los elementos en la vista actual si la casilla es del encabezado
					if ($(this).closest('#colheader').length)
						$('li:not(.separator, #colheader)').find('.checkcol #tickmark').prop('checked', $(this).is(':checked'));

					// Contar el número de elementos con la propiedad *checked* y todos los existentes
					var count = base._getSelectedCount(),
						allitems = base._getAllItemsCount();

					// Ajustar la casilla del encabezado: (todos => checked, algunos => indeterminate, ninguno => unchecked)
					$('#colheader .checkcol #tickmark', base.element).prop({
						'checked': count == allitems,
						'indeterminate': count > 0 && count < allitems
					});

					// Permitir la suscripción a un evento para informar del (de los) elemento(s) ahora seleccionado(s)
					if ( $.isFunction(base.options.onCheckBoxSel) ) {
						base.options.onCheckBoxSel.apply(base.element,
							[allitems, count, base._getSelectedArray()]);
					}

				});
			}
		},

		// NUEVO ELEMENTO
		'items.new': function(num, separator, data, attr) {
			var elemlist = $('li:not(.separator)', this.element), 
				numelem = elemlist.length,
				previouselem;

			// Verificar el índice pasado y seleccionar el elemento previo al actual, en caso de haberlo
			if (num === null || num < 1 || num > numelem + 1)
				previouselem = elemlist.last();
			else
				previouselem = elemlist.has(':nth-child(' + num + ')');

			// Crear e insertar el elemento nuevo en base al elemento anterior
			var newitem = $('<li class="' + (separator ? 'separator' : 'listitem') + '"></li>');

			if (!num)
				newitem.appendTo(this.element);
			else 
				newitem.insertAfter(previouselem);

			// Hacer las operaciones precisas para agregar el contenido necesario
			if (separator) {
				var innerdiv = $('<div />').appendTo(newitem);
				innerdiv.html(data);
			}
			else {
				var	colnumber = $('#colheader div', this.element).length,
					actualcol, i;

				if (this.options.useCheckboxes)
					i = 2;
				else
					i = 1;

				for ( ; i <= colnumber; i++) {
					actualcol = $('<div />').appendTo(newitem);
					actualcol.html( data[this._getTitleFromCol(i)] );
				}
			}

			// Verificar si el usuario desea atributos en el nuevo elemento
			if (typeof attr === 'object')
				newitem.attr(attr);

			this._updateproc();
		},

		// MODIFICAR ELEMENTO EXISTENTE
		'items.modify': function(currentnum, num, separator, newdata) {
			var elems = $('.listitem, .separator'),
				itemnum = elems.length,
				currentelem;
			if (currentnum > 0 && currentnum <= itemnum) {
				currentelem = elems.has(':nth-child(' + currentnum + ')');
				var isseparator = currentelem.is('.separator');
				if (isseparator != separator) {
					currentelem.addClass(separator ? 'separator' : 'listitem').removeClass(separator ? 'listitem' : 'separator');
					currentelem.children().remove();
				}	

				// Hacer las operaciones precisas para agregar el contenido necesario
				if (separator) {
					if (!currentelem.has('div').length)
						var innerdiv = $('<div />').appendTo(currentelem);
					else
						var innerdiv = $('div', currentelem);

					innerdiv.html(data);
				}

				// PENDIENTE: Agregar código para permitir la opción useCheckboxes
				else {
					var	colnumber = $('#colheader div').length,
						cellnum = currentelem.find('div').length,
						actualcol;

					for (var i = 1; i <= colnumber; i++) {
						if (colnumber == cellnum)
							actualcol = currentelem.find('div:nth-child(' + i + ')');
						else
							actualcol = $('<div></div>').appendTo(currentelem);
						actualcol.html( newdata[$('#colheader').find('div:nth-child(' + i + ')').html().trim()] );
					}
				}
				this._updateproc();
			}
		},

		// ELIMINAR ELEMENTO
		'items.remove': function(num) {
			var elems = $('.listitem, .separator'),
				itemnum = elems.length;
			if (num > 0 && num <= itemnum) {
				elems.has(':nth-child(' + num + ')').remove();
				_updateproc();
			}
		},

		// BORRAR LISTA
		'items.clear': function() {
			$('.listitem, .separator', this.element).remove();
		},

		// NUEVA COLUMNA
		'columns.new': function(name, width, num) {
			var colnumber = $("#colheader div", this.element).length;

			if (num != null && num <= colnumber + 1)
			{
				if (this.options.useCheckboxes)
					num++;

				$("<div data-width='" + width + "'>" + name + "</div>").insertAfter("#colheader div:nth-child(" + num + ")", this.element);
				$("#colheader", this.element).find("div:nth-child(" + num + ")");
			}
			else if (num == null || num >= colnumber)
			{
				$("#colheader", this.element).append("<div data-width='" + width + "'>" + name + "</div>");
				$("#colheader", this.element).find("div:nth-child(" + (colnumber + 1) + ")");
				
			}
			this._updateproc();
		},

		// *currentnum* indica el índice de la columna, de 1 a num_columnas + 1
		// *name*, *width* y *num* los parámetros a cambiar de la columna, null o undefined si no se desean cambios
		'columns.modify': function(currentnum, name, width, num) {
			// Variables a utilizar
			cols = $("colheader div").length;
			var col;
			// Buscar el div dentro de li#colheader que identifique a la columna deseada
			if (currentnum != null) // SI 'currentnum' no es un nulo
			{
				if (currentnum < cols && currentnum >= 0) //SI 'currentnum' tiene un valor coherente
				{
					col = $("#colheader").find("div:nth-child(" + currentnum + ")");

				}
			}
			// Reasignar el contenido del div en caso de que *name* sea distinto de null
			if (name != null)	//SI 'name' no es nulo
			{

			}
			// Reasignar el atributo data-width del div en caso de que *width* sea distinto de null
			// Extraer del DOM el div seleccionado y reinsertarlo en la posición necesaria SOLO 
			//     en caso de que *num* sea un número válido
			// Extraer y reinsertar los div de cada uno de los elementos de lista en la posición
			//     necesaria SOLO si el encabezado de columna fue reubicado
			// Utilizar _updateproc() para mostrar los cambios al usuario
		},

		// *num* el número de columna a eliminar, junto con los datos ya establecidos en los elementos
		'columns.remove': function(num) {
			if (num > 0 && num < this._getColumnsCount()) {
				if (this.options.useCheckboxes)
					num++;
				$('#colheader', this.element).children('div:nth-child(' + num + ')').remove();
				var collection = $('li:not(.separator, #colheader)', this.element);
				for (var i = 0; i < this._getAllItemsCount(); i++) {
					var current = collection.get(i);
					$(current).children('div:nth-child(' + num + ')').remove();
				}
			}
			else return;
		},

		// *enable* un booleano que indique si las casillas de verificación al lado de los elementos serán incluidas o excluidas
		checkboxes: function(enable) {
			this.options.useCheckboxes = enable;
			this._updateproc();
		}
	};

	// Punto de entrada del plugin para jQuery
	$.fn.listview = function(method) {

		var funcall = '', args = [];

		// Si el primer parámetro es una cadena, seguramente es el nombre del método
		if (typeof method === 'string' && method.charAt(0) != '_') {
			funcall = method;
			args = Array.prototype.slice.call(arguments, 1);
		}
		// De lo contrario es una inicialización del plugin
		else {
			funcall = 'init';
			args = Array.prototype.slice.call(arguments);
		}

		return this.each(function() {

			// Guardar los datos del plugin si no existen
			if ($(this).data('listview') == undefined) {
				$(this).data('listview', new ListView(this, args[0]));
			}

			//
			if (ListView.prototype[funcall] == undefined) {
				$.error('LISTVIEW: No existe método ' + funcall + 'en este plugin jQuery.');
				return;
			}

			$(this).data('listview')[funcall].apply($(this).data('listview'), args);
		});

	}
})(jQuery);