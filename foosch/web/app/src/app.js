define(

   ['jquery', 'jqueryws', 'jquerycookie'],

   function ($) { return {

        initialize: function () {

            var txtUser = $('#txtUser');
            var txtChat = $('#txtChat');

            var btnJoin = $('#btnJoin');
            var btnLogin = $('#btnLogin');
            var btnLeave = $('#btnLeave');
            var btnLogout = $('#btnLogout');

            var arenaIn = $('#arena .in');
            var arenaOut = $('#arena .out');

            var lblPlayers = $('#players');
            var lblUsers = $('#users');

            var pnlChat = $('#chat');
            var pnlMessages = $('#messages');
            var pnlLogin = $('#login');
            var pnlSite = $('#site');

            function stateStart() {
                btnLogin.show();
                btnJoin.hide();
                btnLeave.hide();
                txtChat.hide();
                pnlChat.hide();
                arenaIn.hide();
                arenaOut.hide();
                pnlSite.hide();
            }

            function stateLoggedIn() {
                btnJoin.show();
                btnLeave.hide();
                btnLogin.hide();
                txtChat.show();
                pnlLogin.hide();
                pnlChat.show();
                arenaIn.hide();
                arenaOut.show();
                pnlSite.show();
            }

            function stateJoined() {
                btnLogin.hide();
                btnLeave.show();
                btnJoin.hide();
                txtChat.show();
                pnlChat.show();
                arenaIn.show();
                arenaOut.hide();
            }

            function autoLogin() {
               var name = $.cookie('name');
               if (name) {
                  login(name);
               }
            }

            function login(name) {
               $.cookie('name', name, {expires:21});
               ws.send('login', name);
            }

            function logout() {
               $.removeCookie('name');
               window.location.reload();
            }

            stateStart();

            var ws = $.websocket("ws://" + window.location.host + "/websocket", {
                events: {
                    error: function (e) {
                        alert("error: " + e.data);
                    },
                    login: function (e) {
                        $('h1').text(e.data + " @ foosch");
                        stateLoggedIn();
                    },
                    join: function (e) {
                        stateJoined();
                    },
                    play: function (e) {
                        alert("Time to play " + e.data.join(" ") + "!");
                    },
                    say: function (e) {
                        pnlMessages.prepend(e.data + "\n");
                    },
                    leave: function (e) {
                        stateLoggedIn();
                    },
                    arena: function (e) {
                        lblPlayers.text(e.data.join(" | "));
                    },
                    users: function (e) {
                       lblUsers.text(e.data.join(" | "));
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
                logout();
            });

            btnLogin.bind('click', function(e){
                login(txtUser.val());
            });

            txtUser.bind('keypress', function(e) {
                if (e.keyCode == 13) {
                    login(txtUser.val());
                }
            });

            txtChat.bind('keypress', function (e) {
                if (e.keyCode == 13) {
                    ws.send('say', txtChat.val());
                    txtChat.val("");
                }
            });

            setTimeout(autoLogin, 100);
        }
    }
});
