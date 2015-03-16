 $(document).bind('mobileinit', function() {
	 		$.mobile.defaultPageTransition = 'none';
			$.mobile.activeBtnClass = 'none';
            $(document).on('tap', function(e) {
                $('.activeOnce').removeClass($.mobile.activeBtnClass);
            });
			moment.locale('th'); 
        });