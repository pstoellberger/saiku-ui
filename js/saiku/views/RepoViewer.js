var RepoViewer = Backbone.View.extend({

    events: {
        'click': 'select_root_folder', /* select root folder */
        'click .query': 'select_name',
        'click li.folder': 'toggle_folder',
        'keyup .search_file' : 'search_file',
        'click .cancel_search' : 'cancel_search',
        'click .export_btn' : 'export_zip', 
        'change .file' : 'select_file'
    },
    
    initialize: function(args) {
        // Append events
        var self = this;
        var name = "";
        this.message = '<div style="height:25px; line-height:25px;"><b><span class="i18n">Search:</span></b> &nbsp;'
                + ' <span class="search"><input type="text" class="search_file"></input><span class="cancel_search"></span></span></div>'
                + "<div class='RepositoryObjects'>Loading....</div><br><b><div class='query_name'></div></b>"
                + "<br><br>";

        $(this.el).html(this.message);

        this.selected_folder = null;

        // Initialize repository
        this.repository = new Repository({}, { dialog: this });

            var height = ( $( "body" ).height() / 2 ) + ( $( "body" ).height() / 6 );
            if( height > 420 ) {
                height = 420;
            }
            $(this.el).find('.RepositoryObjects').height( height );

            self.repository.fetch( );


        // Maintain `this`
        _.bindAll( this, "toggle_folder", "select_name", "populate" , "cancel_search",  "select_folder", "select_file");

    
    },

    populate: function( repository ) {
        var self = this;
        $( this.el ).find( '.RepositoryObjects' ).html(
            _.template( $( '#template-repository-objects' ).html( ) )( {
                repoObjects: repository
            } ) 
        );

        $('.RepositoryObjects li.query').draggable({
              scroll: 'false', helper: "clone"
        });


        $('.query_droppable').droppable({
                    accept: '.query',
                    hoverClass: "drop-hover",
                    drop: function( event, ui ) {
                        var file = $(ui.helper).find('a').attr('href').replace('#','');
                        var target = $(event.target);
                        myClient.execute({
                            file: file,
                            htmlObject: target
                        });


                    }
        });

        self.queries = {};
        function getQueries( entries ) {
            _.forEach( entries, function( entry ) {
                self.queries[ entry.path ] = entry;
                if( entry.type === 'FOLDER' ) {
                    getQueries( entry.repoObjects );
                }
            } );
        }
        getQueries( repository );
    },

    select_root_folder: function( event ) {
        var isNameInputField = $( event.target ).attr( 'name' ) === 'name';
        if( !isNameInputField ) {
            this.unselect_current_selected_folder( );
        }
    },

    toggle_folder: function( event ) {
        var $target = $( event.currentTarget );
        this.unselect_current_selected_folder( );
        $target.children('.folder_row').addClass( 'selected' );
        var $queries = $target.children( '.folder_content' );
        var isClosed = $target.children( '.folder_row' ).find('.sprite').hasClass( 'collapsed' );
        if( isClosed ) {
            $target.children( '.folder_row' ).find('.sprite').removeClass( 'collapsed' );
            $queries.removeClass( 'hide' );
        } else {
            $target.children( '.folder_row' ).find('.sprite').addClass( 'collapsed' );
            $queries.addClass( 'hide' );
        }

        this.select_folder();
        return false;
    },

    select_name: function( event ) {
        var $currentTarget = $( event.currentTarget );
        this.unselect_current_selected_folder( );
        $currentTarget.parent( ).parent( ).has( '.folder' ).children('.folder_row').addClass( 'selected' );
        var name = $currentTarget.find( 'a' ).attr('href');
        name = name.replace('#','');
        this.select_folder();
        return false;
    },

    unselect_current_selected_folder: function( ) {
        $( this.el ).find( '.selected' ).removeClass( 'selected' );
    },

    // XXX - duplicaten from OpenQuery
    search_file: function(event) {
        var filter = $(this.el).find('.search_file').val().toLowerCase();
        var isEmpty = (typeof filter == "undefined" || filter == "" || filter == null);
        if (isEmpty || event.which == 27 || event.which == 9) {
            this.cancel_search();
        } else {
            if ($(this.el).find('.search_file').val()) {
                $(this.el).find('.cancel_search').show();
            } else {
                $(this.el).find('.cancel_search').hide();
            }
            $(this.el).find('li.query').removeClass('hide')
            $(this.el).find('li.query a').filter(function (index) { 
                return $(this).text().toLowerCase().indexOf(filter) == -1; 
            }).parent().addClass('hide');
            $(this.el).find('li.folder').addClass('hide');
            $(this.el).find('li.query').not('.hide').parents('li.folder').removeClass('hide');
            //$(this.el).find( 'li.folder .folder_content').not(':has(.query:visible)').parent().addClass('hide');

            //not(':contains("' + filter + '")').parent().hide();
            $(this.el).find( 'li.folder .folder_row' ).find('.sprite').removeClass( 'collapsed' );
            $(this.el).find( 'li.folder .folder_content' ).removeClass('hide');
        }
        return false;
    },
    cancel_search: function(event) {
        $(this.el).find('input.search_file').val('');
        $(this.el).find('.cancel_search').hide();
        $(this.el).find('li.query, li.folder').removeClass('hide');
        $(this.el).find( '.folder_row' ).find('.sprite').addClass( 'collapsed' );
        $(this.el).find( 'li.folder .folder_content' ).addClass('hide');
        $(this.el).find('.search_file').val('').focus();
        $(this.el).find('.cancel_search').hide();

    },


    select_folder: function() {
        var foldersSelected = $( this.el ).find( '.selected' );
        var file = foldersSelected.length > 0 ? foldersSelected.children('a').attr('href').replace('#','') : null;
        if (typeof file != "undefined" && file != null && file != "") {
            this.selected_folder = file;
            $(this.el).find('.export_btn, .import_btn').removeAttr('disabled');
            this.select_file();
        } else {
            $(this.el).find('.import_btn, .export_btn').attr('disabled', 'true');
        }        

    },

    select_file: function() {
            var form = $('#importForm');
            var filename = form.find('.file').val();
            if (typeof filename != "undefined" && filename != "" && filename != null && this.selected_folder != null) {
                $(this.el).find('.import_btn').removeAttr('disabled');
            } else {
                $(this.el).find('.import_btn').attr('disabled', 'true');
            }
    }


});
