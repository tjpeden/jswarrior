var Sprite = Class.create({
  initialize: function(image) {
    this.image = image;
    this.state = 0;
  },
  draw: function(context, point) {
    if(this.sources) {
      var source = this.sources[this.state];
      context.drawImage(
        this.image,
        source.x,
        source.y,
        source.w,
        source.h,
        point.x,
        point.y,
        source.w,
        source.h
      );
    } else {
      context.drawImage(this.image, point.x, point.y);
    }
  },
  size: function() {
    var source = this.sources[this.state];
    return {width: source.w, height: source.h};
  }
});

Sprite.create = function(image, callback) {
  image = '/images/' + image;
  var img = new Image();
  var proxy = {
    draw: $.noop
  };
  
  img.onload = function() {
    var sprite = new Sprite(this);
    
    $.extend(proxy, sprite);
    
    if(callback) { callback.call(proxy); }
  };
  
  img.src = image;
  
  return proxy;
};

var Game = Class.create({
  initialize: function() {
    this.context = $('canvas')[0].getContext('2d');
    this.enemies = [];
  },
  launch: function() {
    var $this = this;
    this.player = (function() {
      var UserPlayer = eval( editor.getSession().getValue() );
      
      if( !(UserPlayer && 'update' in UserPlayer && typeof UserPlayer.update == 'function') ) {
        return new UserPlayer($this);
      }
    })();
  },
  run: function() {
    if(this.player !== undefined) {
      this.context.clearRect(0, 0, 320, 240);
      this.player.draw();
      this.interval = setInterval(this.loop.bind(this), 250);
    }
  },
  loop: function() {
    try {
      this.update();
      this.draw();
    } catch(e) {
      clearInterval(this.interval);
      if(e != $break) log(e);
    }
  },
  update: function() {
    this.player.update();
    this.enemies = this.enemies.select(function(enemy) { return enemy.update(); });
  },
  draw: function() {
    var $this = this;
    
    this.context.clearRect(0, 0, 320, 240);
    this.player.draw(this.context);
    this.enemies.each(function(enemy) { enemy.draw($this.context); });
  }
});

var Player = Class.create({
  initialize: function(manager) {
    var $this = this;
    this.manager = manager;
    this._sprite = Sprite.create('kidicarus_pit_sheet.png', function() {
      var size = this.size();
      $this._xPosition = (320 % size.width) / 2;
      $this._yPosition = (240 % size.height) / 2;
      $this.manager.run();
    });
    this._sprite.sources = [
      {x: 210, y: 0, w: 18, h: 28},
      {x: 180, y: 0, w: 18, h: 28}
    ];
  },
  draw: function() {
    this._sprite.draw(this.manager.context, {x: this._xPosition, y: this._yPosition});
  },
  move: function(direction) {
    this.nextMove = direction;
  },
  update: function() {
    this.act();
    
    var size = this._sprite.size();
    var $x = (320 % size.width) / 2;
    var $y = (240 % size.height) / 2;
    
    switch(this.nextMove) {
      case Player.NORTH:
        this._yPosition -= size.height;
        break;
      case Player.EAST:
        this._sprite.state = 0;
        this._xPosition += size.width;
        break;
      case Player.SOUTH:
        this._yPosition += size.height;
        break;
      case Player.WEST:
        this._sprite.state = 1;
        this._xPosition -= size.width;
        break;
    }
    this.nextMove = Player.STOP;
    
    this._xPosition = this._xPosition.clamp($x, 320-$x-size.width);
    this._yPosition = this._yPosition.clamp($y, 240-$y-size.height);
  }
});

$.extend(Player, {
  NORTH: {},
  EAST: {},
  SOUTH: {},
  WEST: {},
  STOP: {}
});

$(function(){
  window.editor = ace.edit('editor');
  
  editor.setShowPrintMargin(false);
  
  editor.getSession().setTabSize(2);
  editor.getSession().setUseSoftTabs(true);
  
  var JavaScriptMode = require('ace/mode/javascript').Mode;
  editor.getSession().setMode(new JavaScriptMode());
  
  editor.setTheme('ace/theme/twilight');
  
  editor.focus();
  
  $('#save').click(function(event) {
    localStorage['botcode'] = editor.getSession().getValue();
  });
  $('#load').click(function(event) {
    if(localStorage['botcode']) {
      editor.getSession().setValue(localStorage['botcode']);
    }
  });
  $('#run').click(function(event) {
    window.game = new Game();
    game.launch();
  });
});

/*
(function() {
  return Class.create(Player, {
    initialize: function($super, manager) {
      $super(manager);
      this.moves = 0;
    },
    act: function() {
      if(this.moves < 8) {
        this.move(Player.EAST);
      } else if(this.moves < 12) {
        this.move(Player.SOUTH);
      } else if(this.moves < 15) {
        this.move(Player.WEST);
      } else {
        throw $break;
      }
      this.moves++;
    }
  });
})();
*/
