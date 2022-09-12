const axios = require('axios').default;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// data variables
let leagueTeams;
let elementTypes;
let allPlayers;
let allPremTeams;
let draftTeams = [];
let fullDataArr = [];


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
const draftLeagueTeamPlayers = (teamId) => {
    // hardcoded GW 6
    axios.get("https://draft.premierleague.com/api/entry/"+ teamId +"/event/6")
        .then((response) => {
            draftTeams.push({id: teamId, picks: response.data.picks});
        })
};


// function to grab the team players from the entire player list
const filterPlayers = (arr1, arr2, id, name) => {
    let teamStats = [];
    teamStats = arr1.filter((player) => {
        return arr2.find((element) => {
            return player.id == element.element;
        });
    });
    //return teamStats;
    createObject(teamStats,id,name);
};

const createObject = (team,id,name) => {
    //fullDataArr.push({id: team.id, fullTeam:[]});
    for (var i = 0; i < team.length; i++) {
        let proTeam = allPremTeams.find(premTeam => premTeam.id == team[i].team);
        let premTeam = proTeam.name;
        fullDataArr.push({teamName: name, playerId: id, name: team[i].web_name, premTeam: premTeam, points: team[i].total_points, minutes: team[i].minutes, ppg: team[i].points_per_game, form: team[i].form});
    }

    if (fullDataArr.length == 150) {
        writeResults(fullDataArr);
    }
};

const writeResults = async (stats) => {
    const csvWriter = createCsvWriter({
        path: "FPLstats2.csv",
        header: [
            {id: "teamName", title: "Team Name" },
            {id: "playerId", title: "Team ID"},
            {id: "name", title: "Player Names"},
            {id: "premTeam", title: "Premier Team"},
            {id: "points", title: "Total Points"},
            {id: "minutes", title: "Total Minutes Played"},
            {id: "ppg", title: "Points per Game"},
            {id: "form", title: "Form"}
        ]
    });

    csvWriter.writeRecords(stats)
        .then(() => {
            console.log("DONE!");
        });

};

getLeagueTeams();
getElementTypes();

setTimeout(() => {
    for (var i = 0; i < leagueTeams.length; i++) {
        draftLeagueTeamPlayers(leagueTeams[i].entry_id);
    }
}, 3000);

setTimeout(() => {
    for (var y = 0; y < draftTeams.length; y++) {
        let teamInfo = leagueTeams.find(team => team.entry_id == draftTeams[y].id);
        let nameAndTeam = teamInfo.player_first_name + " " + teamInfo.player_last_name + " - " + teamInfo.entry_name;
        filterPlayers(allPlayers, draftTeams[y].picks, teamInfo.entry_id, nameAndTeam);
    }
}, 5000);