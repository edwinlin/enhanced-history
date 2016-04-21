(function() {
	var todayVisible = false;
  var TimelineView = BH.Views.MainView.extend({
    template: 'timeline.html',

    events: {
      'click a.date': 'onDateClicked',
      'click a.next': 'onNextClicked',
      'click a.previous': 'onPreviousClicked',
      'click ol.today': 'onTodayClicked'      
    },

    initialize: function() {
      this.state = new Backbone.Model({
        startDate: moment(new Date()).startOf('day').toDate()
      });

      this.state.on('change:startDate', this.onStartDateChanged, this);
    },

    render: function() {
    	if ( $('.today').is(":visible")  )
    		todayVisible = true; 
    		    	
      this.$el.html('');

      var timelinePresenter = new BH.Presenters.Timeline(this.model.toJSON());
      var template = BH.Lib.Template.fetch(this.template);
      var properties = timelinePresenter.timeline(this.state.get('startDate'));
      this.$el.append(Mustache.to_html(template, properties));

      todayVisible && $('.today').show(); 

      return this;
    },

    onStartDateChanged: function() {
      this.render();
    },

    onDateClicked: function(ev) {
      this.$('a').removeClass('selected');
      $(ev.currentTarget).addClass('selected');
    },

    onTodayClicked: function(ev) {
      if(!$(ev.currentTarget).hasClass('disabled')) {
        var date = moment();
        this.state.set({startDate: date.startOf('day').toDate()});
      }
      $('.today').hide(); 
      todayVisible = false;
    }, 

    onNextClicked: function(ev) {
      ev.preventDefault();

      if(!$(ev.currentTarget).hasClass('disabled')) {
        var date = moment(this.state.get('startDate')).add('days', 7);
        this.state.set({startDate: date.startOf('day').toDate()});
      }
      $('.today').show();      
    },

    onPreviousClicked: function(ev) {
      ev.preventDefault();

      if(!$(ev.currentTarget).hasClass('disabled')) {
        var date = moment(this.state.get('startDate')).subtract('days', 7);
        this.state.set({startDate: date.startOf('day').toDate()});
      }
      $('.today').show();      
    }
  });

  BH.Views.TimelineView = TimelineView;
})();
