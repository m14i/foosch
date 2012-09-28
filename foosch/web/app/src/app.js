define(['jquery', 'jqueryws'], function ($) {
    return {
        initialize: function () {

            var txtUser = $('#txtUser');
            var txtChat = $('#txtChat');

            var btnJoin = $('#btnJoin');
            var btnLogin = $('#btnLogin');
            var btnLeave = $('#btnLeave');

            var content = $('#content');
            var chat = $('#chat');
           
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
                    say: function (e) {
                        chat.prepend(e.data + "\n");
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

            txtChat.bind('keypress', function (e) {
                if (e.keyCode == 13) {
                    ws.send('say', txtChat.val());
                    txtChat.val("");
                }        
            });
        }
    }
});
