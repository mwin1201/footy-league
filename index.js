const axios = require('axios').default;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// data variables
let leagueTeams;
let elementTypes;
let allPlayers;
let allPremTeams;
let draftTeams = [];
let fullDataArr = [];
let draftOrder;


// get league team data
const getLeagueTeams = () => {
    axios.get("https://draft.premierleague.com/api/league/18161/details")
        .then((response) => {
            leagueTeams = response.data.league_entries;
        })
};

// get element types (this is FPL speak for GKP, DEF, MID, and FWD)
const getElementTypes = () => {
    axios.get("https://draft.premierleague.com/api/bootstrap-static")
        .then((response) => {
            elementTypes = response.data.element_types;
            allPlayers = response.data.elements;
            allPremTeams = response.data.teams;
        })
};

// get the draft league team players
const draftLeagueTeamPlayers = (teamId, event) => {
    axios.get("https://draft.premierleague.com/api/entry/"+ teamId +"/event/"+ event)
        .then((response) => {
            draftTeams.push({gameweek: "GW"+ event, id: teamId, picks: response.data.picks});
        })
};


// function to grab the team players from the entire player list
const filterPlayers = (arr1, arr2, id, name, GW) => {
    let teamStats = [];
    let teamPoints = 0;
    teamStats = arr1.filter((player) => {
        return arr2.find((element) => {
            return player.id == element.element;
        });
    });
    //return teamStats;
    teamStats.sort((a,b) => {
        return b.total_points - a.total_points;
     });
     for (var i = 0; i < teamStats.length; i++) {
        teamPoints = teamPoints + teamStats[i].total_points;
     }
    createObject(teamStats,id,name,GW,teamPoints);
};

const createObject = (team,id,name,GW,teamPoints) => {
    //fullDataArr.push({id: team.id, fullTeam:[]});
    for (var i = 0; i < team.length; i++) {
        let proTeam = allPremTeams.find(premTeam => premTeam.id == team[i].team);
        let premTeam = proTeam.name;
        fullDataArr.push({teamName: name, playerId: id, gameweek: GW, name: team[i].web_name, premTeam: premTeam, points: team[i].total_points, minutes: team[i].minutes, ppg: team[i].points_per_game, form: team[i].form, teamPoints: teamPoints});
    }

    // 15 players for 10 teams in league for 1 gameweek is how we get 150
    if (fullDataArr.length == 150) {
        writeResults(fullDataArr);
    }
};

const writeResults = async (stats) => {
    const csvWriter = createCsvWriter({
        path: "FPLstatsGW9.csv",
        header: [
            {id: "teamName", title: "Team Name" },
            {id: "playerId", title: "Team ID"},
            {id: "gameweek", title: "Gameweek"},
            {id: "name", title: "Player Names"},
            {id: "premTeam", title: "Premier Team"},
            {id: "points", title: "Total Points"},
            {id: "minutes", title: "Total Minutes Played"},
            {id: "ppg", title: "Points per Game"},
            {id: "form", title: "Form"},
            {id: "teamPoints", title: "Total Team Points"}
        ]
    });

    csvWriter.writeRecords(stats)
        .then(() => {
            console.log("DONE!");
        });

};

// get official league draft list of players selected
const getDraftOrder = () => {
    axios.get("https://draft.premierleague.com/api/draft/18161/choices")
        .then((response) => {
            draftOrder = response.data.choices;
        })
};

const writeDraftData = (data) => {
    const csvWriter = createCsvWriter({
        path: "draftStats_thruGW9.csv",
        header: [
            {id: "round", title: "Round" },
            {id: "pick", title: "Pick" },
            {id: "leaguePlayer", title: "Picked By" },
            {id: "player", title: "Prem Player" },
            {id: "points", title: "Total Points" },
            {id: "draftRank", title: "Draft Rank" },
            {id: "diff", title: "Expected Ranking Score"}
        ]
    });

    csvWriter.writeRecords(data)
        .then(() => {
            console.log("DONE!");
        });
};

getLeagueTeams();
getElementTypes();
getDraftOrder();

setTimeout(() => {
    for (var i = 0; i < leagueTeams.length; i++) {
        // for (var eventId = 1; eventId < 8; eventId++) {
        //     draftLeagueTeamPlayers(leagueTeams[i].entry_id, eventId);
        // }
        draftLeagueTeamPlayers(leagueTeams[i].entry_id, 9);
    }
}, 3000);

setTimeout(() => {
    for (var y = 0; y < draftTeams.length; y++) {
        let teamInfo = leagueTeams.find(team => team.entry_id == draftTeams[y].id);
        let nameAndTeam = teamInfo.player_first_name + " " + teamInfo.player_last_name + " - " + teamInfo.entry_name;
        filterPlayers(allPlayers, draftTeams[y].picks, teamInfo.entry_id, nameAndTeam, draftTeams[y].gameweek);
    }
}, 5000);

// kickoff the draft stat document creation
setTimeout(() => {
    let draftStats = [];
    let playersFiltered = [];
     for (var y = 0; y < draftOrder.length; y++) {
        playersFiltered.push(allPlayers.find(player => player.id == draftOrder[y].element));
     }
     for (var i = 0; i < draftOrder.length; i++) {
        draftStats.push({round: draftOrder[i].round, pick: draftOrder[i].pick, leaguePlayer: draftOrder[i].player_first_name + " "+ draftOrder[i].player_last_name, player: playersFiltered[i].web_name, points: playersFiltered[i].total_points, draftRank: playersFiltered[i].draft_rank});
     }
     draftStats.sort((a,b) => {
        return b.points - a.points;
     });

     for (var x = 0; x < draftStats.length; x++) {
        draftStats[x].diff = draftStats[x].draftRank - (x+1);
     }

     writeDraftData(draftStats);
}, 10000)