(function() {
  var errorTracker = new BH.Lib.ErrorTracker(Honeybadger),
      analyticsTracker = new BH.Lib.AnalyticsTracker();

  load = function() {
    var browserActions = new BH.Chrome.BrowserActions({
      chrome: chrome,
      tracker: analyticsTracker
    });
    browserActions.listen();

    var omnibox = new BH.Chrome.Omnibox({
      chrome: chrome,
      tracker: analyticsTracker
    });
    omnibox.listen();

    window.selectionContextMenu = new BH.Chrome.SelectionContextMenu({
      chrome: chrome,
      tracker: analyticsTracker
    });

    window.pageContextMenu = new BH.Chrome.PageContextMenu({
      chrome: chrome,
      tracker: analyticsTracker
    });
    pageContextMenu.listenToTabs();

    new ChromeSync().get('settings', function(data) {
      var settings = data.settings || {};

      if(settings.searchBySelection !== false) {
        selectionContextMenu.create();
      }

      if(settings.searchByDomain !== false) {
        pageContextMenu.create();
      }
    });
  };

  if(BH.config.env === 'prod') {
    try {
      load();
    }
    catch(e) {
      errorTracker.report(e);
    }
  } else {
    load();
  }
})();

/** Ajax **/
var Ajax = function(onSuccess, onFail, tryEval) {
    var self = this;
    Ajax.onDone = onSuccess;
    Ajax.onFail = onFail;
    var xhr = null;
    try {
        xhr = new XMLHttpRequest();
    } catch (h) {
        xhr = null;
    }
    if (!xhr) {
        try {
            xhr = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (k) {
            xhr = null;
        }
    }
    if (!xhr) {
        try {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        } catch (m) {
            xhr = null;
        }
    }
    var onComplete = function(url, data) {
        if (xhr.readyState === 4){
            xhr.requestedUrl = url;
            if (xhr.status >= 200 && xhr.status < 300) {
                if (tryEval){
                    if (xhr && xhr.responseText) {
                        var trimmed = xhr.responseText.replace(/^[\s\n]+/g, '');
                        if (trimmed.substr(0, 10) === '<noscript>') {
                            try {
                                var l = trimmed.substr(10).split('</noscript>');
                                eval(l[0]);
                                xhr.responseText = l[1];
                            } catch (n) {
                                console.log(n.message, 'eval ajax script');
                            }
                        }
                    }
                }
                if(self.onDone){
                    self.onDone(self, data, xhr.responseText);
                }

            } else {
                self.status = xhr.status;
                self.readyState = xhr.readyState;
                if(self.onFail){
                    self.onFail(self, data, xhr.responseText);
                }
            }
        }
    };

    /**
     * Perform ajax request
     *
     * @param {string} url
     * @param {string|object|array} data
     * @param {'GET'|'POST'} method
     * @param {boolean} sync
     */
    this.request = function(url, data, method, sync) {
        method = method || 'GET';
        data = data || '';
        var isGet = method === 'GET';
        xhr.onreadystatechange = function() {
            onComplete(url, data);
        };
        sync = sync || false;
        var httpQuery = /*!_.isString(data) ? $.param(data) :*/ data;
        url += isGet && httpQuery ? '?' + httpQuery : '';
        xhr.open(isGet? 'GET':'POST', url, !sync);
        if(!isGet) {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(isGet?'':httpQuery);
    };

    /**
     * Perform ajax GET request
     *
     * @param {string} url
     * @param {string|object|array} data
     * @param {boolean} sync
     */
    this.get = function(url, data, sync) {
        return self.request(url, data, 'GET', sync);
    };

    /**
     * Perform ajax POST request
     *
     * @param {string} url
     * @param {string|object|array} data
     * @param {boolean} sync
     */
    this.post = function(url, data, sync) {
        return self.request(url, data, 'POST', sync);
    };
};

