define(['jquery', 'jqueryws'], function ($) {
    return {
        initialize: function () {

            var txtUser = $('#txtUser');
            var txtChat = $('#txtChat');

            var btnJoin = $('#btnJoin');
            var btnLogin = $('#btnLogin');
            var btnLeave = $('#btnLeave');
            var btnLogout = $('#btnLogout');

            var arenaIn = $('#arena .in');
            var arenaOut = $('#arena .out');
            var chat = $('#chat');
            var messages = $('#messages');
            var players = $('#players');
            var users = $('#users');
            var loginPnl = $('#login');
            var site = $('#site');

            function stateStart() {
                btnLogin.show();
                btnJoin.hide();
                btnLeave.hide();
                txtChat.hide();
                chat.hide();
                arenaIn.hide();
                arenaOut.hide();
                site.hide();
            }

            function stateLoggedIn(user) {
                btnJoin.show();
                btnLeave.hide();
                btnLogin.hide();
                txtChat.show();
                loginPnl.hide();
                chat.show();
                arenaIn.hide();
                arenaOut.show();
                site.show();
            }

            function stateJoined() {
                btnLogin.hide();
                btnLeave.show();
                btnJoin.hide();
                txtChat.show();
                chat.show();
                arenaIn.show();
                arenaOut.hide();
            }

            stateStart();

            var ws = $.websocket("ws://" + window.location.host + "/websocket", {
                events: {
                    error: function (e) {
                        alert("error: " + e.data);
                    },
                    login: function (e) {
                        console.log("login: " + e.data);
                        $('h1').text(e.data + " @ foosch");
                        stateLoggedIn(e.data);
                    },
                    join: function (e) {
                        console.log("join: " + e.data);
                        stateJoined();
                    },
                    play: function (e) {
                        alert("Time to play " + e.data.join(" ") + "!");
                    },
                    say: function (e) {
                        messages.prepend(e.data + "\n");
                    },
                    leave: function (e) {
                        console.log("leave: " + e.data);
                        stateLoggedIn();
                    },
                    arena: function (e) {
                        players.text(e.data.join(" | "));
                    },
                    users: function (e) {
                       users.text(e.data.join(" | "));
                    }
                }
            });

            btnLeave.bind('click', function (e) {
                ws.send('leave', "");
            });

            btnJoin.bind('click', function (e) {
                ws.send('join', "");
            });

            btnLogout.bind('click', function (e) {
               window.location.reload();
            });

            function login() {
                ws.send('login', txtUser.val());
            }

            btnLogin.bind('click', login);

            txtUser.bind('keypress', function(e) {
                if (e.keyCode == 13) {
                    login();
                }
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
