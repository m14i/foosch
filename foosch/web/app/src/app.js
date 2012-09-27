define(['jquery', 'jqueryws'], function ($) {
    return {
        initialize: function () {

            var txtUser = $('#txtUser');
            var btnJoin = $('#btnJoin');
            var btnLogin = $('#btnLogin');
            var btnLeave = $('#btnLeave');
            var content = $('#content');

            var ws = $.websocket("ws://46.226.154.239:8080/websocket", {
                events: {
                    error: function (e) {
                        content.append("error: " + e.data + "\n");
                    },
                    login: function (e) {
                        content.append("login: " + e.data + "\n");
                    },
                    join: function (e) {
                        content.append("join: " + e.data + "\n");
                    },
                    play: function (e) {
                        content.append("play: " + e.data.join() + "\n");
                    },
                    leave: function (e) {
                        content.append("leave: " + e.data + "\n");
                    }
                }
            });

            btnLeave.bind('click', function (e) {
                ws.send('leave', "hooosod");
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
