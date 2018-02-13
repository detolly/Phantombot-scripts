//Code courtesy of tSparkles (https://twitch.tv/tSparkles)
//I do commissions for free because learning is fun

(function () {
    var client_id = "m4rybj39stievswbum8069zxhxl5y4";
    var channel = "thmcs";
    //  todo list:
    //      1. get game and use that string for the gameName.
    //      2. get title and check for category.

    /**
    * @event command
    */
    $.bind('command', function(event) {

        var command = event.getCommand();
        var sender = event.getSender();
        var arguments = event.getArguments();
        var args = event.getArgs();
        
        if (command.equalsIgnoreCase('wrhelp')) {
            $.say("Syntax: !wr [Game name abbreviation] [Category]. If not specified, it will look for a category in the title or the game as the current game. Both arguments must be one word.");
        }

        if (command.equalsIgnoreCase('wr')) {
            var twitchChannelObject = getTwitchObject("https://api.twitch.tv/kraken/channels/" + channel);
            if (args.length > 0) {
                var gameName = args[0]; //yes I know this is wrong but who cares beacuse var is global scope xDDDDDDDDDDDDDDDDDDDDDDDDDD
            } else if (twitchChannelObject) {
                var gameName = twitchChannelObject.game;
            }
            var gameReturned = httpGet("https://www.speedrun.com/api/v1/games?name=" + gameName);
            var gameJson = JSON.parse(gameReturned)["data"];
            try {
                var gameId = gameJson[0].id;
            } catch (a) {
                $.say("Game was not found.");
            }

            var categoryReturned = httpGet("https://www.speedrun.com/api/v1/games/" + gameId + "/categories");
            var categoryJson = JSON.parse(categoryReturned);

            var categoryIndex = 0;

            if (args.length > 1) {
                for(var i = 0; i < categoryJson["data"].length; i++) {
                    if ((categoryJson["data"][i].name).toLowerCase().includes((args[1]).toLowerCase()) && categoryJson["data"][i].type == "per-game") {
                        categoryIndex = i;
                    }
                }
            } else if (twitchChannelObject) {
                for(var i = 0; i < categoryJson["data"].length; i++) {
                    if ((twitchChannelObject.status).toLowerCase().includes((categoryJson["data"][i].name).toLowerCase()) && categoryJson["data"][i].type == "per-game") {
                        categoryIndex = i;
                    }
                }
            }

            try {
                var idToUse = categoryJson["data"][categoryIndex].id;
            } catch (a) {
                $.say("Something weird happened. Found no categories??");
            }

            var runsReturned = httpGet("https://www.speedrun.com/api/v1/leaderboards/" + gameId + "/category/" + idToUse);
            var runsJson = JSON.parse(runsReturned);

            var userReturned = httpGet("https://www.speedrun.com/api/v1/users/" + runsJson.data.runs[0].run.players[0].id);
            var userJson = JSON.parse(userReturned);

            var user = userJson.data.names.international;

            var seconds = runsJson.data.runs[0].run.times.primary_t;
            var hours = new java.lang.String(Math.floor(seconds / 3600));
            var minutes = new java.lang.String(Math.floor((seconds / 60) % 60));
            var newSeconds = new java.lang.String(seconds % 60);

            if ((newSeconds.length + "") == 1) newSeconds = "0" + newSeconds;
            if ((minutes + "").length == 1) minutes = "0" + minutes;
            if ((hours + "").length == 1) hours = "0" + hours;

            $.say("The wr in " + gameJson[0].names.international + " " +  categoryJson["data"][categoryIndex].name + " is " + (hours + ":" + minutes + ":" + newSeconds) + " by " + user + ". Run page: " + runsJson.data.runs[0].run.weblink);
        }

        if (command.equalsIgnoreCase('pb')) {
            var twitchChannelObject = getTwitchObject("https://api.twitch.tv/kraken/channels/" + channel);

            var userToSearchFor = httpGet("https://www.speedrun.com/api/v1/users?lookup=" + args[0]);
            var userToSearchForJson = JSON.parse(userToSearchFor);
            var userId = userToSearchForJson.data[0].id;

            if (args.length > 1) {
                var gameName = args[1]; //yes I know this is wrong but who cares beacuse var is global scope xDDDDDDDDDDDDDDDDDDDDDDDDDD
            } else if (twitchChannelObject) {
                var gameName = twitchChannelObject.game;
            }

            var gameReturned = httpGet("https://www.speedrun.com/api/v1/games?name=" + gameName);
            var gameJson = JSON.parse(gameReturned)["data"];
            try {
                var gameId = gameJson[0].id;
            } catch (a) {
                $.say("Game was not found.");
            }

            var categoryReturned = httpGet("https://www.speedrun.com/api/v1/games/" + gameId + "/categories");
            var categoryJson = JSON.parse(categoryReturned);

            var categoryIndex = 0;

            if (args.length > 2) {
                for(var i = 0; i < categoryJson["data"].length; i++) {
                    if ((categoryJson["data"][i].name).toLowerCase().includes((args[2]).toLowerCase()) && categoryJson["data"][i].type == "per-game") {
                        categoryIndex = i;
                    }
                }
            } else if (twitchChannelObject) {
                for(var i = 0; i < categoryJson.data.length; i++) {
                    if ((twitchChannelObject.status).toLowerCase().includes((categoryJson["data"][i].name).toLowerCase()) && categoryJson["data"][i].type == "per-game") {
                        categoryIndex = i;
                    }
                }
            }


            //$.say(categoryJson["data"][categoryIndex].type);
            var idToUse = categoryJson.data[categoryIndex].id;
            var pbReturne = httpGet("https://www.speedrun.com/api/v1/users/" + userId + "/personal-bests?game=" + gameId);
            var pbReturned = JSON.parse(pbReturne);

            var yeet = -1;
            for(var i = 0; i < pbReturned.data.length; i++) {
                if (pbReturned.data[i].run.category == idToUse && pbReturned.data[i].run.level == null) {
                    yeet = i;
                    break;
                }
            }

            if (yeet == -1) {
                $.say("Can't find PB in that category! (" + categoryJson.data[categoryIndex].name + ")");
                return;
            }

            var seconds = pbReturned.data[yeet].run.times.primary_t;
            var hours = new java.lang.String(Math.floor(seconds / 3600));
            var minutes = new java.lang.String(Math.floor((seconds / 60) % 60));
            var newSeconds = new java.lang.String(seconds % 60);

            if ((newSeconds.length + "") == 1) newSeconds = "0" + newSeconds;
            if ((minutes + "").length == 1) minutes = "0" + minutes;
            if ((hours + "").length == 1) hours = "0" + hours;
            
            $.say(userToSearchForJson.data[0].names.international + "\'s PB in " + gameJson[0].names.international + " " + categoryJson["data"][categoryIndex].name + " is " + (hours + ":" + minutes + ":" + newSeconds) + ". Run page: " + pbReturned.data[yeet].run.weblink);
        }
    });

    /**
     * @function httpGet
     */
    function httpGet(theUrl)
    {
        try {
        var resourceURL = new java.net.URL(theUrl);
        var urlConnection = resourceURL.openConnection();
        urlConnection.setRequestProperty("Client-ID", client_id);
        var inputStream = new java.io.InputStreamReader(urlConnection.getInputStream());
        var bufferedReader = new java.io.BufferedReader(inputStream);
        var inputLine = bufferedReader.readLine();
        bufferedReader.close();
        var jsString = String(inputLine);
        return jsString;
        } catch(a) {
            $.say("API didn't want us to see miklSad try again miklG");
            //$.say("Server returned error: " + a);
        }
    }

    /**
     * @function getTwitchObject
     */
    function getTwitchObject(url) {
        var resp = httpGet(url);
        return JSON.parse(resp);
    }

    /**
    * @event initReady
    */
    $.bind('initReady', function() {
        // `permission` is the group number. 0, 1, 2, 3, 4, 5, 6 and 7. 
        $.registerChatCommand('./speedruncom/speedruncom.js', 'wr', 7);
        $.registerChatCommand('./speedruncom/speedruncom.js', 'wrhelp', 7);
        $.registerChatCommand('./speedruncom/speedruncom.js', 'pb', 7);
    });

})();