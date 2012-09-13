/**
 * Plugin for customize default selects
 * @author Anton Vahmin (html.ru@gmail.com)
 * @copyright Clever Site Studio (http://clever-site.ru)
 * @version 1.0.2
 */

(function($){
	$.fn.extend({

		customSelect: function(options) {
			
			var defaults = {
				maxRows: 10,
				rowHeight: 20,
				template: false,
				callbacks: {
					selectOption: false,
					clickText: false
				}
			};
			
			var options = $.extend(defaults, options);
			
			return this.each(function() {
				
				if (!jQuery().jScrollPane) {
					if (console) {
						if (console.error) {
							console.error('jQuery plugin "jScrollPane" not installed');
						} else {
							console.log('jQuery plugin "jScrollPane" not installed');
						}
					}
					return false;
				}
				
				
				var disabled = false;
				var containerClass = 'customSelectContainer';
				var widthSet = false;

				var currentSelect = $(this);
				var id = currentSelect.attr('id');
				var name = currentSelect.attr('name');
				var selected = {
					text: false,
					value: currentSelect.val()
				}
				var selectOptions = [];
				var selectOptionsDOM = [];
				currentSelect.find('option').each(function(){
					if ($(this).is(':selected')) {
						selected.text = $(this).text();
					}
					selectOptions[selectOptions.length] = {
						text: $(this).text(),
						value: $(this).attr('value')
					};
				});
				if (currentSelect.attr('disabled')) {
					containerClass += ' customSelectContainer_state_disabled';
					disabled = true;
				}
				var customSelectContainer = $('<div class="'+containerClass+'" id="'+id+'Container" />');
				var customSelectInput = $('<input type="hidden" name="'+name+'" value="'+selected.value+'" id="'+id+'" class="customSelectValue" />');
				var customSelectText = $('<div class="customSelectText" />');
				var customSelectLeft = $('<div class="customSelectLeft" />');
				var customSelectRight = $('<div class="customSelectRight" />');
				var customSelectBack = $('<div class="customSelectBack" />');
				var customSelectArrow = $('<div class="customSelectArrow" />');
				var customSelectOptions = $('<div class="customSelectOptions" />');
				var customSelectScroll = $('<div class="customSelectScroll" />');
				for (i in selectOptions) {
					var option = $('<div class="customSelectOption" rel="'+selectOptions[i].value+'">'+selectOptions[i].text+'</div>');
					selectOptionsDOM.push(option[0]);
				}
				if (selectOptions.length < 1) {
					return false;
				}
				currentSelect.replaceWith(customSelectContainer);
				customSelectContainer.append(customSelectInput);
				customSelectContainer.append(customSelectText);
				customSelectText.append(customSelectLeft);
				customSelectLeft.append(customSelectRight);
				customSelectRight.append(customSelectBack);
				customSelectBack.append(customSelectArrow);
				if (options.template) {
					var textElement = $(options.template);
					customSelectArrow.append(textElement);
				} else {
					var textElement = customSelectArrow;
				}
				textElement.text(selected.text);
				customSelectContainer.append(customSelectOptions);
				customSelectOptions.append(customSelectScroll);
				for (i in selectOptionsDOM) {
					customSelectScroll.append(selectOptionsDOM[i]);
				}

				// Semen: Добавил проверку disable в селекте
				if (disabled === false) {
					
					$(customSelectText).bind('click', function(){
						if (!widthSet) {
							customSelectOptions.width(customSelectContainer.width());
							widthSet = true;
						}

						if (options.callbacks.clickText) {
							options.callbacks.clickText($(this));
						}
						
						customSelectOptions.toggle();
					});
					
					$(selectOptionsDOM).bind('click', function(){
						if (options.callbacks.selectOption) {
							options.callbacks.selectOption($(this));
						}
						customSelectInput.val($(this).attr('rel'));
						textElement.text($(this).text());
						customSelectOptions.hide();
						customSelectInput.change();
					});	
				}
				

				$(selectOptionsDOM).bind('mouseover', function(){
					$(this).addClass('hover');
				});
				$(selectOptionsDOM).bind('mouseleave', function(){
					$(this).removeClass('hover');
				});
				if (options.maxRows && selectOptions.length > options.maxRows) {
					var height = options.maxRows * options.rowHeight;
					customSelectScroll.css('height', height+'px');
					customSelectScroll.jScrollPane();
				}
				customSelectOptions.hide();
				$(document).click(function(){
					customSelectOptions.hide();
				});
				customSelectContainer.click(function(event){
					event.stopPropagation();
				});
				$(document).keyup(function(event){
					if (event.keyCode == 27) {
						customSelectOptions.hide();
					}
				});
			});
		}
	});

})(jQuery);