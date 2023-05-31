const express = require('express');
const app     = express();
const http    = require('http');
const server  = http.Server(app);
const io      = require('socket.io')(server, 
{
    cors: 
    {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});
const fs = require('fs');
const port = 777;

const RPC_MODE = {
    CLIENT_SERVER: "CLIENT_SERVER",
    SERVER_TO_ALL: "SERVER_TO_ALL",
    SERVER_CLIENT: "SERVER_CLIENT",
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
    PLAYER_FALSE_START: "PLAYER_FALSE_START",
    ROUND_RESULT: "ROUND_RESULT",
    RESET_READY: "RESET_READY",
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
};

const Player = function (socket)
{
    this.socket = socket;
    this.socketID = this.socket.client.id;
    this.name = undefined;
    this.room = undefined;
    this.position = undefined;
    this.isReady = false;

    this.ChangeNickname = (nickname) =>
    {
        return this.name = (!nickname || nickname.length < 3 || nickname.length > 25) ? `guest${random(0, 100000)}` : escapeHtml(nickname);
    };

    this.CreateRoom = (name, pass) =>
    {
        if (this.room.id != Server.GlobalRoomID)
            return callback({
                status: ERRORs.PlayerInTheRoom
            });
        
        name = escapeHtml(name.replace(/\s+/g, " "));
            
        let generatedRoomId;
        do {
            generatedRoomId = random(1, 10000).toString();
        }
        while (Server.GetRoom(generatedRoomId));

        if (name.length > 0 && name.length < 3 || name.length > 25)
            return ERRORs.IncorrectRoomName;
        if (!name)
            name = generatedRoomId;
        if (Server.GetRoomByName(name))
                return ERRORs.RoomAlreadyExists;

        Server.CreateRoom(name, generatedRoomId, pass);
        
        let joinRoomResult = this.JoinToRoom(generatedRoomId, pass, 0);
        if (joinRoomResult.status != "OK")
            return joinRoomResult;

        return {id: generatedRoomId, name: name, pass: pass, messages: joinRoomResult.messages};
    };

    this.JoinToRoom = (roomID, roomPass, position = undefined) =>
    {
        let room = Server.GetRoom(roomID);
        if (!room)
            return { status: ERRORs.RoomNotFound };
        if (room.id == Server.GlobalRoomID || this.room.id != Server.GlobalRoomID)
            return { status: ERRORs.PlayerInTheRoom };
        if (room.pass != roomPass)
            return { status: ERRORs.IncorrectRoomPass };
        if (room.GetOnline() >= room.limit)
            return { status: ERRORs.RoomIsFull };

        if (this.room.id == Server.GlobalRoomID)
            this.ExitFromRoom();

        this.room = room;
        this.room.players[this.socketID] = this;
        this.isReady = false;

        let _enemyPlayer = undefined;
        if (position === undefined)
        {
            if (Object.keys(this.room.players).length)
            {
                _enemyPlayer = Object.values(this.room.players)[0];
                this.position = !_enemyPlayer.position;
            }
            else
                this.position = 0;
        }
        else
        {
            this.position = position;
        }
        
        this.socket.join(roomID);
        Server.SendNewPlayer(this);
        console.log(`Player ${this.name} joined to room ${this.room.name}.`);
        return {status: "OK", messages: this.room.messages, room: {
            id: this.room.id,
            pass: this.room.pass,
            name: this.room.name,
            position: this.position,
            enemyPlayer: (_enemyPlayer !== undefined) ? {
                name: _enemyPlayer.name,
                position: _enemyPlayer.position
            } : undefined
        }};
    };

    this.ExitFromRoom = () =>
    {   
        if (this.room)
        {
            if (this.room.id != Server.GlobalRoomID)
                this.room.ResetReady();
            Server.RemovePlayerFromRoom(this.room.id, this.socketID); 
            Server.SendPlayerDisconnected(this);

            if (this.room.id != Server.GlobalRoomID && this.room.GetOnline() <= 0)
            {
                Server.RemoveRoom(this.room.id);
            }
            else
                this.room.CheckPlayersReady();
        }

        this.room = null;  
        this.position = undefined; 
        this.socket.leaveAll();
        Server.UpdateOnline((this.room) ? this.room.id : undefined);
    };

    this.SendMessage = (message) =>
    {
        if (!this.room)
            return;
        
        Server.AddNewMessageToRoom(message, this.room.id, this.name);
    };

    this.SwitchReady = () =>
    {
        if (!this.room || this.room.id == Server.GlobalRoomID)
            return;

        if (this.room.GetOnline() != this.room.limit)
            return;
            
        this.isReady = !this.isReady;
        if (!this.isReady)
        {
            this.room.ResetReady();
            return;
        }

        io.in(this.room.id).emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.PLAYER_READY, {
            ready: this.isReady,
            position: this.position
        });

        if (this.room.CheckPlayersReady())
            Server.SendFireTime(this.room.id);
    };
}

const Room = function (name, id, pass)
{
    this.id = id;
    this.name = name;
    this.players = {};
    this.limit = 2;
    this.pass = (!pass) ? false : pass;
    this.messages = [];

    this.GetOnline = () => 
    { 
        return Object.keys(this.players).length; 
    };

    this.CheckPlayersReady = () =>
    {
        if (Object.keys(this.players).length != this.limit)
            return false;
        
        for (let key in this.players)
        {
            if (!this.players[key].isReady)
                return false;
        }
        return true;
    };

    this.ResetReady = (isFalseStart = false, position = undefined) =>
    {
        for (let key in this.players)
        {
            this.players[key].isReady = false;
        }
            
        io.in(this.id).emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.RESET_READY, {
            isFalseStart: isFalseStart,
            position: position
        });
    };
}

const Message = function(time, text, author)
{
    this.time = time;
    this.text = text;
    this.author = author;
};

const Server = new function()
{
    this.rooms = {};
    this.players = {};
    this.GlobalRoomID = "GLOBAL";

    this.GetRoomsCount = () => 
    {
        return Object.keys(this.rooms).length - 1
    };

    this.GetPlayersCount = () => 
    {
        return Object.keys(this.players).length
    };

    this.AddPlayer = (socket) =>
    {
        this.players[socket.client.id] = new Player(socket);
        this.UpdateOnline();
        return this.players[socket.client.id];
    };

    this.GetPlayer = (socketID) =>
    {
        return this.players[socketID];
    };

    this.RemovePlayer = (socketID) =>
    {
        delete this.players[socketID];
        this.UpdateOnline();
    };

    this.RemovePlayerFromRoom = (roomID, socketID) =>
    {
        delete this.rooms[roomID].players[socketID];
        this.UpdateOnline(roomID);
    };

    this.GetRoom = (id) =>
    {
        if (this.rooms[id])
            return this.rooms[id];
        
        return undefined;
    };

    this.GetRoomByName = (name) =>
    {
        for (let roomID in this.rooms)
        {
            if (this.rooms[roomID].name.toLowerCase() == name.toLowerCase())
                return this.rooms[roomID];
        }
        return undefined;
    };

    this.CreateRoom = (name, roomID, pass) =>
    {
        this.rooms[roomID] = new Room(name, roomID, pass.trim());
    };

    this.RemoveRoom = (roomID) =>
    {
        delete this.rooms[roomID];
    };

    this.CreateGlobalRoom = () =>
    {
        this.rooms[this.GlobalRoomID] = new Room(this.GlobalRoomID, this.GlobalRoomID, generateID());
        this.GetRoom(this.GlobalRoomID).limit = Infinity;
    };

    this.AddPlayerToGlobalRoom = (Player) =>
    {
        let room = this.GetRoom(this.GlobalRoomID);
        Player.room = room;
        room.players[Player.socketID] = Player;
        Player.socket.leaveAll();
        Player.socket.join(this.GlobalRoomID);
        this.UpdateFullOnline(Player.socket);
    };

    this.UpdateOnline = (roomID = undefined) =>
    {
        let room = (roomID && roomID != this.GlobalRoomID) ? this.GetRoom(roomID) : undefined;
        io.in(this.GlobalRoomID).emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.UPDATE_ONLINE, {
            players: this.GetPlayersCount(),
            rooms: this.GetRoomsCount(),
            room: (room) ? {
                id: room.id,
                name: room.name,
                limit: room.limit,
                online: room.GetOnline(),
                pass: (room.pass) ? true : false
            } : undefined
        });
    };

    this.UpdateFullOnline = (socket) =>
    {
        let rooms_array = [];

        for (let roomID in this.rooms)
        {
            let room = this.rooms[roomID];

            if (room.id == this.GlobalRoomID)
                continue;
            
            rooms_array.push({
                id: room.id,
                name: room.name,
                online: room.GetOnline(),
                limit: room.limit,
                pass: (room.pass) ? true : false
            });
        }

        socket.emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.UPDATE_FULL_ONLINE, {
            rooms: rooms_array,
            rooms_online: this.GetRoomsCount(),
            players_online: this.GetPlayersCount()
        });
    };

    this.SendMessageToRoom = (roomID, message) =>
    {
        io.in(roomID).emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.NEW_ROOM_MESSAGE, {
            message: message
        });
    };

    this.AddNewMessageToRoom = (message, id, author) =>
    {
        let room = this.GetRoom(id);
        if (!room)
            return;

        let messages = this.GetRoom(id).messages;
        let newMessage = new Message(new Date().getTime(), escapeHtml(message).trim(), author);

        if (messages.length >= 25)
        {
            for (let i = 0; i < messages.length; )
            {
                messages[i] = messages[++i];
            }
            messages[messages.length - 1] = newMessage;
            this.SendMessageToRoom(id, newMessage);
            return;
        }

        messages.push(newMessage);
        this.SendMessageToRoom(id, newMessage);
    };

    this.GetChatHistoryFromRoom = (roomID) =>
    {
        let room = this.GetRoom(roomID);

        if (!this.GetRoom(roomID))
            return [];
        
        return room.messages;
    };

    this.SendNewPlayer = (Player) =>
    {
        if (Player.room.id == Server.GlobalRoomID)
            return;

        Player.socket.broadcast.to(Player.room.id).emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.NEW_PLAYER_IN_ROOM, {
            name: Player.name,
            position: Player.position
        });
    };

    this.SendPlayerDisconnected = (Player) =>
    {
        if (Player.room.id == Server.GlobalRoomID)
            return;
        
        Player.socket.broadcast.to(Player.room.id).emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.PLAYER_DISCONNECTED, {
            name: Player.name
        });
    };

    this.AddShotToRoom = (Player, time, isFalseStart = false) =>
    {
        if (!Player.room || Player.room.id == this.GlobalRoomID)
            return;
        
        if (isFalseStart)
            Player.room.ResetReady(true, Player.position);

        Player.isReady = false;
        
        io.in(Player.room.id).emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.PLAYER_SHOT, {
            time: time,
            position: Player.position
        });
    };

    this.SendFireTime = (roomID) =>
    {
        io.in(roomID).emit(RPC_MODE.SERVER_CLIENT, SERVER_RPCs.NEW_FIRE_TIME, {
            time: random(1250, 3000)
        });
    };
};

Server.CreateGlobalRoom();

server.listen(port);
MyLog("n", "Server was started.\n");

io.on('connection', function(socket) 
{
    const SocketPlayer = Server.AddPlayer(socket);

    Server.AddPlayerToGlobalRoom(SocketPlayer);

    socket.on(RPC_MODE.CLIENT_SERVER, async function(CLIENT_RPC, data, callback)
    {
        switch (CLIENT_RPC)
        {
            case CLIENT_RPCs.CONNECTION_BY_LINK:
                let joinRoomResult = SocketPlayer.JoinToRoom(data.id, data.pass);
                callback({
                    status: joinRoomResult.status,
                    nickname: SocketPlayer.ChangeNickname(data.nickname),
                    messages: joinRoomResult.messages,
                    room: joinRoomResult
                });
            break;

            case CLIENT_RPCs.DEFAULT_CONNECTION:
                callback({
                    status: "OK",
                    nickname: SocketPlayer.ChangeNickname(data.nickname),
                    messages: Server.GetChatHistoryFromRoom(SocketPlayer.room.id)
                });
                console.log(`Player ${SocketPlayer.name} connected to server.`);
            break;

            case CLIENT_RPCs.CHANGE_NICKNAME:
                let oldName = SocketPlayer.name;
                callback({
                    status: "OK",
                    nickname: SocketPlayer.ChangeNickname(data.nickname)
                });
                console.log(`Player changed nickname ${oldName} -> ${SocketPlayer.name}`);
            break;

            case CLIENT_RPCs.CREATE_ROOM:
                let room_options = SocketPlayer.CreateRoom(data.name, data.pass);

                if (typeof room_options != "object")
                    return callback({
                        status: room_options
                    });

                console.log(`Player ${SocketPlayer.name} created room: ${room_options.name}, pass: ${room_options.pass}`);

                callback({
                    status: "OK",
                    room_options: room_options
                });
            break;

            case CLIENT_RPCs.LEAVE_ROOM:
                console.log(`Player ${SocketPlayer.name} leave from room ${SocketPlayer.room.name}.`);
                SocketPlayer.ExitFromRoom();
                Server.AddPlayerToGlobalRoom(SocketPlayer);
                callback({
                    status: "OK",
                    messages: Server.GetChatHistoryFromRoom(SocketPlayer.room.id)
                });
                Server.UpdateFullOnline(SocketPlayer.socket);
            break;

            case CLIENT_RPCs.JOIN_ROOM:
                let joinRoomResult2 = SocketPlayer.JoinToRoom(data.id, data.pass);
                callback({
                    status: joinRoomResult2.status,
                    messages: joinRoomResult2.messages,
                    room: joinRoomResult2.room
                });

                if (joinRoomResult2.status == "OK")
                    console.log(`Player ${SocketPlayer.name} joined to room ${joinRoomResult2.room.name}.`);
            break;

            case CLIENT_RPCs.SEND_MESSAGE:
                if (data.message.length < 1 || data.message.length > 120)
                    callback({
                        status: ERRORs.IncorrectMessage
                    });
                
                SocketPlayer.SendMessage(data.message);
                console.log(`Player ${SocketPlayer.name} in room ${SocketPlayer.room.name} send message: ${data.message}.`);
            break;

            case CLIENT_RPCs.PLAYER_READY:
                SocketPlayer.SwitchReady();
                break;

            case CLIENT_RPCs.PLAYER_CONNECTED_TO_ROOM:
                if (SocketPlayer.room && SocketPlayer.room.id != Server.GlobalRoomID)
                    Server.UpdateOnline(SocketPlayer.room.id);
                break;

            case CLIENT_RPCs.PLAYER_SHOT:
                    Server.AddShotToRoom(SocketPlayer, data.time, data.isFalseStart);
                break;
        }        
    });

    socket.on('disconnect', function()
    {
        SocketPlayer.ExitFromRoom();
        Server.RemovePlayer(SocketPlayer.socketID);

        console.log(`Player ${SocketPlayer.name} disconnected from the server.`);
    });
});


function MyLog(_type, _text) 
{
    if (_type == "w") 
    {
        fs.appendFile('log.log', _text, function (err) 
        {
            if (err) throw err;
        });
    } 
    else if (_type == "n") 
    {
        fs.writeFile('log.log', _text, function (err) 
        {
            if (err) 
                throw err;
        });
    }
    console.log(_text);
}

function generateID() 
{
    let result       = '';
    let words        = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    let max_position = words.length - 1;
    for( i = 0; i <= 10; ++i ) 
    {
        position = Math.floor (Math.random() * max_position);
        result = result + words.substring(position, position + 1);
    } 
    return result;   
}

function escapeHtml(text) 
{
    let map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function random(min, max) 
{
    return Math.round(Math.random() * (max - min) + min);
}