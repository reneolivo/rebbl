'use strict';
const configuration = require('../../lib/ConfigurationService.js')
  , db = require('../../lib/LeagueService.js')
  , express = require('express')
  , rampup = require("../../lib/Rampup.js")
  , util = require('../../lib/util.js');


class League{
	constructor(){
		this.router = express.Router({mergeParams:true});
	}


  routesConfig(){
    this.router.get('/', util.checkCache, async function(req, res){
      let data = {standings:null, rounds:null, league:req.params.league,company:req.params.company };
      let comp = false;
      let league = req.params.league.toLowerCase();

      switch(league){
        case "big o":
          res.redirect(`/rebbl/standings/REBBL - Big O`);
          return;
        case "gman":
          res.redirect(`/rebbl/standings/REBBL - GMan`);
          return;
        case "rel":
          res.redirect(`/rebbl/standings/REBBL - REL`);
          return;
      }
    
      if(league == "open invitational"){
        league = new RegExp(`^ReBBL Open Invitational`, 'i');
      } else if (league === "playins - s10"){
        league = new RegExp(`^ReBBL Playoffs`,'i');
        comp = "Play-Ins Qualifier";
      } else if(league.toLowerCase() == "greenhorn cup") {
        league = new RegExp(`^Greenhorn Cup`,'i');
        comp ="Greenhorn Cup$";
      } else if (league.toLowerCase().indexOf("rebbrl") == -1 && league.toLowerCase() !== "rebbll" && league.toLowerCase() !== "xscessively elfly league" && league.toLowerCase() !== "rabble" && league.toLowerCase() !== "eurogamer" ){
        league = new RegExp(`^REBBL[\\s-]+${league}`, 'i');
      }  
      else {
        if (league === "rabble"){
          league = "the rebbl rabble mixer";
        }
        if (league === "eurogamer"){
          league = "REBBL Eurogamer Open";
        }
    
        league = new RegExp(`^${league}`, 'i');
      }
    
      
      if( req.params.league.toLowerCase() === "rampup"){
        data.standings = await rampup.getCoachScore();
        data.rounds = await db.getDivisions(new RegExp(/rampup$/,"i"));
        res.render('rebbl/league/rampup', data);
      } else {
        data.cutoffs = configuration.getPlayoffTickets(req.params.league);
        data.standings = await db.getCoachScore(league, comp || null, true);
        data.rounds = await db.getDivisions(league);
        res.render('rebbl/league/index', data);
      }
    
    });
    return this.router;
  }
}  

module.exports = League;