(function(root, Atlas) {
  // Create app object to serve as namespace.
  var app = root.app || {};

  // Set app object to global scope.
  root.app = app;

  // Create model that will keep information if player plays first or second
  app.TurnModel = Atlas.Model.extend({
    defaults : {
      first : true
    },
    isFirst : function() {
      return this.get('first');
    }
  });

  // Create basic view
  app.BasicView = Atlas.View.extend({
    el : '#main_container'
  });

  // Create index view
  app.IndexView = app.BasicView.extend({
    template : Atlas.templateFactory('index')
  });

  // Create play view
  app.PlayView = app.BasicView.extend({
    template : Atlas.templateFactory('play'),
    initialize : function(options) {
      this.model = options.turnModel;
    },
    events : {
      'click #backPlay' : 'handleBackClick',
      'click #board' : 'handleBoardClick'
    },
    onRender : function() {
      var canvas = document.getElementById('board');
      var message = document.getElementById('message');
      var first = this.model.get('first');
      var playerChar = first ? 'X' : 'O';
      var aiChar = !first ? 'X' : 'O';
      var aiState = first ? 1 : 0;
      canvas.height = canvas.clientHeight;
      canvas.width = canvas.clientWidth;
      app.gameObj.initialize(canvas, message, playerChar, aiChar, aiState);
      app.gameObj.drawGrid();
      if (!first) {
        app.gameObj.aiMove();
      }
    },
    handleBoardClick : function(evt) {
      app.gameObj.handleClick(evt);
    }
  });

  // Create options view
  app.OptionsView = app.BasicView.extend({
    template : Atlas.templateFactory('options'),
    events : {
      'click #backOptions' : 'handleBackClick',
      'click #first' : 'handleFirstClick',
      'click #second' : 'handleSecondClick'
    },
    initialize : function(options) {
      this.model = options.turnModel;
      this.model.on('all', this.render, this);
    },
    serializeData :function() {
      var first = this.model.isFirst();
      return {isFirst : first};
    },
    handleFirstClick : function(evt) {
      this.model.set({
        first : true
      });
    },
    handleSecondClick : function(evt) {
      this.model.set({
        first : false
      });
    }
  });

  // Create instructions view
  app.InstructionsView = app.BasicView.extend({
    template : Atlas.templateFactory('instructions'),
    events : {
      'click #backInstructions' : 'handleBackClick'
    }
  });

  // Create about view
  app.AboutView = app.BasicView.extend({
    template : Atlas.templateFactory('about'),
    events : {
      'click #backAbout' : 'handleBackClick'
    }
  });

  // Create router
  var Router = Atlas.Router.extend({
    routes : {
      '' : 'index',
      'play' : 'play',
      'options' : 'options',
      'instructions' : 'instructions',
      'about' : 'about'
    },
    initialize : function(options) {
      var turnModel = new app.TurnModel;
      this.indexView = new app.IndexView();
      this.playView = new app.PlayView({
        turnModel : turnModel
      });
      this.optionsView = new app.OptionsView({
        turnModel : turnModel
      });
      this.instructionsView = new app.InstructionsView();
      this.aboutView = new app.AboutView();
    },
    index : function() {
      this.indexView.render();
    },
    play : function() {
      this.playView.render();
    },
    options : function() {
      this.optionsView.render();
    },
    instructions : function() {
      this.instructionsView.render();
    },
    about : function() {
      this.aboutView.render();
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
  root.addEventListener('resize', windowResizeHandler, false);

  Atlas.history.start();
}(window, window.Atlas));
