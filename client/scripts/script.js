"use strict";

$(document).ready(function()
{ 
    const SCENEs = {
        Main: "Main",
        Local: "Local",
        Bot: "Bot",
        OnlineMenu: "OnlineMenu",
        OnlineRoom: "OnlineRoom",
        Settings: "Settings"
    };

    const ERRORs = {
        NotConnectedToServer: "NotConnectedToServer",
        ServerNotWorking: "ServerNotWorking",
        UserBanned: "UserBanned",
        ErrorAuthorization: "ErrorAuthorization",
        NotAuthorized: "NotAuthorized",
        PlayerInTheRoom: "PlayerInTheRoom",
        RoomLength: "RoomLength",
        RoomNotFound: "RoomNotFound",
        RoomIsFull: "RoomIsFull",
        RoomAlreadyExists: "RoomAlreadyExists",
        IncorrectNickname: "IncorrectNickname",
        IncorrectRoomName: "IncorrectRoomName",
        IncorrectRoomPass: "IncorrectRoomPass",
        IncorrectMessage: "IncorrectMessage",
        WaitOpponent: "WaitOpponent",
        LocalGameOnlyForPc: "LocalGameOnlyForPc"
    };

    const Utils = new function ()
    {
        this.Random = (min, max) =>
        {
            return Math.round(Math.random() * (max - min) + min);
        };
    }

    const Interface = new function ()
    {
        this.MENU_BUTTONs = {
            RunOnline: "RunOnline",
            RunLocal: "RunLocal",
            RunBot: "RunBot",
            Settings: "Settings",
            Back: "Back",
            CloseWindow: "CloseWindow",
            CreateRoom: "CreateRoom"
        };

        this.GameElements = {
            Menu: $("#menu"),
            MainLabelDiv: $("#main_label_div"),
            MainLabel: $("#main_label"),
            MainMenu: $("#main_menu"),
            SettingsMenu: $("#settings_menu"),
            OnlineMenu: $("#online_menu"),
            OnlineMenuChatDiv: $("#online_menu_chat"),
            CenterGameElementsDiv: $("#center_game_elements"),
            FastMenu: $("#fast_menu"),
            BattleElements: $("#battle_elements"),
            CloseIcon: $(".close-icon"),
            ReactionBtn: $("#reaction_btn"),
            FirstPlayerBtnReady: $(".first-player-btn-ready"),
            FirstPlayerName: $("#first_player_name"),
            FirstPlayerTime: $(".first-player-time"),
            FirstPlayerExp: $("#first_player_score"),
            FirstPlayerImg: $("#first_player_img"),
            SecondPlayerBtnReady: $(".second-player-btn-ready"),
            SecondPlayerName: $("#second_player_name"),
            SecondPlayerTime: $(".second-player-time"),
            SecondPlayerExp: $("#second_player_score"),
            SecondPlayerImg: $("#second_player_img")
        };

        const TextElement = function(elemID, replacementText, isText)
        {
            const elem = $(elemID);
            this.replacementText = replacementText;
            
            this.GetElement = () =>
            {
                return elem;
            };

            this.Update = (text = undefined) =>
            {
                const replacementText = (text == undefined) ? Localization.Get(this.replacementText) : text;

                if (isText)
                    return elem.text(replacementText);
                
                elem.attr("placeholder", replacementText);
            };
        };

        this.TextElements = {
            BtnOnline: new TextElement("#main_menu_button_online", "btn-online", true),
            BtnLocal: new TextElement("#main_menu_button_local", "btn-local", true),
            BtnBot: new TextElement("#main_menu_button_bot", "btn-bot", true),
            BtnSettings: new TextElement("#main_menu_button_settings", "btn-settings", true),
            Loading: new TextElement("#loading_text", "loading", true),
            BtnBack: new TextElement("#fast_menu_btn_back", "btn-back", true),
            Ready: new TextElement(".button-ready-enabled", "ready", true),
            NotReady: new TextElement(".button-ready-disabled", "not-ready", true),
            Reaction: new TextElement("#reaction_btn_text", "reaction", true),
            RoomsCount: new TextElement("#rooms_count_text", "rooms-count", true),
            RoomsOnline: new TextElement("#rooms_online_text", "rooms-online", true),
            ChangeNickname: new TextElement("#change_nickname", "change-nickname", false),
            RoomName: new TextElement("#room_search", "room-name", false),
            RoomPass: new TextElement("#room_pass", "room-pass", false),
            CreateRoom: new TextElement("#create_room", "create-room", true),
            SettingsLanguage: new TextElement("#settings_language", "settings-language", true),
            SettingsVolume: new TextElement("#settings_volume", "settings-volume", true)
        };

        this.UpdateTextElements = () =>
        {
            for (let key in this.TextElements)
            {
                this.TextElements[key].Update();
            }
        };
        
        this.Click = (btn) =>
        {
            switch(btn)
            {
                case this.MENU_BUTTONs.RunOnline:
                    Server.TryConnect();
                    break;
                case this.MENU_BUTTONs.RunLocal:
                    GameLogic.GameModes.LocalBattle.RunInitialization();
                    break;
                case this.MENU_BUTTONs.RunBot:
                    GameLogic.GameModes.BattleWithBot.RunInitialization();
                    break;
                case this.MENU_BUTTONs.Settings:
                    Scene.SwitchTo(SCENEs.Settings);
                    break;
                case this.MENU_BUTTONs.Back:
                    switch(Scene.Get())
                    {
                        case SCENEs.Local:
                        case SCENEs.Bot:
                        case SCENEs.OnlineMenu:
                        case SCENEs.Settings:
                            Scene.SwitchTo(SCENEs.Main);
                            break;
                        case SCENEs.OnlineRoom:
                            Server.TryLeaveRoom();
                            break;
                        default:
                            InformationScreen.ShowError(`[Interface]: Button(${btn}) click error | Scene: ${Scene.Get()}`);
                            break;
                    }
                    break;
                case this.MENU_BUTTONs.CloseWindow:
                    InformationScreen.Close();
                    break;
                case this.MENU_BUTTONs.CreateRoom:
                    RoomsManager.OnCreateRoomClick();
                    break;
                default:
                    InformationScreen.ShowError(`[Interface]: Error click button (${btn}) | Scene: ${Scene.Get()}`);
                    break;
            }
        };

        this.TextElements.BtnOnline.GetElement().click(function() 
        {
            InformationScreen.ShowServerConnection(function () 
            {
                Interface.Click(Interface.MENU_BUTTONs.RunOnline);
            });
        });

        this.TextElements.BtnLocal.GetElement().click(function() 
        {
            if ($(window).width() < 1000)
                return InformationScreen.ShowError(ERRORs.LocalGameOnlyForPc);

            InformationScreen.ShowLoading(function () 
            {
                Interface.Click(Interface.MENU_BUTTONs.RunLocal);
            });
        });

        this.TextElements.BtnBot.GetElement().click(function() 
        {
            InformationScreen.ShowLoading(function () 
            {
                Interface.Click(Interface.MENU_BUTTONs.RunBot);
            });
        });

        this.TextElements.BtnSettings.GetElement().click(function() 
        {
            InformationScreen.ShowLoading(function () 
            {
                Interface.Click(Interface.MENU_BUTTONs.Settings);
            });
        });

        this.TextElements.BtnBack.GetElement().click(function() 
        {
            InformationScreen.ShowLoading(function () 
            {
                Interface.Click(Interface.MENU_BUTTONs.Back);
            });
        });

        this.TextElements.CreateRoom.GetElement().click(function() 
        {
            InformationScreen.ShowLoading(function () 
            {
                Interface.Click(Interface.MENU_BUTTONs.CreateRoom);
            }, true);
        });

        this.GameElements.CloseIcon.click(function() 
        {
            Interface.Click(Interface.MENU_BUTTONs.CloseWindow);
        });
    };

    const InformationScreen = new function ()
    {
        const informationScreen = $("#information_screen");
        const loadingBlock = $("#loading_block");
        const errorBlock = $("#error_block");
        const fightResultBlock = $("#fight_result_block");
        const closeButton = Interface.GameElements.CloseIcon;
        const loadingText = Interface.TextElements.Loading.GetElement();
        const errorText = $("#error_text");
        const fightText = $("#fight_text");
        const fightIcon = $(".fight-icon");

        let isError = false;

        const clearInfromationScreen = () =>
        {
            loadingBlock.hide();
            errorBlock.hide();
            fightResultBlock.hide();
            closeButton.hide();
        };

        this.ShowLoading = (fn = () => {}, doNotClose = false) =>
        {
            clearInfromationScreen();
            loadingText.text(Localization.Get("loading"));
            loadingBlock.show();
            informationScreen.fadeIn(200, function(){});
            setTimeout(function() {
                fn();
                if (!isError && !doNotClose)
                    InformationScreen.Close();
            }, 800);
        };

        this.ShowServerConnection = (fn = () => {}) =>
        {
            clearInfromationScreen();
            loadingText.text(Localization.Get("connecting"));
            loadingBlock.show();
            informationScreen.fadeIn(200, function(){});
            setTimeout(function() {
                fn();
            }, 800);
        };

        this.UpdateServerConnection = () =>
        {
            loadingText.text(Localization.Get("successful-connecting"));
            Scene.SwitchTo(SCENEs.OnlineMenu);
        };

        this.ShowError = (error) =>
        {
            isError = true;
            clearInfromationScreen();
            if (!ERRORs[error])
                errorText.text(error);
            else
                errorText.text(Localization.Get(`error-${error}`));
            console.error(errorText.text());
            errorBlock.show();
            closeButton.show();
            informationScreen.fadeIn(200, function(){});
        };

        this.ShowFightResult = (isWin) =>
        {
            clearInfromationScreen();
            fightResultBlock.show();
            closeButton.show();
            fightIcon.removeAttr("class");
            fightIcon.addClass((isWin) ? "fight-win-icon" : "fight-lose-icon");
            fightText.html(Localization.Get((isWin) ? "you-win" : "you-lose"));
            informationScreen.fadeIn(200, function(){});
        };

        this.Close = () =>
        {
            isError = false;
            informationScreen.fadeOut(1000, function(){});
        };
    };

    const Player = function ()
    {
        let name = undefined;
        let position = undefined;
        let isLocalPlayer = undefined;
        let isActive = false;
        let canShoot = false;
        let elemName, elemTime, elemExp, elemImg = undefined;

        const setElementsByPosition = () =>
        {
            switch(position)
            {
                case 0:
                    elemName = Interface.GameElements.FirstPlayerName;
                    elemName.text(name);
                    elemTime = Interface.GameElements.FirstPlayerTime;
                    elemExp = Interface.GameElements.FirstPlayerExp;
                    elemImg = Interface.GameElements.FirstPlayerImg;
                    this.ButtonReady.btn = Interface.GameElements.FirstPlayerBtnReady;
                    this.ButtonReady.SetActive(false);
                    break;
                case 1:
                    elemName = Interface.GameElements.SecondPlayerName;
                    elemName.text(name);
                    elemTime = Interface.GameElements.SecondPlayerTime;
                    elemExp = Interface.GameElements.SecondPlayerExp;
                    elemImg = Interface.GameElements.SecondPlayerImg;
                    this.ButtonReady.btn = Interface.GameElements.SecondPlayerBtnReady;
                    this.ButtonReady.SetActive(false);
                    break;
                default:
                    return InformationScreen.ShowError(`[Player.switch(position)] Can't change this position => (${position})`);
            }
        };

        this.ButtonReady = new function()
        {
            let state = false;
            this.btn = undefined;

            this.SetActive = (_state) =>
            {
                if (!isActive)
                    return;
                
                if (_state)
                {
                    state = true;
                    this.btn.removeClass("button-ready-disabled").addClass("button-ready-enabled").text(Localization.Get("ready"));
                    if (ScoreManager.IsNeedReset())
                        ScoreManager.Reset();
                    // @ts-ignore
                    GameLogic.GameMode.TryStartCountdown();
                    return;
                }
                state = false;
                this.btn.removeClass("button-ready-enabled").addClass("button-ready-disabled").text(Localization.Get("not-ready"));
            };

            this.ToggleActivity = () =>
            {
                this.SetActive(!state);
            };

            this.isReady = () =>
            {
                return state ? true : false;
            };
        };

        this.GetName = () =>
        {
            if (!name)
                return Localization.Get("player-name");
            
            return name;
        };

        this.GetPosition = () =>
        {
            return position;
        };

        this.CanShoot = (bool = undefined) =>
        {
            if (bool == undefined)
                return canShoot;
            
            canShoot = bool;
        };

        this.Shot = (serverTime = undefined) =>
        {
            if (Scene.IsMenu())
                return;

            if (!this.ButtonReady.isReady() || (this.ButtonReady.isReady() && !Countdown.IsStarted()))
            {
                SoundManager.Sounds.Fail.Play();
                return;
            }

            if (Countdown.IsStarted() && !canShoot)
            {
                SoundManager.Sounds.Fail.Play();
                this.ButtonReady.SetActive(false);
                GameLogic.GameMode.AfterRound(false);
                Chat.AddMessage(`${name} ${Localization.Get("shot-ahead-of-time")}`);
                return;
            }

            SoundManager.PlayRandomShot();
            elemImg.css("transform", "scale(1, 1)");
            this.ButtonReady.SetActive(false);
            canShoot = false;
            if (!Scene.IsOnlineRoom())
                return ScoreManager.AddShot(position);
            ScoreManager.AddShot(position, serverTime);
            
        };

        this.SetTime = (time) =>
        {
            elemTime.text(time);
        };

        this.ResetTime = () => 
        {
            if (!isActive)
                return;
            
            elemTime.text("0.000").css("color", "#656565");
        };

        this.Active = (_name, _position, _isLocalPlayer = false) =>
        {
            name = _name;
            position = (_position === undefined) ? undefined : (_position == false) ? 0 : 1;
            isLocalPlayer = _isLocalPlayer;

            setElementsByPosition();

            if (isLocalPlayer)
                this.ButtonReady.btn.addClass("local-player-button-ready");
            else
                this.ButtonReady.btn.removeClass("local-player-button-ready");

            elemImg.removeClass("deactivedUser");
            elemTime.css("color", "#656565");
            isActive = true;
        };

        this.Deactive = () =>
        {
            if (isActive)
            {
                elemName.text(Localization.Get("player-name"));
                elemImg.addClass("deactivedUser");
                this.ResetTime();
                this.ButtonReady.btn.removeClass("local-player-button-ready");
                this.ButtonReady.SetActive(false);
            }

            isActive = false;
            name = position = isLocalPlayer = undefined;
        };

        this.IsActive = () =>
        {
            return (isActive) ? true : false;
        };

        this.ClearAndRotate = () =>
        {
            if (!isActive)
                return;
            
            canShoot = false;
            elemImg.css("transform", "scale(-1, 1)");
            this.ResetTime();
        };

        this.ShowWinAnimation = () =>
        {
            elemTime.css("color", "#5babff");
            elemExp.fadeIn(250, function(){}).fadeOut(3000, function(){});
        };

        this.ShowLoseAnimation = () =>
        {
            elemImg.addClass("duelant-img-red");
            setTimeout(function() {
                    elemImg.removeClass("duelant-img-red");
            }, 500);
            elemTime.css("color", "#8e4153");
        };

        this.ShowDrawAnimation = () =>
        {
            elemTime.css("color", "#5babff");
        };
    };

    const LocalPlayer = new Player();
    const EnemyPlayer = new Player();

    const Scene = new function()
    {
        let scene = SCENEs.Main;

        this.Get = () =>
        {
            return scene;
        }; 

        this.IsMenu = () =>
        {
            return (scene != SCENEs.Main && scene != SCENEs.OnlineMenu) ? false : true;
        };

        this.IsOnlineRoom = () =>
        {
            return (scene == SCENEs.OnlineRoom) ? true : false;
        };

        this.IsBot = () =>
        {
            return (scene == SCENEs.Bot) ? true : false;
        };

        this.SwitchTo = (_scene) =>
        {
            switch(_scene)
            {
                case SCENEs.Bot:
                    Interface.GameElements.MainLabelDiv.prependTo(Interface.GameElements.CenterGameElementsDiv);
                    Interface.GameElements.MainMenu.hide();
                    Interface.GameElements.FastMenu.show();
                    Interface.GameElements.BattleElements.show();
                    Chat.Clear();
                    scene = _scene;
                    Chat.MoveTo(scene);
                    break;

                case SCENEs.Local:
                    Interface.GameElements.MainLabelDiv.prependTo(Interface.GameElements.CenterGameElementsDiv);
                    Interface.GameElements.MainMenu.hide();
                    Interface.GameElements.FastMenu.show();
                    Interface.GameElements.BattleElements.show();
                    Chat.Clear();
                    scene = _scene;
                    Chat.MoveTo(scene);
                    break;

                case SCENEs.Main:
                    Interface.GameElements.MainLabelDiv.prependTo(Interface.GameElements.Menu);
                    Interface.GameElements.MainMenu.show();
                    Interface.GameElements.OnlineMenu.hide();
                    Interface.GameElements.FastMenu.hide();
                    Interface.GameElements.BattleElements.hide();
                    Interface.GameElements.SettingsMenu.hide();
                    GameLogic.TerminateGameMode();
                    scene = _scene;
                    break;

                case SCENEs.Settings:
                    Interface.GameElements.MainLabelDiv.prependTo(Interface.GameElements.CenterGameElementsDiv);
                    Interface.GameElements.MainMenu.hide();
                    Interface.GameElements.FastMenu.show();
                    Interface.GameElements.SettingsMenu.show();
                    scene = _scene;
                    break;

                case SCENEs.OnlineMenu:
                    Interface.GameElements.MainLabelDiv.prependTo(Interface.GameElements.OnlineMenuChatDiv);
                    Interface.GameElements.MainMenu.hide();
                    Interface.GameElements.BattleElements.hide();
                    Interface.GameElements.OnlineMenu.show();
                    Interface.GameElements.FastMenu.show();
                    scene = _scene;
                    GameLogic.TerminateGameMode();
                    Chat.SetActive(true);
                    Chat.LoadHistory();
                    Chat.MoveTo(scene);
                    InformationScreen.Close();
                    break;

                case SCENEs.OnlineRoom:
                    Interface.GameElements.MainLabelDiv.prependTo(Interface.GameElements.CenterGameElementsDiv);
                    Interface.GameElements.OnlineMenu.hide();
                    Interface.GameElements.FastMenu.show();
                    Interface.GameElements.BattleElements.show();
                    scene = _scene;
                    Chat.MoveTo(scene);
                    InformationScreen.Close();
                    break;

                default:
                    return InformationScreen.ShowError(`[GameLogic.SwitchScene]: ${_scene} scene initialization error.`);
            }
            console.log("Scene: " + scene.toString());
        };
    };
    
    const GameLogic = new function ()
    {
        this.GameMode = null;

        this.GameModes = {
            LocalBattle: new function ()
            {
                this.RunInitialization = () =>
                {
                    Scene.SwitchTo(SCENEs.Local);
                    GameLogic.GameMode = this;
                    GameLogic.GameMode.Initialize();
                };

                this.Initialize = () =>
                {
                    LocalPlayer.Active(Localization.Get("player-name") + " 1", 0, true);
                    EnemyPlayer.Active(Localization.Get("player-name") + " 2", 1, true);
                    ScoreManager.Reset(true);
                    Chat.SetActive(false);
                    Chat.AddMessage(Localization.Get("chat"));
                    Interface.TextElements.Reaction.Update();
                    Interface.GameElements.ReactionBtn.off("mousedown");
                    $(document).off("keydown").keydown(function(e) 
                    {
                        if (e.originalEvent.location === 1)
                            LocalPlayer.Shot();
                        else if (e.originalEvent.location === 2)
                            EnemyPlayer.Shot();
                    });
                    const onBtnReadyClick = function()
                    {
                        if (!Countdown.IsStarted())
                        {
                            LocalPlayer.ButtonReady.ToggleActivity();
                            EnemyPlayer.ButtonReady.ToggleActivity();
                        }
                    };
                    $(Interface.GameElements.FirstPlayerBtnReady).off("click").click(onBtnReadyClick);
                    $(Interface.GameElements.SecondPlayerBtnReady).off("click").click(onBtnReadyClick);
                };

                this.TryStartCountdown = () =>
                {
                    if (LocalPlayer.ButtonReady.isReady()) 
                    {
                        Countdown.Start();
                    }
                };

                this.AfterRound = () =>
                {
                    LocalPlayer.ButtonReady.SetActive(false);
                    EnemyPlayer.ButtonReady.SetActive(false);
                    ScoreManager.CheckFinish();
                };
            },

            BattleWithBot: new function ()
            {
                this.RunInitialization = () =>
                {
                    Scene.SwitchTo(SCENEs.Bot);
                    GameLogic.GameMode = this;
                    GameLogic.GameMode.Initialize();
                };

                const maxReactionTimeForBot = 0.350;
                let playerShots = [0.310, 0.230];
                // @ts-ignore
                let autoShotTime = (parseFloat(playerShots[0]) + parseFloat(playerShots[1])) / 2;

                this.Initialize = () =>
                {
                    LocalPlayer.Active(Localization.Get("player-name"), 0, true);
                    EnemyPlayer.Active("Bot", 1);
                    EnemyPlayer.ButtonReady.SetActive(true);
                    ScoreManager.Reset(true);
                    Chat.SetActive(false);
                    Chat.AddMessage(Localization.Get("chat"));
                    playerShots = [0.310, 0.230];
                    Interface.TextElements.Reaction.Update();
                    Interface.GameElements.ReactionBtn.off("mousedown").mousedown(function()
                    {
                        LocalPlayer.Shot();
                    });
                    $(document).off("keydown").keydown(function(e) 
                    {
                        if (e.which == 32 || e.which == 17)
                            LocalPlayer.Shot();
                    });
                    $(Interface.GameElements.FirstPlayerBtnReady).off("click");
                    $(Interface.GameElements.SecondPlayerBtnReady).off("click");
                    LocalPlayer.ButtonReady.btn.click(function() 
                    {
                        if (!Countdown.IsStarted())
                            LocalPlayer.ButtonReady.ToggleActivity();
                    });
                };

                this.TryStartCountdown = () =>
                {
                    if (LocalPlayer.ButtonReady.isReady()) 
                    {
                        Countdown.Start();
                    }
                };

                this.AfterRound = (b = undefined) =>
                {
                    if (b != undefined)
                        return;
                    EnemyPlayer.ButtonReady.SetActive(true);
                    playerShots.splice(0, 1);
                    // @ts-ignore
                    playerShots.push((parseFloat(ScoreManager.GetFirstPlayerShotTime()) > parseFloat(maxReactionTimeForBot)) ? parseFloat(maxReactionTimeForBot) : parseFloat(ScoreManager.GetFirstPlayerShotTime()));
                    // @ts-ignore
                    autoShotTime = parseFloat((parseFloat(playerShots[0]) + parseFloat(playerShots[1])) / 2);
                    ScoreManager.CheckFinish();
                };

                this.AutoShot = () =>
                {
                    setTimeout(EnemyPlayer.Shot, autoShotTime * 1000);
                };
            },

            OnlineRoomBattle: new function ()
            {
                this.RunInitialization = () =>
                {
                    Scene.SwitchTo(SCENEs.OnlineRoom);
                    GameLogic.GameMode = this;
                    GameLogic.GameMode.Initialize();
                };

                this.Initialize = () =>
                {
                    Countdown.ResetCounter();
                    ScoreManager.Reset(true);
                    Chat.SetActive(true);
                    Chat.LoadHistory();
                    Chat.AddMessage(Localization.Get("chat"));
                    Interface.TextElements.Reaction.Update();
                    Interface.GameElements.ReactionBtn.off("mousedown").mousedown(function()
                    {
                        // @ts-ignore
                        Server.TryShot(GameLogic.GetFireTime());
                    });
                    $(document).off("keydown").keydown(function(e) 
                    {
                        if (e.which == 32 || e.which == 17)
                            // @ts-ignore
                            Server.TryShot(GameLogic.GetFireTime());
                    });
                    const onBtnReadyClick = function()
                    {
                        Server.TrySendReady();
                    };
                    $(Interface.GameElements.FirstPlayerBtnReady).off("click");
                    $(Interface.GameElements.SecondPlayerBtnReady).off("click");
                    LocalPlayer.ButtonReady.btn.click(onBtnReadyClick);
                    Server.SendSuccessfulConnection();
                };

                this.TryStartCountdown = () => {};

                this.AfterRound = (b = undefined) =>
                {
                    if (b != undefined)
                    {
                        LocalPlayer.ButtonReady.SetActive(false);
                        EnemyPlayer.ButtonReady.SetActive(false);
                        return;
                    }
                    ScoreManager.CheckFinish();
                };
            }
        };

        this.TerminateGameMode = () =>
        {
            Countdown.ResetCounter();
            ScoreManager.Reset(true);
            LocalPlayer.Deactive();
            EnemyPlayer.Deactive();
            RoomsManager.CurrentRoom.Clear();
            this.GameMode = null;
            $(document).off("keydown");
        };

        this.GetFireTime = () =>
        {
            // @ts-ignore
            return new Date().getTime() - ScoreManager.GetStartTime();
        };

        this.GetPlayerByPosition = (position) =>
        {
            if (position == LocalPlayer.GetPosition())
                return LocalPlayer;
            
            return EnemyPlayer;
        };
    };

    const Server = new function()
    {
        let Socket;
        let statusOK = "OK";
        
        const RPC_MODE = {
            CLIENT_SERVER: "CLIENT_SERVER",
            SERVER_CLIENT: "SERVER_CLIENT"
        };

        const CLIENT_RPCs = {
            CONNECTION_BY_LINK: "CONNECTION_BY_LINK",
            DEFAULT_CONNECTION: "DEFAULT_CONNECTION",
            SIGNOUT: "SIGNOUT",
            CHANGE_NICKNAME: "CHANGE_NICKNAME",
            CREATE_ROOM: "CREATE_ROOM",
            JOIN_ROOM: "JOIN_ROOM",
            LEAVE_ROOM: "LEAVE_ROOM",
            SEND_MESSAGE: "SEND_MESSAGE",
            PLAYER_READY: "PLAYER_READY",
            PLAYER_CONNECTED_TO_ROOM: "PLAYER_CONNECTED_TO_ROOM",
            PLAYER_SHOT: "PLAYER_SHOT",
        };
        
        const SERVER_RPCs = {
            UPDATE_ONLINE: "UPDATE_ONLINE",
            UPDATE_FULL_ONLINE: "UPDATE_FULL_ONLINE",
            NEW_ROOM_MESSAGE: "NEW_ROOM_MESSAGE",
            NEW_PLAYER_IN_ROOM: "NEW_PLAYER_IN_ROOM",
            PLAYER_DISCONNECTED: "PLAYER_DISCONNECTED",
            PLAYER_READY: "PLAYER_READY",
            NEW_FIRE_TIME: "NEW_FIRE_TIME",
            PLAYER_SHOT: "PLAYER_SHOT",
            ROUND_RESULT: "ROUND_RESULT",
            RESET_READY: "RESET_READY",
        };

        this.isConnected = () =>
        {
            return (Socket) ? ((Socket.connected) ? true : false) : false;
        };

        this.Disconnect = () =>
        {
            Scene.SwitchTo(SCENEs.Main);
            Socket.disconnect();
            Socket = undefined;
            RoomsManager.Reset();
        };

        const connect = (data = undefined) =>
        {
            if (Socket == undefined)
            {
                // @ts-ignore
                Socket = io.connect(":777");

                Socket.on('connect', () => 
                {
                    if (!Socket.connected)
                        return;
                });
                
                Socket.io.on('reconnect_error', (error) => 
                {
                    InformationScreen.ShowError(ERRORs.ServerNotWorking);
                    this.Disconnect();
                });
            
                Socket.on('disconnect', (reason) => 
                {
                    if (reason === 'io server disconnect') {
                        InformationScreen.ShowError(ERRORs.UserKicked);
                    } else if (reason === "transport close") {
                        InformationScreen.ShowError(ERRORs.ServerNotWorking);
                    }
                    this.Disconnect();
                });

                Socket.on(RPC_MODE.SERVER_CLIENT, (event, data) => 
                {
                    if (!data)
                        return;
                    
                    switch(event)
                    {
                        case SERVER_RPCs.UPDATE_ONLINE:
                            if (data.players == undefined || data.rooms == undefined)
                                return;
                            
                            if (data.room)
                                RoomsManager.Update(data.room.name, data.room.id, data.room.online, data.room.limit, data.room.pass);

                            RoomsManager.UpdateInfo(data.players, data.rooms);
                            break;
                        
                        case SERVER_RPCs.UPDATE_FULL_ONLINE:
                            if (data.rooms == undefined || data.players_online == undefined || data.rooms_online == undefined)
                                return;
                            
                            RoomsManager.Reset();
                            for (let index in data.rooms)
                            {
                                let room = data.rooms[index];
                                RoomsManager.Update(room.name, room.id, room.online, room.limit, room.pass);
                            }

                            RoomsManager.UpdateInfo(data.players_online, data.rooms_online);
                            break;

                        case SERVER_RPCs.NEW_ROOM_MESSAGE:
                            if (!data.message)
                                return;
                            
                            Chat.NewServerMessage(data.message);
                            Chat.AddMessage(data.message.text, data.message.author, data.message.time);
                            break;
                        
                        case SERVER_RPCs.NEW_PLAYER_IN_ROOM:
                            if (data.position == undefined)
                                return;
                            
                            LocalPlayer.ButtonReady.SetActive(false);
                            EnemyPlayer.Active(data.name, data.position);
                            Chat.AddMessage(Localization.Get("player-connected-to-room").replace("%PLAYER_NAME%", data.name), undefined);
                            SoundManager.Sounds.Join.Play();
                            ScoreManager.Reset(true);
                            break;

                        case SERVER_RPCs.PLAYER_DISCONNECTED:
                            Chat.AddMessage(Localization.Get("player-disconnected-from-room").replace("%PLAYER_NAME%", data.name), undefined);
                            LocalPlayer.ButtonReady.SetActive(false);
                            EnemyPlayer.Deactive();
                            SoundManager.Sounds.Leave.Play();
                            Countdown.ResetCounter();
                            ScoreManager.CheckFinish(true);
                            break;

                        case SERVER_RPCs.PLAYER_READY:
                            if (data.position == undefined || !LocalPlayer.IsActive())
                                return;

                            if (data.position == LocalPlayer.GetPosition())
                            {
                                LocalPlayer.ButtonReady.SetActive(data.ready);
                                return;
                            }
                            EnemyPlayer.ButtonReady.SetActive(data.ready);
                            break;

                        case SERVER_RPCs.NEW_FIRE_TIME:
                            Countdown.Start(data.time);
                            break;

                        case SERVER_RPCs.PLAYER_SHOT:
                            if (data.position == undefined || typeof data.time != "number" || !LocalPlayer.IsActive())
                                return;

                            if (data.position == LocalPlayer.GetPosition())
                            {
                                LocalPlayer.Shot(data.time);
                                return;
                            }
                            EnemyPlayer.Shot(data.time);
                            break;

                        case SERVER_RPCs.RESET_READY:
                            
                            Countdown.ResetCounter();
                            LocalPlayer.ButtonReady.SetActive(false);
                            EnemyPlayer.ButtonReady.SetActive(false);
                            GameLogic.GameMode.AfterRound(false);
                            if (data.isFalseStart)
                            {
                                if (data.position == undefined)
                                    return;
                                SoundManager.Sounds.Fail.Play();
                                Chat.AddMessage(`${GameLogic.GetPlayerByPosition(data.position).GetName()} ${Localization.Get("shot-ahead-of-time")}`);
                            }
                            break;
                    }
                });
            }

            let findNicknameInCookie = this.Cookies.Nickname.Get();

            if (data) 
            {
                Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.CONNECTION_BY_LINK, {
                    room: data.id,
                    nickname: (findNicknameInCookie == undefined) ? false : findNicknameInCookie
                }, (res) => {
                    if (res.status == statusOK)
                    {
                        RoomsManager.ChangeNickname(res.nickname);
                        return InformationScreen.UpdateServerConnection();
                    }

                    console.warn(res.status);
                });
                return;
            }

            if (Socket.connected)
                return InformationScreen.UpdateServerConnection();

            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.DEFAULT_CONNECTION, {
                nickname: (findNicknameInCookie == undefined) ? false : findNicknameInCookie
            }, (res) => {
                if (res.status == statusOK)
                {
                    RoomsManager.ChangeNickname(res.nickname);
                    Chat.SetMessages(res.messages);
                    return InformationScreen.UpdateServerConnection();
                }

                InformationScreen.ShowError(res.status);
            });
        };

        this.TryConnect = () =>
        {
            const roomDataInLink = window.location.href.split("#");

            if (!roomDataInLink[1])
                return connect();
                
            connect({
                id: roomDataInLink[1],
                pass: roomDataInLink[2]
            });
        };

        this.Cookies = new function()
        {
            const MyCookie = function(_name)
            {
                const name = _name;

                this.Set = (cval) =>
                {
                    $.cookie(name, escape(cval), { expires: 300 });
                };

                this.Get = () =>
                {
                    let cookie = unescape($.cookie(name));

                    if (cookie != "undefined")
                        return cookie;
                    
                    return undefined;
                };
            };

            this.Nickname = new MyCookie("NICKNAME");
            this.Language = new MyCookie("LANGUAGE");
            this.Volume = new MyCookie("VOLUME");
        };

        this.TryChangeNickname = (nickname) =>
        {
            if ((nickname.length < 3 || nickname.length > 25))
            {
                RoomsManager.ChangeNickname("");
                return;
            }
            
            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.CHANGE_NICKNAME, {
                nickname: nickname
            }, (res) => {
                RoomsManager.ChangeNickname(res.nickname);
            });
        };

        this.TryCreateRoom = (name = "", pass = "") =>
        {
            if (!this.isConnected())
                return InformationScreen.ShowError(ERRORs.NotConnectedToServer);
                
            if (RoomsManager.CurrentRoom.id)
                return InformationScreen.ShowError(ERRORs.PlayerInTheRoom);

            if (name.length > 0 && (name.length < 3 || name.length > 25))
                return InformationScreen.ShowError(ERRORs.RoomLength);

            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.CREATE_ROOM, {
                name: name,
                pass: pass.trim()
            }, (res) => {
                if (res.status == statusOK)
                {
                    RoomsManager.Clear();
                    Chat.SetMessages([]);
                    RoomsManager.CurrentRoom.Set(res.room_options.id, res.room_options.name, res.room_options.pass);
                    LocalPlayer.Active(Server.Cookies.Nickname.Get(), 0, true);
                    EnemyPlayer.Active(undefined, 1, false);
                    EnemyPlayer.Deactive();
                    InformationScreen.ShowLoading(function () 
                    {
                        GameLogic.GameModes.OnlineRoomBattle.RunInitialization();
                    }, true);
                    return;
                }

                InformationScreen.ShowError(res.status);
            });
        };

        this.TryLeaveRoom = () =>
        {
            if (!this.isConnected())
                return InformationScreen.ShowError(ERRORs.NotConnectedToServer);

            if (!RoomsManager.CurrentRoom.id)
                return InformationScreen.ShowError(ERRORs.RoomNotFound);

            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.LEAVE_ROOM, {}, (res) => {
                if (res.status == statusOK)
                {
                    RoomsManager.CurrentRoom.Clear();
                    Chat.SetMessages(res.messages);
                    Scene.SwitchTo(SCENEs.OnlineMenu);
                    return;
                }

                InformationScreen.ShowError(res.status);
            });
        };

        this.TryJoinRoom = (id, pass = undefined) =>
        {
            if (!this.isConnected())
                return InformationScreen.ShowError(ERRORs.NotConnectedToServer);

            if (RoomsManager.CurrentRoom.id)
                return InformationScreen.ShowError(ERRORs.PlayerInTheRoom);

            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.JOIN_ROOM, {
                id: id,
                pass: pass
            }, (res) => {
                if (res.status == statusOK)
                {
                    RoomsManager.Clear();
                    Chat.SetMessages(res.messages);
                    RoomsManager.CurrentRoom.Set(res.room.id, res.room.name, res.room.pass);
                    LocalPlayer.Active(Server.Cookies.Nickname.Get(), res.room.position, true);
                    EnemyPlayer.Active(res.room.enemyPlayer.name, res.room.enemyPlayer.position);
                    InformationScreen.ShowLoading(function () 
                    {
                        GameLogic.GameModes.OnlineRoomBattle.RunInitialization();
                    }, true);
                    return;
                }

                InformationScreen.ShowError(res.status);
            });
        };

        this.TrySendMessage = (message) =>
        {   
            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.SEND_MESSAGE, {
                message: message
            }, (res) => {
                if (res.status != statusOK)
                    return InformationScreen.ShowError(res.status);
            });
        };

        this.TrySendReady = () =>
        {
            if (!EnemyPlayer.IsActive())
                return InformationScreen.ShowError(ERRORs.WaitOpponent);

            if (Countdown.IsStarted())
                return;
            
            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.PLAYER_READY);
        };

        this.SendSuccessfulConnection = () =>
        {
            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.PLAYER_CONNECTED_TO_ROOM);
        };

        this.TryShot = (time) =>
        {
            if (!EnemyPlayer.IsActive())
                return InformationScreen.ShowError(ERRORs.WaitOpponent);
            
            if (!Countdown.IsStarted())
                return;
            
            Socket.emit(RPC_MODE.CLIENT_SERVER, CLIENT_RPCs.PLAYER_SHOT, {
                time: time,
                isFalseStart: (Countdown.IsStarted() && !LocalPlayer.CanShoot()) ? true : false
            });
        };
    };

    const RoomsManager = new function() 
    {
        let rooms = {};
        const room_search = Interface.TextElements.RoomName.GetElement();
        const room_pass = Interface.TextElements.RoomPass.GetElement();
        const roomsListID = "#rooms_list_ul";
        const rooms_list = $(roomsListID);
        const roomSearchClearButton = $(".close2-icon");
        const change_nickname = Interface.TextElements.ChangeNickname.GetElement();
        const changeNicknameButton = $(".change-icon");
        const infoOnlinePlayers = $("#players_online");
        const infoOnlineRooms = $("#rooms_count");
        const lockIconClassName = "lock-icon";
        const unlockIconClassName = "unlock-icon";
        const firstInfoElementInRoomsListID = "rooms_list_ul_li_info";
        const canJoinAttrName = "data-canJoin";
        const roomIDAttrName = "data-rid";

        const modifyOnline = (obj, online, limit) =>
        {
            if (online == limit)
            {
                obj.setAttribute(canJoinAttrName, "false");
                return;
            }
            obj.setAttribute(canJoinAttrName, "true");
        };

        const addRoomToList = (name, id, online, limit, pass) =>
        {
            rooms[id] = 1;

            let li = document.createElement("li");
            let img = document.createElement("img");
            let aname = document.createElement("a");
            let aonline = document.createElement("a");

            img.setAttribute("class", (pass) ? lockIconClassName : unlockIconClassName);
            if (name == id)
                aname.innerHTML = "# " + name;
            else
                aname.innerHTML = name;
            aonline.innerHTML = online + " / " + limit;

            li.appendChild(img);
            li.appendChild(aname);
            li.appendChild(aonline);
            li.setAttribute("id", id);
            modifyOnline(li, online, limit);
            rooms_list.append(li);
        };

        const removeRoomInList = (name) =>
        {
            if (!$(`${roomsListID} > li#${name}`).length)
                return;

            $(`${roomsListID} > li#${name}`).remove();
            delete rooms[name];
        };

        const updateRoomsList = () =>
        {
            // @ts-ignore
            let rsv = room_search.val().replace(/#/gi, "").toLowerCase();
            let _rooms_li = $(`${roomsListID} > li:not(:first-child)`); 

            if (!rsv)
            {
                _rooms_li.show();
                return;
            }
            
            for (let i = 0; i < Object.keys(rooms).length; i++) 
            {
                // @ts-ignore
                if (_rooms_li[i].children[1].innerText.toLowerCase().indexOf(rsv) !== -1)
                    $(`${roomsListID} > li#${_rooms_li[i].id}`).show();
                else
                    $(`${roomsListID} > li#${_rooms_li[i].id}`).hide();
            }
        };

        this.CurrentRoom = new function()
        {
            this.id = 0;
            this.name = "";
            this.pass = false;

            this.Set = (id, name, pass) =>
            {
                this.id = id;
                this.name = name;
                this.pass = pass;
            };

            this.Clear = () =>
            {
                this.id = 0;
                this.name = "";
                this.pass = false;
            };
        };

        this.ChangeNickname = (nickname) =>
        {
            if ((nickname.length < 3 || nickname.length > 25))
            {
                change_nickname.val(Server.Cookies.Nickname.Get());
                change_nickname.attr("disabled", "true");
                return InformationScreen.ShowError(ERRORs.IncorrectNickname);
            }
            
            Server.Cookies.Nickname.Set(nickname);
            change_nickname.val(nickname);
            change_nickname.attr("disabled", "true");
        };

        this.UpdateInfo = (players, rooms) => 
        {
            infoOnlinePlayers.text(players);
            infoOnlineRooms.text(rooms);
        };

        this.Reset = () => 
        {
            rooms = {};
            this.CurrentRoom.id = 0;
            this.CurrentRoom.pass = false;
            room_search.val("");
            room_pass.val("");
            roomSearchClearButton.hide();
            updateRoomsList();
            $(`${roomsListID} li:not(:first-child)`).remove();
            this.UpdateInfo(0, 0);
        };

        this.Clear = () =>
        {
            room_search.val("");
            room_search.removeAttr("disabled");
            room_search.removeAttr(roomIDAttrName);
            room_pass.val("");
            // @ts-ignore
            Interface.TextElements.CreateRoom.Update();
            updateRoomsList();
            roomSearchClearButton.hide();
        }

        this.Update = (name, id, online, limit, pass) =>
        {
            if (!rooms.hasOwnProperty(id))
            {
                if (online <= 0)
                    return;
                
                addRoomToList(name, id, online, limit, pass);
                updateRoomsList();
                return;
            }                        

            if (online <= 0)
            {
                removeRoomInList(id);
                updateRoomsList();
                return;
            }  

            let room = $(`${roomsListID} > li#${id}`)[0];
            // @ts-ignore
            room.children[2].innerText = online + " / " + limit;
            modifyOnline(room, online, limit);
            updateRoomsList();
        };

        this.OnCreateRoomClick = () =>
        {   
            if (!room_search.attr(roomIDAttrName))
                return Server.TryCreateRoom(room_search.val().toString(), room_pass.val().toString());

            Server.TryJoinRoom(room_search.attr(roomIDAttrName), room_pass.val());
        };

        changeNicknameButton.click(function() 
        {
            change_nickname.removeAttr("disabled");
            change_nickname.focus();
        });

        change_nickname.blur(function() 
        {
            Server.TryChangeNickname(change_nickname.val());
        });

        roomSearchClearButton.click(function() 
        {
            RoomsManager.Clear();
        });

        room_search.on('input', function() 
        {
            updateRoomsList();

            if ($(this).val() != "")
                return roomSearchClearButton.show();
            
            roomSearchClearButton.hide();
        });

        rooms_list.on("click", "li", function()
        {
            if (this.id == firstInfoElementInRoomsListID)
                return;
            
            if ($(this).attr(canJoinAttrName) == "false")
                return InformationScreen.ShowError(ERRORs.RoomIsFull);
                
            if ($($(this).children()[0]).hasClass(lockIconClassName))
            {
                room_search.val($(this)[0].children[1].innerText);
                room_search.attr(roomIDAttrName, (!this.id) ? 0 : this.id);
                room_search.attr("disabled", "true");
                // @ts-ignore
                Interface.TextElements.CreateRoom.Update(Localization.Get("join-room"));
                roomSearchClearButton.show();
                room_pass.focus();
                updateRoomsList();
                return;
            }

            Server.TryJoinRoom(this.id, false);
        });
    };

    const ScoreManager = new function()
    {
        let score = [0, 0];
        let totalScore = [0, 0];
        let shotsOfPlayers = [0.000, 0.000];
        const maxScore = 5, drawScore = maxScore - 1;
        let startTime = -1;
        let needReset = false;
        const firstScoreText = $(".score1");
        const secondScoreText = $(".score3");
        const drawColor = "#7b8eab";
        const winnerColor = "#4c8dd1";
        const loserColor = "#8e4153";

        const comparisonScore = () => 
        {
            if (score[0] == score[1]) 
            {
                $(firstScoreText).css("color", drawColor);
                $(secondScoreText).css("color", drawColor);
            } 
            else if (score[0] > score[1]) 
            {
                firstScoreText.css("color", winnerColor);
                secondScoreText.css("color", loserColor);
            } 
            else if (score[1] > score[0]) 
            {
                firstScoreText.css("color", loserColor);
                secondScoreText.css("color", winnerColor);
            }

            firstScoreText.text(score[0]);
            secondScoreText.text(score[1]);
        };

        const addScoreToFirstPlayer = () => 
        {
            score[0]++;
            comparisonScore();
        };

        const addScoreToSecondPlayer = () => 
        {
            score[1]++;
            comparisonScore();
        };

        const addTotalScoreToFirstPlayer = () => 
        {
            totalScore[0]++;
        };

        const addTotalScoreToSecondPlayer = () => 
        {
            totalScore[1]++;
        };

        this.GetStartTime = () =>
        {
            return startTime;
        };

        this.SetStartTime = (time) =>
        {
            startTime = time;
        };

        this.IsNeedReset = () =>
        {
            return (needReset) ? true : false;
        };

        this.GetFirstPlayerShotTime = () =>
        {
            return shotsOfPlayers[0];
        };

        this.Reset = (fullReset = false) => 
        {
            needReset = false;
            score = [0, 0];
            shotsOfPlayers = [0.000, 0.000];

            if (fullReset)
                totalScore = [0, 0];

            LocalPlayer.ResetTime();
            EnemyPlayer.ResetTime();
            comparisonScore();
        };

        this.AddShot = (position, serverTime = undefined) =>
        {
            if (!Scene.IsOnlineRoom())
            {
                // @ts-ignore
                shotsOfPlayers[position] = parseFloat((new Date().getTime() - startTime) / 1000).toFixed(3);
            }
            else
            {
                // @ts-ignore
                shotsOfPlayers[position] = parseFloat((parseInt(serverTime)) / 1000).toFixed(3);
            }

            GameLogic.GetPlayerByPosition(position).SetTime(shotsOfPlayers[position]);

            if (shotsOfPlayers[0] != 0 && shotsOfPlayers[1] != 0)
            {
                if (shotsOfPlayers[0] < shotsOfPlayers[1])
                {
                    addScoreToFirstPlayer();
                    GameLogic.GetPlayerByPosition(0).ShowWinAnimation();
                    GameLogic.GetPlayerByPosition(1).ShowLoseAnimation();
                    Chat.AddMessage(`${GameLogic.GetPlayerByPosition(0).GetName()} ${Localization.Get("shot-earlier")} [${shotsOfPlayers[0]} < ${shotsOfPlayers[1]}]`);
                } 
                else if (shotsOfPlayers[0] > shotsOfPlayers[1]) 
                {
                    addScoreToSecondPlayer();
                    GameLogic.GetPlayerByPosition(1).ShowWinAnimation();
                    GameLogic.GetPlayerByPosition(0).ShowLoseAnimation();
                    Chat.AddMessage(`${GameLogic.GetPlayerByPosition(1).GetName()} ${Localization.Get("shot-earlier")} [${shotsOfPlayers[0]} > ${shotsOfPlayers[1]}]`);
                } 
                else if (shotsOfPlayers[0] == shotsOfPlayers[1]) 
                {
                    GameLogic.GetPlayerByPosition(0).ShowDrawAnimation();
                    GameLogic.GetPlayerByPosition(1).ShowDrawAnimation();
                    Chat.AddMessage(`${Localization.Get("both-plus-to-the-score")} [${shotsOfPlayers[0]} == ${shotsOfPlayers[1]}]`);
                }

                GameLogic.GameMode.AfterRound();
                Interface.GameElements.ReactionBtn.removeClass("reaction-btn-go");
                Interface.GameElements.MainLabel.text("Web Duel");
                Countdown.IsStarted(false);
                shotsOfPlayers = [0.000, 0.000];
            }
        };

        this.CheckFinish = (isFastFinish = false) =>
        {
            let totalScoreText;
            if (isFastFinish && (score[0] != 0 || score[1] != 0))
            {
                if (needReset)
                    return;
                
                if (!LocalPlayer.GetPosition())
                    addTotalScoreToFirstPlayer();
                else
                    addTotalScoreToSecondPlayer();

                Chat.AddMessage(`${LocalPlayer.GetName()} ${Localization.Get("wins-this-match")} [${score[0]} : ${score[1]}]. ${Localization.Get("total-score")} [${totalScore[0]} : ${totalScore[1]}]. ${Localization.Get("win-because-enemy-left")}`);
                InformationScreen.ShowFightResult(true);
                needReset = false;
                this.Reset(true);
            }
            else if (score[0] == drawScore && score[1] == drawScore)
            {
                Chat.AddMessage(`${Localization.Get("fight-is-ended-draw")} [${score[0]} : ${score[1]}]. ${Localization.Get("total-score")} [${totalScore[0]} : ${totalScore[1]}]`);
                InformationScreen.ShowFightResult(true);
                needReset = true;
            }
            else if (score[0] >= maxScore)
            {
                addTotalScoreToFirstPlayer();
                Chat.AddMessage(`${GameLogic.GetPlayerByPosition(0).GetName()} ${Localization.Get("wins-this-match")} [${score[0]} : ${score[1]}]. ${Localization.Get("total-score")} [${totalScore[0]} : ${totalScore[1]}]`);
                InformationScreen.ShowFightResult((GameLogic.GetPlayerByPosition(0) == LocalPlayer));
                needReset = true;
            }
            else if (score[1] >= maxScore)
            {
                addTotalScoreToSecondPlayer();
                Chat.AddMessage(`${GameLogic.GetPlayerByPosition(1).GetName()} ${Localization.Get("wins-this-match")} [${score[0]} : ${score[1]}]. ${Localization.Get("total-score")} [${totalScore[0]} : ${totalScore[1]}]`);
                InformationScreen.ShowFightResult((GameLogic.GetPlayerByPosition(1) == LocalPlayer));
                needReset = true;
            }
        };
    };

    const Countdown = new function () 
    {
        let counter = 4;
        let isStarted = false;

        const checkReady = () =>
        {
            if (!LocalPlayer.IsActive() || !EnemyPlayer.IsActive() || !LocalPlayer.ButtonReady.isReady() || !EnemyPlayer.ButtonReady.isReady() || Scene.IsMenu()) 
            {
                this.ResetCounter();
                return false;
            }
            return true;
        }

        const attention = (interval, serverTimeout) =>
        {
            Interface.GameElements.MainLabel.text(Localization.Get("attention"));

            setTimeout(function ()
            {
                if (!checkReady())
                {
                    clearInterval(interval);
                    return;
                }
                SoundManager.Sounds.Go.Play();
            }, 300);

            setTimeout(function ()
            {
                if (!checkReady())
                {
                    clearInterval(interval);
                    return;
                }
                SoundManager.Sounds.Start.Play();
                Interface.GameElements.MainLabel.text(Localization.Get("fire"));
                Interface.GameElements.ReactionBtn.addClass("reaction-btn-go");
                LocalPlayer.CanShoot(true);
                EnemyPlayer.CanShoot(true);
                ScoreManager.SetStartTime(new Date().getTime());
                if (Scene.IsBot())
                    // @ts-ignore
                    GameLogic.GameMode.AutoShot();
                return;
            }, serverTimeout);

            clearInterval(interval);
        };

        this.IsStarted = (bool = undefined) =>
        {
            if (bool == undefined)
                return isStarted;
            
            isStarted = bool;
        };

        this.ResetCounter = () => 
        {
            counter = 4;
            isStarted = false;
            LocalPlayer.ClearAndRotate();
            EnemyPlayer.ClearAndRotate();
            Interface.GameElements.ReactionBtn.removeClass("reaction-btn-go");
            Interface.GameElements.MainLabel.text("Web Duel");
        };

        this.Start = (serverTimeout = Utils.Random(1250, 3000)) => 
        {
            if (!checkReady())
            {
                return;
            }

            this.ResetCounter();
            isStarted = true;

            let t = setInterval(function ()
            {
                if (!checkReady())
                {
                    clearInterval(t);
                    return;
                }

                counter--;
                if (counter <= 0)
                {
                    attention(t, serverTimeout);
                    return;
                }
                Interface.GameElements.MainLabel.text(counter);
                SoundManager.Sounds.Siren.Play();
            }, 2000); 
        };
    };

    const Chat = new function() 
    {
        let messagesList = [];

        const chat = $("#chat_div");
        const chatText = $("#chat_area");
        const inputField = $("#send_message");

        this.MoveTo = (scene) =>
        {
            switch(scene)
            {
                case SCENEs.OnlineMenu:
                    chat.appendTo(Interface.GameElements.OnlineMenuChatDiv);
                    break;
                case SCENEs.Local:
                case SCENEs.Bot:
                case SCENEs.OnlineRoom:
                    chat.appendTo(Interface.GameElements.CenterGameElementsDiv);
                    break;
                default:
                    return InformationScreen.ShowError(`Can't move chat to this scene => (${scene})`);
            }
        };
        
        this.SetActive = (state) =>
        {
            if (state)
            {
                inputField.prop("disabled", false).attr("placeholder", Localization.Get("chat-input-online"));
                return;
            }
            inputField.prop("disabled", true).attr("placeholder", Localization.Get("chat-input-offline"));
        };

        this.SetMessages = (messages) =>
        {
            messagesList = messages;
        };

        this.AddMessage = (message = undefined, author, time = undefined) => 
        {
            let chatArray = chatText.val().toString().split("\n");
            if (chatArray.length > 25)
            {
                for (let i = 0; i < chatArray.length; )
                {
                    chatArray[i] = chatArray[++i];
                }
                chatArray[chatArray.length - 1] = $.trim("[" + ((!time) ? (new Date()).toLocaleTimeString() : (new Date(time)).toLocaleTimeString()) + "]" + ((author) ? " " + author : "") + ": " + message);
                chatText.val("").val(chatArray.join("\n")).scrollTop(chatText[0].scrollHeight - chatText.height());
                return;
            }
            chatText.val($.trim(chatText.val() + "\n[" + ((!time) ? (new Date()).toLocaleTimeString() : (new Date(time)).toLocaleTimeString()) + "]" + ((author) ? " " + author : "") + ": " + message))
                .scrollTop(chatText[0].scrollHeight - chatText.height());
        };

        this.NewServerMessage = (message) =>
        {
            messagesList.push(message);
        };

        this.LoadHistory = () =>
        {
            this.Clear();
            for (let i in messagesList)
            {
                let message = messagesList[i];
                this.AddMessage(message.text, message.author, message.time);
            }
            chatText.scrollTop(chatText[0].scrollHeight - chatText.height());
            
            if (Scene.IsMenu())
                return Chat.AddMessage(`%chat-menu-say-hi% ${Server.Cookies.Nickname.Get()}!`.replace("%chat-menu-say-hi%", Localization.Get("chat-menu-say-hi")));
            if (Scene.IsOnlineRoom())
                return Chat.AddMessage(`%chat-room-say-hi% ${(RoomsManager.CurrentRoom.pass) ? RoomsManager.CurrentRoom.pass : "false"}`.replace("%chat-room-say-hi%", Localization.Get("chat-room-say-hi").replace("%ROOM_NAME%", RoomsManager.CurrentRoom.name)));
        };

        this.SendMessage = (message) =>
        {
            message = message.trim();
            if (message.length < 1)
                return inputField.val("");
            if (message.length > 120)
                return InformationScreen.ShowError(ERRORs.IncorrectMessage);
            
            Server.TrySendMessage(message);
            inputField.val("");
        };

        this.Clear = () => {
            chatText.val("");
            inputField.val("");
        };

        inputField.keyup((e) => {
            if (e.keyCode == 13)
                this.SendMessage(inputField.val());
        });
    };

    const SoundManager = new function() 
    {
        const volumeRange = $("#fast_volume_range, #settings_volume_range");
        const volumeValue = $("#fast_volume_value, #settings_volume_value"); 
        const volumeTrigger = $('.volume-icon'); 
        const dir = "sounds/";
        const imgClassVolumeOff = "volume-icon-off";
        const imgClassVolumeOn = "volume-icon-on";
        const defaultVolume = 0.4;
        let playerVolume = Server.Cookies.Volume.Get();

        const updateVolumeIcon = (isOn) =>
        {
            if (isOn)
                return volumeTrigger.removeClass(imgClassVolumeOff).addClass(imgClassVolumeOn);
            
            volumeTrigger.removeClass(imgClassVolumeOn).addClass(imgClassVolumeOff);
        };

        const MyAudio = function(url)
        {
            this.audio = new Audio(dir + url);

            this.Play = () =>
            {
                this.audio.currentTime = 0;
                this.audio.play();
            };
        };
        
        this.Sounds = {
            Shot1: new MyAudio("fire.m4a"),
            Shot2: new MyAudio("fire2.mp3"),
            Shot3: new MyAudio("fire3.mp3"),
            Shot4: new MyAudio("fire4.wav"),
            Siren: new MyAudio("alert.mp3"),
            Go: new MyAudio("warning.mp3"),
            Start: new MyAudio("start.m4a"),
            Fail: new MyAudio("fail.m4a"),
            Join: new MyAudio("player_join.mp3"),
            Leave: new MyAudio("player_leave.mp3"),
        };

        this.PlayRandomShot = () =>
        {
            switch(Utils.Random(1, 4))
            {
                case 1:
                    this.Sounds.Shot1.Play();
                    break;
                case 2:
                    this.Sounds.Shot2.Play();
                    break;
                case 3:
                    this.Sounds.Shot3.Play();
                    break;
                case 4:
                    this.Sounds.Shot4.Play();
                    break;
            };
        };

        this.SetVolume = (volume) =>
        {
            if (volume == -1)
                volume = defaultVolume;
            
            for (let key in this.Sounds)
            {
                this.Sounds[key].audio.volume = volume;
            }
            volumeValue.html(volume);
            volumeRange.val(volume);
            if (volume <= 0)
                updateVolumeIcon(false);
            else 
                updateVolumeIcon(true);
            Server.Cookies.Volume.Set(volume);
        };

        if (playerVolume == undefined)
            this.SetVolume(defaultVolume);
        else
            this.SetVolume(playerVolume);

        volumeRange.on('input', function()
        {
            // @ts-ignore
            volumeValue.html(this.value);
            // @ts-ignore
            SoundManager.SetVolume(this.value);
        });

        volumeTrigger.click(function() 
        {
            if ($(this).hasClass(imgClassVolumeOn)) 
            {
                SoundManager.SetVolume(0);
                return;
            }
            
            SoundManager.SetVolume(-1);
        });
    };

    const Localization = new function() 
    {
        const defaultLanguage = LanguageReplacement.LANGUAGES.Ukraine;
        const settingsLanguagesListID = "#settings_language_ul";
        const settingsLanguagesList = $(`${settingsLanguagesListID}`);
        const languageDataAttr = "data-language";
        let currentLanguage = (Server.Cookies.Language.Get() == undefined) ? defaultLanguage : Server.Cookies.Language.Get();

        const addLanguageToList = (name, isCurrentLanguage) =>
        {
            let li = document.createElement("li");
            let aname = document.createElement("a");

            aname.innerHTML = name;

            li.appendChild(aname);
            li.setAttribute("class", "settings-language-ul-li");
            li.setAttribute(languageDataAttr, name);

            if (isCurrentLanguage)
                li.classList.add("settings-language-ul-li-current");

            settingsLanguagesList.append(li);
        };

        const updateLanguagesListInSettings = () =>
        {
            $(`${settingsLanguagesListID} > li`).remove();

            for (let key in LanguageReplacement.LANGUAGES)
            {
                let isCurrentLanguage = false;

                if (LanguageReplacement.LANGUAGES[key] == currentLanguage)
                    isCurrentLanguage = true;
                
                addLanguageToList(LanguageReplacement.LANGUAGES[key], isCurrentLanguage);
            }
        };

        this.Get = (value) =>
        {
            if (LanguageReplacement.VALUES[currentLanguage][value])
                return LanguageReplacement.VALUES[currentLanguage][value];
            
            return value;
        };

        this.Set = (language) =>
        {
            if (!LanguageReplacement.LANGUAGES[language])
            {
                InformationScreen.ShowError("Your language not found!");

                currentLanguage = defaultLanguage;
            }
            
            InformationScreen.ShowLoading(function () 
            {
                currentLanguage = language;
                Server.Cookies.Language.Set(language);
                Interface.UpdateTextElements();
                updateLanguagesListInSettings();
                InformationScreen.Close();
            });
        };

        this.Initialize = () =>
        {
            if (currentLanguage == undefined)
                return this.Set(defaultLanguage);
            
            this.Set(currentLanguage);
        };

        settingsLanguagesList.on("click", "li", function() 
        {
            Localization.Set($(this).attr(languageDataAttr));
        });
    };

    Localization.Initialize();
});