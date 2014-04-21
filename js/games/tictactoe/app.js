(function($) {
    // Create app object to serve as namespace.
    var app = window.app || {};

    // Set app object to global scope.
    window.app = app;

    // Template helper function
    app.template = function(name) {
        return Handlebars.compile($('#' + name + '-template').html());
    };

    // Create model that will keep information if player plays first or second
    app.TurnModel = Backbone.Model.extend({
        defaults : {
            first : true
        }
    });

    // Create basic view
    app.BasicView = Backbone.View.extend({
        el : '#main_container',
        render : function() {
            this.$el.html(this.template());
        },
    });

    // Create index view
    app.IndexView = app.BasicView.extend({
        template : app.template('index')
    });

    // Create play view
    app.PlayView = app.BasicView.extend({
        template : app.template('play'),
        initialize : function(options) {
            this.turnModel = options.turnModel;
        },
        events : {
            'click #backPlay' : 'handleBackClick',
            'click #board' : 'handleBoardClick'
        },
        render : function() {
            this.$el.html(this.template());
            this.initGame();
        },
        initGame : function() {
            var canvas = document.getElementById('board');
            var message = document.getElementById('message');
            var first = this.turnModel.get('first');
            var playerChar = first ? 'X' : 'O';
            var aiChar = !first ? 'X' : 'O';
            var aiState = first ? 1 : 0;
            canvas.height = canvas.clientHeight;
            canvas.width = canvas.clientWidth;
            app.gameObj
                    .initialize(canvas, message, playerChar, aiChar, aiState);
            app.gameObj.drawGrid();
            if (!first) {
                app.gameObj.aiMove();
            }
        },
        handleBoardClick : function(evt) {
            app.gameObj.handleClick(evt);
        },
        handleBackClick : function(evt) {
            window.history.back();
        }
    });

    // Create options view
    app.OptionsView = app.BasicView.extend({
        template : app.template('options'),
        events : {
            'click #backOptions' : 'handleBackClick',
            'click #first' : 'handleFirstClick',
            'click #second' : 'handleSecondClick'
        },
        initialize : function(options) {
            this.turnModel = options.turnModel;
            this.turnModel.on('all', this.render, this);
        },
        render : function() {
            this.$el.html(this.template(this));
        },
        isFirst : function() {
            return this.turnModel.get('first');
        },
        handleBackClick : function(evt) {
            window.history.back();
        },
        handleFirstClick : function(evt) {
            this.turnModel.set({
                first : true
            });
        },
        handleSecondClick : function(evt) {
            this.turnModel.set({
                first : false
            });
        }

    });

    // Create instructions view
    app.InstructionsView = app.BasicView.extend({
        template : app.template('instructions'),
        events : {
            'click #backInstructions' : 'handleBackClick'
        },
        handleBackClick : function(evt) {
            window.history.back();
        }
    });

    // Create about view
    app.AboutView = app.BasicView.extend({
        template : app.template('about'),
        events : {
            'click #backAbout' : 'handleBackClick'
        },
        handleBackClick : function(evt) {
            window.history.back();
        }
    });

    // Create router
    var Router = Backbone.Router.extend({
        routes : {
            '' : 'index',
            'play' : 'play',
            'options' : 'options',
            'instructions' : 'instructions',
            'about' : 'about'
        },
        initialize : function(options) {
            var turnModel = new app.TurnModel;
            this.index = new app.IndexView();
            this.play = new app.PlayView({
                turnModel : turnModel
            });
            this.options = new app.OptionsView({
                turnModel : turnModel
            });
            this.instructions = new app.InstructionsView();
            this.about = new app.AboutView();
        },
        index : function() {
            this.index.render();
        },
        play : function() {
            this.play.render();
        },
        options : function() {
            this.options.render();
        },
        instructions : function() {
            this.instructions.render();
        },
        about : function() {
            this.about.render();
        }

    });

    app.router = new Router();

    // create handler function that will process window resize
    function windowResizeHandler() {
        var canvas = document.getElementById('board');
        if (canvas !== null) {
            app.gameObj.handleResize();
        }
    }

    // bind handlers to actions
    window.addEventListener('resize', windowResizeHandler, false);

    Backbone.history.start();
}(jQuery));
