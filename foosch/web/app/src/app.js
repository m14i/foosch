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

            function stateStart() {
                btnLogin.show();
                btnJoin.hide();
                btnLeave.hide();
                txtChat.hide();
                chat.hide();
            }

            function stateLoggedIn() {
                btnJoin.show();
                btnLeave.hide();
                btnLogin.hide();
                txtChat.show();
                txtUser.hide();
                chat.show();
            }

            function stateJoined() {
                btnLogin.hide();
                btnLeave.show();
                btnJoin.hide();
                txtChat.show();
                txtUser.hide();
                chat.show();
            }
                
            stateStart();
           
            var ws = $.websocket("ws://localhost:8080/websocket", {
                events: {
                    error: function (e) {
                        console.log("error: " + e.data);
                    },
                    login: function (e) {
                        console.log("login: " + e.data);
                        stateLoggedIn();
                    },
                    join: function (e) {
                        console.log("join: " + e.data);
                        stateJoined();
                    },
                    play: function (e) {
                        alert("Time to play " + e.data.join() + "!");
                    },
                    say: function (e) {
                        chat.prepend(e.data + "\n");
                    },
                    leave: function (e) {
                        console.log("leave: " + e.data);
                        stateLoggedIn();
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
