require.config({

    baseUrl: 'app',

    paths: {
        jquery: 'libs/jquery-1.8.2',
        jquerycookie: 'libs/jquery.cookie',
        jqueryws: 'libs/jquery.websocket-0.0.1'
    },

    waitSeconds: 7, //7 is also the default

    shim: {
        'jquery': {
            exports: '$'
        },
        'jqueryws': {
            deps: ['jquery'],
            exports: 'jQuery.fn.websocket'
        },
        'jquerycookie': {
            deps: ['jquery'],
            exports: 'jQuery.fn.cookie'
        }
    }
});

require(['src/app'], function(app) {
    app.initialize();
});