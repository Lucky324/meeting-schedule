var express = require('express');
var router = express.Router();
var fs = require('fs');
var meetings = require("../meetings");

router.get('/', function(req, res, next) {
  res.json(meetings);
});

router.post('/', (req, res) => {
  let body = req.body;
  if(body.meet_name && body.name) {
    for(let i = 0;i<meetings.meetings.length;i++) {
      if(meetings.meetings[i].meet_name == body.meet_name) {
        if(Object.keys(meetings.meetings[i]).length == 3) {
          meetings.meetings[i] = {
            "meet_id": meetings.meetings[i].meet_id,
            "meet_name": meetings.meetings[i].meet_name,
            "time": meetings.meetings[i].time,
            "persons": [body.name]
          };
          fs.writeFileSync('./meetings.json', JSON.stringify(meetings));
          res.json({message: "New person added!"});
        } else {
          let unique = true;
          for(let j = 0;j<meetings.meetings[i].persons.length;j++)
            if(meetings.meetings[i].persons[j] == body.name) {
              res.status(400);
              res.json({message: "Wrong person"});
              unique = false;
              break;
            }
          if(unique) {
            meetings.meetings[i].persons[meetings.meetings[i].persons.length] = body.name;
            fs.writeFileSync('./meetings.json', JSON.stringify(meetings));
            res.json({message: "New person added!"});
            break;
          }
        }
      }
    }
  } else if(body.meet_name && body.time){
    let changed = false;
    let id = 1;
    while (true) {
      for (let i = 0; i < meetings.meetings.length; i++) {
        changed = false;
        if (meetings.meetings[i].meet_name == body.meet_name) {
          res.status(400);
          res.json({message: "Wrong name"});
          id = 0;
          break;
        }
        if (id == meetings.meetings[i].meet_id) {
          id++;
          changed = true;
          continue;
        }
      }
      if(!changed)
        break;
    }
    if(id>0){
      meetings.meetings[meetings.meetings.length] = {
        "meet_id": id.toString(),
        "meet_name": body.meet_name,
        "time": body.time
      };
      fs.writeFileSync('./meetings.json', JSON.stringify(meetings));
      res.json({message: "New meeting created!"})
    }
  } else {
    res.status(400);
    res.json({message: "Bad request("});
  }
});


router.delete('/', function(req, res, next) {
  let body = req.body;
  if(body.meet_name && body.name){
    let deleted = false;
    for(let i = 0; i<meetings.meetings.length;i++)
      if(meetings.meetings[i].meet_name == body.meet_name) {
        for (let j = 0; j < meetings.meetings[i].persons.length; j++)
          if (meetings.meetings[i].persons[j] == body.name) {
            meetings.meetings[i].persons.splice(j, 1);
            fs.writeFileSync('./meetings.json', JSON.stringify(meetings));
            res.json({message: "Person deleted!"});
            deleted = true;
            break;
          }
        if (deleted)
          break;
      }
  } else if(!body.meet_name && !body.name){
    res.status(400);
    res.json({message: "Bad request("})
  } else {
    for(let i = 0; i<meetings.meetings.length;i++)
      if(meetings.meetings[i].meet_name == body.meet_name){
        meetings.meetings.splice(i, 1);
        fs.writeFileSync('./meetings.json', JSON.stringify(meetings));
        res.json({message: "Meeting deleted!"});
        break;
      }
  }
  res.json(meetings);
});

module.exports = router;
