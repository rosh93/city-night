define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode');
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');
  var Timer = require('famous/utilities/Timer');

  // custom modules
  var Moment = require('src/lib/moment.js');

  function GameScoreboardView(params) {
    View.apply(this);

    for (var attrname in params) { 
      this[attrname] = params[attrname]; 
    }

    this.score = 0;
    this.timerMoment = Moment(this.timerLength || 300000);

    _setSurfaces.apply(this);

    _setTimer.apply(this);

    this.startTimer();

  }

  GameScoreboardView.prototype = Object.create(View.prototype);
  GameScoreboardView.prototype.constructor = GameScoreboardView;

  function _setTimer () {
    this.timerOkayToRun = false;
    Timer.setInterval(function() {
      if ( this.timerOkayToRun ) {
        if (this.timerMoment.valueOf() <= 0) {
          this.stopTimer()
        } else {
          this.timerMoment.subtract(1000);
          this.timerSurface.setContent(this.timerMoment.utc().format('mm:ss'));
        }
      }
    }.bind(this), 1000);
  }

  GameScoreboardView.prototype.startTimer = function() {
    this.timerOkayToRun = true;
  }

  GameScoreboardView.prototype.stopTimer = function() {
    this.timerOkayToRun = false;
  }

  GameScoreboardView.prototype.resetTimer = function() {
    this.timerMoment = Moment(this.timerLength || 300000);
  }

  GameScoreboardView.prototype.animateScoreChange = function(diff) {
    this.scoreAnimationSurface.setContent(String(diff));

    if ( diff > 0 ) {
      this.scoreAnimationSurface.setProperties({color: 'rgba(0,200,100,1)'});
    } else {
      this.scoreAnimationSurface.setProperties({color: 'rgba(200,0,50,1)'});
    }
    this.scoreAnimationTransitionable.set(150, {duration: 1000, curve: 'easeOut'}, function() {
      this.scoreAnimationTransitionable.set(0, {duration: 0, curve: 'easeIn'});
    }.bind(this));
  }

  GameScoreboardView.prototype.changeScore = function(diff) {
    this.score = (this.score + diff > 0 ) ? this.score + diff : 0;
    this.scoreSurface.setContent(String(this.score));
  }

  GameScoreboardView.prototype.resetScore = function() {
    this.score = 0;
    this.scoreSurface.setContent(String(this.score));
  }

  function _setSurfaces () {
    this.scoreSurface = new Surface({
      size: [50, 30],
      properties: {
        color: 'rgba(0,200,100,1)',
        textAlign: 'right',
        fontWeight: 800
      },
      content: String(this.score)
    });

    this.timerSurface = new Surface({
      size: [100, 30],
      properties: {
        color: 'rgba(200,0,50,1)',
        textAlign: 'right',
        fontWeight: 800
      },
      content: this.timerMoment.utc().format('mm:ss')
    });

    this.scoreAnimationSurface = new Surface({
      size: [50, 30],
      properties: {
        color: 'rgba(0,200,100,1)',
        textAlign: 'right',
        fontWeight: 800
      }
    });

    this.scoreAnimationModifier = new Modifier();

    this.scoreAnimationTransitionable = new Transitionable(0);

    this.scoreAnimationModifier.opacityFrom(function() {
      var val = this.scoreAnimationTransitionable.get();
      if ( val === 0 ) {
        return 0
      } else {
        return (1 - (val/100))
      }
    }.bind(this));

    this.scoreAnimationModifier.transformFrom(function() {
      return Transform.translate(80, this.scoreAnimationTransitionable.get(), 0)
    }.bind(this));

    this.scoreModifier = new Modifier({
      transform: Transform.translate(80,0,0)
    });

    this.add(this.scoreModifier).add(this.scoreSurface);

    this.add(this.scoreAnimationModifier).add(this.scoreAnimationSurface);

    this.add(this.timerSurface);
  }

  module.exports = GameScoreboardView;
});