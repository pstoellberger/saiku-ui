/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
 
/**
 * The base class for all modal dialogs
 */
var Modal = Backbone.View.extend({
    tagName: "div",
    className: "dialog",
    type: "modal",
    message: "Put content here",
    
    options: {
        autoOpen: false,
        modal: true,
        title: "Modal dialog",
        resizable: false,
        draggable: true
    },
    
    events: {
        'click a': 'call',
        'keydown .ui-dialog' : 'onKeyDown'
    },
    
    buttons: [
        { text: "OK", method: "close" }
    ],
    
    template: function() {
        return _.template("<div class='dialog_icon'></div>" +
                "<div class='dialog_body'><%= message %></div>" +
        		"<div class='dialog_footer'>" +
            "<% _.each(buttons, function(button) { %>" +
                "<a class='form_button i18n' href='#<%= button.method %>'>&nbsp;<%= button.text %>&nbsp;</a>" +
            "<% }); %>" +
            "</div>")(this);
    },
    
    initialize: function(args) {
        _.extend(this, args);
        _.bindAll(this, "call", "onKeyDown");
        _.extend(this, Backbone.Events);

    },
    
    render: function() {
        $(this.el).html(this.template())
            .addClass("dialog_" + this.type)
            .dialog(this.options);

        var uiDialogTitle = $('.ui-dialog-title'); 
        uiDialogTitle.html(this.options.title);
        uiDialogTitle.addClass('i18n');
        Saiku.i18n.translate();

        return this;
    },

     onKeyDown: function(evt, target) {
         if (evt && evt.keyCode && evt.keyCode === $.ui.keyCode.ESCAPE) {
            $(this.el).dialog('destroy').remove();
            $(this.el).remove();
        }
    },
    
    call: function(event) {
        // Determine callback
        var callback = event.target.hash.replace('#', '');
        
        // Attempt to call callback
        if (! $(event.target).hasClass('disabled_toolbar') && this[callback]) {
            this[callback](event);
        }
        
        return false;
    },
    
    open: function() {
        $(this.el).on('keydown', this.onKeyDown.bind(this));
        $(this.el).dialog('open');
        this.trigger('open', { modal: this });
        return this;
    },
    
    close: function() {
        $(this.el).dialog('destroy').remove();
        $(this.el).remove();
        return false;
    }
});

var SimpleModal = Modal.extend({

    type: "filter",
    closeText: "Export",

    events: {
        'submit form': 'save',
        'click .dialog_footer a' : 'call',
        'keydown' : 'onKeyDown'
    },

    onKeyDown: function(evt) {
         if (evt && evt.keyCode && evt.keyCode === $.ui.keyCode.ESCAPE) {
            $(this.el).dialog('destroy').remove();
            $(this.el).remove();
        }
    },

    buttons: [
        { text: "OK", method: "close" }
    ],

    message: "Your message...",

    initialize: function(args) {
        this.options['title'] = args.title;
        this.message = args.message;
        if (args.buttons) {
            this.buttons = args.buttons;
        }
        if (args.type) {
            this.type = args.type;
        }
        if(isIE && isIE < 9) {
            $(this.el).find('form').on('submit', this.save);
        }
    },

    destroy: function() {
        $(this.el).dialog('destroy').remove();
        $(this.el).remove();
    }
});
