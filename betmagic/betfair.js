﻿var https = require("https");
var url = require('url');
const DEFAULT_ENCODING = 'utf-8';
const DEFAULT_JSON_FORMAT = '\t';
const DEFAULT_GET_COUNT = 40;
const DEFAULT_URL = ''; // = 'http://' + 'localhost:' + '1337';
const market = require('./market');
const moment = require('moment');
const request = require('request');

const RunnerSnapshot = require('./models/runnersnapshot.model');

const MarketInstance = require('./models/marketinstance.model');


module.exports = {

    setDefaultUrl: function (req) {

        var requrl = url.format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: req.originalUrl,
        });

        DEFAULT_URL = requrl;
    },

    listEventTypes: function () {

        var str = "";     

        var options = updateHeaders('listEventTypes');
               
        var requestFilters = '{"filter":{}}';

        var req = https.request(options, function (res) {
            res.setEncoding(DEFAULT_ENCODING);
            res.on('data', function (chunk) {
                str += chunk;
            });

            res.on('end', function (chunk) {
                
                var response = JSON.parse(str);
                handleError(res.statusCode, response);
                var jsonPretty = JSON.stringify(JSON.parse(str), null, 2);
                console.log(jsonPretty);
                //module.exports.listMarketCatalogue(updateHeaders('listMarketCatalogue'), response);                
                
            });
        });

        // Send Json request object
        req.write(requestFilters, DEFAULT_ENCODING);
        req.end();

        req.on('error', function (e) {
            console.log('Problem with request: ' + e.message);
        });
    },

    getMarketList: function (eventTypeId, inplayonly) {
        
        return new Promise(function (resolve, reject) {

            GetMarketCatalogue(eventTypeId,inplayonly).then(function (marketCatalogue) {
            
                if (marketCatalogue != null && marketCatalogue.length > 0) {

                    //console.log("marketCatalogue length: " + marketCatalogue.length);
                    module.exports.resolveMarketBooks(marketCatalogue).then(function (marketList) {

                        //console.log("IN PLAY VALUE IN GetMarketCatalogue " + inplayonly);

                        if (inplayonly) {
                            //console.log("SORT MARKET ON PRICE ########################")
                            marketList = marketList.sort(comparePrice).reverse();
                        }
                        else {
                            //console.log("INPLAYVALUE **************************** " + inplayonly);
                            //console.log("SORT MARKET ON START TIME ########################")
                            marketList = marketList.sort(compareTime);

                        }

                        //marketList.forEach(function (item) {
                        //    console.log(item.betpricedelta);
                        //});


                        resolve(marketList);
                    });
                }
                else {
                    reject("error: marketCatalogue is empty list");
                }
                
            }).catch((err) => {
                console.log("connection error: betfair server is unreachable: " + err);
                reject("getMarketList failed");
                    //console.log("getMarketList() crashed at GetMarketCatalogue(): " + err.status);
                });
        });
    },

    resolveMarketBooks: async function (marketCatalogue) {

        return new Promise(function (resolve, reject) {
            
            const marketList = [];
            var marketIds = new Array();
            var marketCount = marketCatalogue.length; // marketcatalogue gives us total market count
         
            marketCatalogue.forEach(function (item) {
                marketIds.push(item.marketId);
            });
            
            for (var i = 0; i < marketIds.length; i += DEFAULT_GET_COUNT)
            {
                var marketids_sliced = marketIds.slice(i, i + DEFAULT_GET_COUNT); // get 40 marketids every time
                var mlist1 = JSON.stringify(marketids_sliced);
                
                GetMarketBooks(mlist1).then(function (marketBooks) {
                    marketBooks.forEach(function (marketBook, index) {
                        var mcatalogue = marketCatalogue.find(x => x.marketId === marketBook.marketId);
                        var marketObj = new market(mcatalogue, marketBook);
                        marketList.push(marketObj);
                        if (marketList.length == marketCount) {
                            resolve(marketList);
                        }
                    });                    

                }).catch((err) => {
                    console.log("resolveMarketBooks: " + err);
                });
            }            
        });        
    },

    saveMarketData: async function (marketlist) {

        return new Promise(function (resolve, reject) {

            var count = marketlist.length;            

            marketlist.forEach(function (marketObj) {

                var marketBook = marketObj.marketBook;
                var marketCatalogue = marketObj.marketCatalogue;

                var marketinstance = getMarketInstance(marketObj);

                var postUrl = DEFAULT_URL + "/marketinstance/create";
                console.log(postUrl);
                var JSONformData = JSON.stringify(marketinstance);
             
                postData(postUrl, JSONformData).then(function (res) {   // post to "/marketinstance/create"

                    var _id = JSON.parse(res);

                    //console.log("marketInstance " + _id);

                    saveRunnerSnapshot(_id, marketBook.runners[0], marketCatalogue.runners[0].runnerName);
                    
                    saveRunnerSnapshot(_id, marketBook.runners[1], marketCatalogue.runners[1].runnerName);

                    if (--count == 0)
                    {                       
                        resolve();
                    }

                }).
                catch((error) => {
                    console.log(error, 'postData() error' + error.status);
                    reject('postData() error' + error);
                });
            });
        });
    },
   
};

function getMarketInstance(marketObj) {

    var marketBook = marketObj.marketBook;
    var marketCatalogue = marketObj.marketCatalogue;

    var marketinstance =
    {
        marketId: marketBook.marketId,
        eventType: marketCatalogue.eventType.name,
        competition: marketCatalogue.eventType.name,
        created: moment().utc().local().format(),
        startTime: marketObj.startDateTime,
        timelapse: marketObj.marketDuration
    };

    return marketinstance;
}

function saveRunnerSnapshot(_id, runner, name)  {

    let runnersnapshot = new RunnerSnapshot(
        {
            marketInstanceId: _id,
            selectionId: runner.selectionId,
            runnerName: name,
            lastPriceTraded: runner.lastPriceTraded,
            totalMatched: runner.totalMatched
        }
    );

    runnersnapshot.save(function (err, doc) {
        if (err) {
            console.log(err);
        }
        //console.log('runndersnapshot added ' + doc._id);
    });
}

async function postData(postUrl, JSONformData) {

    return new Promise(function (resolve, reject) {

        request.post({
            headers: { 'content-type': 'application/json' },
            url: postUrl,
            body: JSONformData,
            method: 'POST'
        }, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                return resolve(body);
            }
            else {
                console.log('error: statuscode:  ', response && response.statusCode);
                return reject(new Error(response.statusCode));
            }
        });
    });
}

async function GetMarketCatalogue(eventTypeId,inplayonly) {

    var d = new Date();
    d.setHours(d.getHours() - 5);
    var jsonDate = d.toJSON();
    var inPlayString = '"inPlayOnly": ' + inplayonly;
    var requestFilters = '{"filter":{"eventTypeIds": ["' + eventTypeId + '"], ' + inPlayString + ', "marketCountries":["GB","AU","US", "IE", "NZ", "IN", "DK", "ES", "TR", "BA"], "marketTypeCodes":["WIN", "MATCH_ODDS"],"marketStartTime":{"from":"' + jsonDate + '"}}, "sort":"FIRST_TO_START", "maxResults":"50", "marketProjection":["MARKET_START_TIME","RUNNER_METADATA","COMPETITION", "EVENT", "EVENT_TYPE"]}}';
    var options = updateHeaders('listMarketCatalogue');
    console.log(requestFilters);    
    return await httpRequestPromise(options, requestFilters);
}

async function GetMarketBooks(marketIds) {

    var requestFilters = '{"marketIds":' + marketIds + ',"priceProjection":{"priceData":["EX_BEST_OFFERS"],"exBestOfferOverRides":{"bestPricesDepth":2,"rollupModel":"STAKE","rollupLimit":20},"virtualise":false,"rolloverStakes":false},"orderProjection":"ALL","matchProjection":"ROLLED_UP_BY_PRICE"}}';
    var options = updateHeaders('listMarketBook');
    return await httpRequestPromise(options, requestFilters);
}

function httpRequestPromise(params, postData) {
    return new Promise(function (resolve, reject) {
        var req = https.request(params, function (res) {

            res.setEncoding(DEFAULT_ENCODING);

            if (res.statusCode < 200 || res.statusCode >= 300) {

                //console.log('STATUS: ' + res.statusCode);
                //console.log('HEADERS: ' + JSON.stringify(res.headers));

                return reject(new Error('statusCode=' + res.statusCode + '\n' + 'data=' + postData));
            }

            var str = '';
            res.on('data', function (chunk) {
                str += chunk;
            });

            res.on('end', function () {
                return resolve(JSON.parse(str));
            });
        });

        req.on('error', function (err) {
            reject(err);
        });
        if (postData) {
            //console.log(postData);
            req.write(postData, DEFAULT_ENCODING);
        }
        // IMPORTANT
        req.end();
    });
}


const appkey = 'Hb5saWp13phw2thS';
const ssid = '3R7eLXaEMMycp/WUQovV9qHk6hR8Qfz9zRCJx8hMcv4=';

function constructJsonRpcRequest(operation, params) {
    return '{"jsonrpc":"2.0","method":"SportsAPING/v1.0/' + operation + '", "params": ' + params + ', "id": 1}';
}

function GetOptionsRpc() {
    return {        
        hostname: 'api.betfair.com',
        port: 443,
        path: '/exchange/betting/json-rpc/v1',
        method: 'POST',
        headers: {
            'X-Application': appkey,
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-Authentication': ssid
        }
    }
}


function updateHeaders(operationName) {
    return {
        port: 443,
        hostname: 'api.betfair.com',
        path: '/exchange/betting/rest/v1.0/' + operationName + '/',
        method: 'POST',
        headers: {
            'X-Application': appkey,
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-Authentication': ssid
        }
    }
}

// Handle Api-NG errors, exception details are wrapped within response object
function handleError(statusCode, response) {
    // check for status code of the response
    if (statusCode != 200) {
        // if response contains exception retrieve details and log
        if (Object.keys(response.detail).length != 0) {
            console.log("Error with request: ");
            console.log(JSON.stringify(response, null, DEFAULT_JSON_FORMAT));
            console.log("Exception Details: ");
            console.log(JSON.stringify(retrieveExceptionDetails(response), null, DEFAULT_JSON_FORMAT));
            console.log("Exception Error Code: ");
            console.log(JSON.stringify(retrieveExceptionErrorCode(response), null, DEFAULT_JSON_FORMAT));
        }
        // if error is thrown stop the app
        process.exit(1);
    }
}

// get event id from the response
function retrieveEventId(response) {
    for (var i = 0; i <= response.length; i++) {
        if (response[i].eventType.name == 'Tennis') {
            return response[i].eventType.id;
        }
    }
}

function retrieveExceptionDetails(response) {
    return response.error.data.APINGException;
}

function comparePrice(a, b) {
    
    if ((typeof b.betpricedelta === 'undefined' && typeof a.betpricedelta !== 'undefined') || parseFloat(a.betpricedelta) < parseFloat(b.betpricedelta)) {
        //console.log(a.betpricedelta + ' IS LESS THAN ' + b.betpricedelta);
        return -1;
    }
    if ((typeof a.betpricedelta === 'undefined' && typeof b.betpricedelta !== 'undefined') || parseFloat(a.betpricedelta) > parseFloat(b.betpricedelta)) {

        //console.log(a.betpricedelta + ' IS GREATER THAN ' + b.betpricedelta);
        return 1;
    }

    return 0;
}

function compareTime(a, b) {

    var a_time = moment(a.startDateTime);
    var b_time = moment(b.startDateTime);

    if ((typeof b.startDateTime === 'undefined' && typeof a.startDateTime !== 'undefined') || a_time.isBefore(b_time)) {
        //console.log(a_time + ' IS LESS THAN ' + b_time);
        return -1;
    }
    if ((typeof a.startDateTime === 'undefined' && typeof b.startDateTime !== 'undefined') || b_time.isBefore(a_time)) {

        //console.log(a_time + ' IS GREATER THAN ' + b_time);
        return 1;
    }

    return 0;
}
