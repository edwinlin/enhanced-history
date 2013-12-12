class BH.Views.Cache
  constructor: (@options) ->
    @settings = @options.settings
    @state = @options.state
    @expire()

  expire: ->
    @cache =
      weeks: {}
      days: {}
      tags: {}

  tagsView: ->
    if !@cache.allTags
      tags = new BH.Collections.Tags []

      @cache.allTags = new BH.Views.TagsView
        collection: tags
        state: @state

      @insert @cache.allTags.render().el

    @cache.allTags

  devicesView: ->
    if !@cache.devices
      devices = new BH.Collections.Devices()

      @cache.devices = new BH.Views.DevicesView
        collection: devices
        state: @state

      @insert @cache.devices.render().el

    @cache.devices

  tagView: (id) ->
    if !@cache.tags[id]
      tag = new BH.Models.Tag(name: id)

      @cache.tags[id] = new BH.Views.TagView
        name: id
        model: tag
        state: @state
      @insert @cache.tags[id].render().el

    @cache.tags[id]

  weekView: (id) ->
    if !@cache.weeks[id]
      week = new BH.Models.Week(
        {date: moment(new Date(id))},
        {settings: @settings}
      )
      history = new BH.Models.WeekHistory(week.toHistory())

      @cache.weeks[id] = new BH.Views.WeekView
        model: week
        history: history

      @insert @cache.weeks[id].render().el

    @cache.weeks[id]

  dayView: (id) ->
    if !@cache.days[id]
      day =     new BH.Models.Day {date: moment(new Date(id))}, settings: @settings
      history = new BH.Models.DayHistory day.toHistory(), settings: @settings

      @cache.days[id] = new BH.Views.DayView
        model: day
        history: history

      @insert @cache.days[id].render().el

    @cache.days[id]

  searchView: (options)->
    if !@cache.search || options.expired
      search =  new BH.Models.Search()
      history = new BH.Models.SearchHistory(search.toHistory())

      @cache.search = new BH.Views.SearchView
        model: search
        history: history

      @insert @cache.search.render().el
    @cache.search

  settingsView: ->
    if !@cache.settings
      @cache.settings = new BH.Views.SettingsView
        model: @settings
        state: @state
      @insert @cache.settings.render().el

    @cache.settings

  insert: (html) ->
    $('.mainview').append html

