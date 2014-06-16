/*!
 * Plugin for customize default selects
 * @author Anton Vahmin (html.ru@gmail.com)
 * @version 3.0.0
 */

$.widget('custom.customSelect', {
    options: {
        tagName: 'div',
        closeOthers: true,
        copyClasses: true,
        copyData: true,
        wrapIn: [],
        optionTemplate: null,

        select: null,
        click: null,
        open: null,
        close: null
    },

    _create: function() {
        this.isDisabled = false;
        var containerClass = 'customSelectContainer';
        if (this.element.attr('disabled')) {
            containerClass += ' customSelectContainer_state_disabled';
            this.isDisabled = true;
        }

        if (this.element.attr('class')) {
            containerClass += ' ' + this.element.attr('class');
        }

        var itemsList = [];
        var selectedIndex = 0;
        this.element.find('option').each(function(index) {
            var item = {
                text: $(this).text(),
                value: $(this).attr('value')
            };
            var data = $(this).data();
            for (var i in data) {
                item[i] = data[i];
            }
            itemsList.push(item);
            if ($(this).is(':selected')) {
                selectedIndex = index;
            }
        });
        this.itemsList = itemsList;
        this.selectedIndex = selectedIndex;

        this.domContainer = $('<' + this.options.tagName + ' class="' + containerClass + '" />');
        this.element.hide();
        this.element.after(this.domContainer);

        this.domText = $('<' + this.options.tagName + ' class="customSelectText" />');
        this.domContainer.append(this.domText);
        for (i in this.options.wrapIn) {
            var wrapper = $('<' + this.options.tagName + ' class="customSelect' +
                this.options.wrapIn[i] + '" />');
            this.domText.append(wrapper);
            this.domText = wrapper;
        }

        this.domOptions = $('<' + this.options.tagName + ' class="customSelectOptions" />');
        this.domScroll = $('<' + this.options.tagName + ' class="customSelectScroll" />');
        this.domOptions.append(this.domScroll);
        this.domContainer.append(this.domOptions);


        this._appendItems();
        this.domOptions.css('width', this.domContainer.width());
        this.domOptions.hide();

        var _this = this;
        this.domText.bind('click', function() {
            if (_this.isDisabled === false) {
                _this._trigger('click', this);
                _this.toggle();
            }
        });
        this.domScroll.on('mousewheel', function() {
            this.scrollApi.scrollByY(event.deltaY);
        });
    },

    _appendItems: function() {
        var _this = this;
        this.domItems = [];
        this.domText.unbind('click');
//        $(document).off(this.domItems);
        for (var i = 0; i < this.itemsList.length; i++) {
            var selected = '';
            if (i == this.selectedIndex) {
                selected = ' selected';
                $(this).val(this.itemsList[i].value);
                this.domText.html(this.itemsList[i].text);
            }
            var item = $('<' + this.options.tagName + ' class="customSelectOption' + selected + '" data-value="' +
                this.itemsList[i].value + '">' + this.itemsList[i].text + '</' + this.options.tagName + '>');
            if (this.options.optionTemplate) {
                item = this.options.optionTemplate.call(this, item, this.itemsList[i]);
            }

            item.click(function () {
                if (_this.isDisabled === false) {
                    _this._trigger('select', this);
                    $(_this).val($(this).data('value'));
                    var text = ($(this).data('text') != '') ? $(this).data('text') : $(this).text();
                    _this.domText.html(text);
                    _this.close();
                }
            });
            this.domScroll.append(item);
            this.domItems.push(item);
        }
        this.domScroll.jScrollPane();
        this.scrollApi = this.domScroll.data('jsp');

        $(document).click(function() {
            _this.close();
        });
        this.domContainer.click(function(event) {
            event.stopPropagation();
        });
        $(document).keyup(function(event) {
            if (event.keyCode == 27) {
                _this.close();
            }
        });
    },

    setItems: function(items) {
        var data_items = [];
        for (i in items) {
            var topush = (typeof items[i] == 'object') ? {
                text: items[i][1],
                value: items[i][0]
            } : {
                text: items[i],
                value: items[i]
            };
            data_items.push(topush);
        }
        this.itemsList = data_items;
        this._appendItems();
    },

    open: function() {
        this.domContainer.addClass('customSelectOpen');
        this._trigger('open');
        if (this.options.closeOthers) {
            $('.customSelectOptions').hide();
        }
        this.domOptions.show();
    },

    close: function() {
        this.domContainer.removeClass('customSelectOpen');
        this._trigger('close', this);
        this.domOptions.hide();
    },

    toggle: function() {
        if (this.domOptions.is(':visible')) {
            this.close();
        } else {
            this.open();
        }
    }
});
