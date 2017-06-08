"use strict";
const http = require("http");
const querystring = require('querystring');
const yelp = require('yelp-fusion');
const access_token="7Yj_PenZLmuck0zfPI6uJZELH7mXSfT_CicA4DpddzwwjBKhUNpD5weHrPEUzbmeSM1HAUtvkCgMnyryn6JyxcGGbfLX8forYwCuagbMwiU-SFl4O85T9IU2TAo4WXYx";
const client = yelp.client(access_token);
//https://www.npmjs.com/package/yelp-fusion

function search(s){

    if(typeof s.location!="undefined"&&s.location!=""){
        return client.search(s);
    }else{
        return {"error":1};
    }
}
function searchPhone(s){
    if(typeof s.phone!="undefined"&&s.phone!=""){
        return client.phoneSearch({phone:s.phone});
    }else{
        return {"error":1};
    }
}
function searchTransaction(s){
    if(typeof s.location!="undefined"&&s.location!=""){
        return client.transactionSearch('delivery', {location:s.location});
    }else{
        return {"error":1};
    }
}
function autoComplete(s){
    if(typeof s.text!="undefined"&&s.text!=""){
        return client.autocomplete({text:s.text});
    }else{
        return {"error":1};
    }
}   
function searchBusiness(s){
    if(typeof s.id!="undefined"&&s.id!=""){
        return client.business(s.id);
    }else{
        return {"error":1};
    }
}
function searchReview(searchRequest){
    if(typeof s.id!="undefined"&&s.id!=""){
        return client.reviews(s.id);
    }else{
        return {"error":1};
    }
}

function onrequest(request, response){
    let r=null;
    let prettyJson ='';
    let s="";
    //search s
    //searchPhone p
    //searchTransaction t
    //autoComplete a
    //searchBusiness b
    //searchReview r
    request.addListener("data", function (postDataChunk) {
        s += postDataChunk;
    });
    request.addListener("end", function () {
        s = querystring.parse(s);
        switch(s.action){
            case 's': 
               r=search(s);
               break;
            case 'p': 
               r=searchPhone(s);
               break;
            case 't': 
               r=searchTransaction(s);
               break;
            case 'a': 
               r=autoComplete(s);
               break;
            case 'b': 
               r=searchBusiness(s);
               break;
            case 'r': 
               r=searchReview(s);
               break;
            default: 
               r={"error":1};
               break;
        }
        
        response.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:88"});

        if(typeof r.error!=="undefined"&&r.error===1){
            prettyJson=JSON.stringify(r, null, 4)
            response.write(prettyJson);
            response.end();
        }else{
            r.then(data => {
                prettyJson = JSON.stringify(data.jsonBody, null, 4);
                response.write(prettyJson);
                response.end();
            }).catch(e => {
                prettyJson = JSON.stringify({error:500}, null, 4);
                response.write(prettyJson);
                response.end();
            });
        }
    });
}
http.createServer(onrequest).listen(8888);

console.log("connect api");