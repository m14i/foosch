define(['jquery', 'jqueryws'], function ($) {
    return {
        initialize: function () {

            var txtUser = $('#txtUser');
            var btnJoin = $('#btnJoin');
            var btnLogin = $('#btnLogin');
            var content = $('#content');

            var ws = $.websocket("ws://127.0.0.1:8080/websocket", {
                events: {
                    login: function (e) {
                        content.html(e.data.join());
                    },
                    join: function (e) {
                        content.html(e.data.join());
                    }
                }
            });

            btnJoin.bind('click', function (e) {
                ws.send('join', "hhhoooo");
            });

            btnLogin.bind('click', function (e) {
                ws.send('login', txtUser.val());
            });
        }
    }
});