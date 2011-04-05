(function($) {
  function ImageProxy() {
    return {
      draw: $.noop,
      fill: $.noop,
      frame: $.noop,
      update: $.noop,
      width: null,
      height: null
    };
  }
  
  var Sprite = Class.create({
    initialize: function(image, source, width, height) {
      this.image = image;
      this.source = source instanceof Object ? source : {};
      this.source.x = this.source.x || 0;
      this.source.y = this.source.y || 0;
      this.width = width || this.image.width;
      this.height = height || this.image.height
    },
    
    draw: function(context, point) {
      context.drawImage(
        this.image,
        this.source.x,
        this.source.y,
        this.width,
        this.height,
        point.x,
        point.y,
        this.width,
        this.height
      );
    },
    
    fill: function(context, point, width, height, repeat) {
      repeat = repeat || 'repeat';
      var pattern = context.createPattern(image, repeat);
      context.fillColor(pattern);
      context.fillRect(point.x, point.y, width, height);
    }
  });
  
  Sprite.load = function(url, callback) {
    var img = new Image();
    var proxy = ImageProxy();
    
    img.onload = function() {
      var tile = new Sprite(this);
      
      $.extend(proxy, tile);
      
      if(callback) callback(proxy);
    };
    
    img.src = url;
    
    return proxy;
  };
  
  var spriteImagePath = "images/";
  
  window.Sprite = function(name, callback) {
    return Sprite.load(spriteImagePath + name + '.png', callback);
  };
  window.Sprite.EMPTY = ImageProxy();
  window.Sprite.load = Sprite.load;
})(jQuery);