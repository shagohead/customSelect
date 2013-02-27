/**
 * Plugin for customize default selects
 * @author Anton Vahmin (html.ru@gmail.com)
 * @copyright Clever Site Studio (http://clever-site.ru)
 * @version 2.4
 */

function clone(obj) {
    var target = {};
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            target[i] = obj[i];
        }
    }
    return target;
}

(function($){

    var methods = {
        init: function(settings){
            settings = $.extend({
                element: 'div',
                maxRows: false,
                template: false,
                closeOthers: true,
                copyClasses: true,
                copyData: true,
                callbacks: {
                    initDefaultOption: false,
                    selectOption: false,
                    afterSelectOption: false,
                    clickText: false
                }
            }, settings);

            return this.each(function(index, element){
                var object = this;
                var data = $(object).data();
                data.settings = clone(settings);
                data.settings.callbacks = clone(settings.callbacks);
                data.dom = {};

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

                var currentSelect = $(this);
                var container_class = 'customSelectContainer';
                data.disabled = false;
                data.name = currentSelect.attr('name');

                if (currentSelect.attr('disabled')) {
                    container_class += ' customSelectContainer_state_disabled';
                    data.disabled = true;
                }

                if (currentSelect.attr('class')) {
                    container_class += ' '+currentSelect.attr('class');
                }

                data.items = [];
                data.dom.items = [];
                data.selected = {};

                currentSelect.find('option').each(function(){
                    if ($(this).is(':selected')) {
                        data.selected = {
                            text: $(this).text(),
                            value: $(this).attr('value')
                        };
                    }
                    data.items.push({
                        text: $(this).text(),
                        value: $(this).attr('value')
                    });
                });

                data.dom.text = $('<'+data.settings.element+' class="customSelectText" />');
                data.dom.left = $('<'+data.settings.element+' class="customSelectLeft" />');
                data.dom.right = $('<'+data.settings.element+' class="customSelectRight" />');
                data.dom.back = $('<'+data.settings.element+' class="customSelectBack" />');
                data.dom.arrow = $('<'+data.settings.element+' class="customSelectArrow" />');
                data.dom.scroll = $('<'+data.settings.element+' class="customSelectScroll" />');
                data.dom.options = $('<'+data.settings.element+' class="customSelectOptions" />');
                data.dom.container = $('<'+data.settings.element+' class="'+container_class+'" />');
                data.dom.input = $('<input type="hidden" name="'+data.name+'" value="" class="customSelectValue" />');

                currentSelect.hide();
                currentSelect.removeAttr('name');
                currentSelect.after(data.dom.container);
                data.dom.container.append(data.dom.input);
                data.dom.container.append(data.dom.text);
                data.dom.text.append(data.dom.left);
                data.dom.left.append(data.dom.right);
                data.dom.right.append(data.dom.back);
                data.dom.back.append(data.dom.arrow);

                if (data.settings.template) {
                    data.dom.textElement = $(data.settings.template);
                    data.dom.arrow.append(data.dom.textElement);
                } else {
                    data.dom.textElement = data.dom.arrow;
                }

                data.dom.container.append(data.dom.options);
                data.dom.options.css('width', data.dom.container.width());
                data.dom.options.append(data.dom.scroll);

                $(object).data(data);
                methods.setItems.call(object);
                methods.applyEvents.call(object);
                data.dom.options.hide();
            });
        },

        data: function() {
            return $(this).data();
        },

        setOption: function() {
            var data = $(this).data();
            return data.settings[arguments[0]] = arguments[1];
        },

        setItems: function() {
            var data = $(this).data();

            data.index = 0;
            data.selected = data.items[0];
            data.dom.input.val(data.selected.value);
            data.dom.textElement.text(data.selected.text);
            data.dom.items = [];

            for (var i = 0; i < data.items.length; i++) {
                var option = $('<'+data.settings.element+' class="customSelectOption" rel="'+data.items[i].value+'">'+data.items[i].text+'</'+data.settings.element+'>');
                data.dom.items.push(option[0]);
            }

            data.dom.scroll.html('');
            for (var i = 0; i < data.dom.items.length; i++) {
                data.dom.scroll.append(data.dom.items[i]);
            }

            if (data.settings.maxRows !== false && data.items.length > data.settings.maxRows) {
                data.dom.scroll.css('height', (data.dom.scroll.children(':first-child').height() * data.settings.maxRows)+'px');
                data.dom.scroll.jScrollPane();
            }
            $(this).data(data);
        },

        setItemsJSON: function(items){
            var data_items = [];
            for (i in items) {
                if (typeof items[i] == 'object') {
                    topush = items[i];
                } else {
                    topush = {
                        text: items[i],
                        value: items[i]
                    };
                }
                data_items.push(topush);
            }
            $(this).data('items', data_items);
            methods.setItems.call(this);
            methods.applyEvents.call(this);
        },

        applyEvents: function(){
            var object = this;
            var data = $(this).data();

            $(data.dom.text).unbind('click');
            $(document).off(data.dom.items);

            if (data.disabled === false) {
                $(data.dom.text).bind('click', function(){
                    if (data.settings.callbacks.clickText) {
                        data.settings.callbacks.clickText($(this));
                    }
                    if (data.dom.options.is(':visible')) {
                        data.dom.options.hide();
                    } else {
                        if (data.settings.closeOthers) {
                            $('.customSelectOptions').hide();
                        }
                        data.dom.options.show();
                    }
                });
                
                $(data.dom.items).on('click', function(){
                    data.index = $(this).index();
                    if (data.settings.callbacks.selectOption) {
                        data.settings.callbacks.selectOption($(this));
                    }
                    data.dom.input.val($(this).attr('rel'));
                    data.dom.textElement.text($(this).text());
                    data.dom.options.hide();
                    data.dom.input.change();
                    $(object).data(data);
                }); 
            }

            $(data.dom.items).on('mouseover', function(){
                $(this).addClass('hover');
            });
            $(data.dom.items).on('mouseleave', function(){
                $(this).removeClass('hover');
            });

            $(document).click(function(){
                data.dom.options.hide();
            });
            data.dom.container.click(function(event){
                event.stopPropagation();
            });
            $(document).keyup(function(event){
                if (event.keyCode == 27) {
                    data.dom.options.hide();
                }
            });
        }
    };

    $.fn.customSelect = function(request){
        if (methods[request]) {
            return methods[request].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof request === 'object' || !request) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+request+' does not exist on jQuery.tooltip');
        }
    };

})(jQuery);