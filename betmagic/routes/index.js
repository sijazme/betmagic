'use strict';
var express = require('express');
var router = express.Router();
var betfair = require('../betfair');

var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const { document } = (new JSDOM('')).window;
global.document = document;
var window = document.defaultView;
var $ = require('jquery')(window);

const DEFAULT_MARKET = 2;
const INPLAYONLY = true;
//const EVENTTYPEIDS = [2,4,5];
const EVENTTYPEIDS = [2];  // ONLY TENNIS

router.get('/', function (req, res) {
    //betfair.listEventTypes();
    betfair.setDefaultUrl(req);
    renderMultiMarkets(EVENTTYPEIDS, 'index', INPLAYONLY, res);
});

router.get('/runners', function (req, res) {    
    betfair.setDefaultUrl(req);
    var inplayonly = (req.query.inplayonly != null && JSON.parse(req.query.inplayonly.toLowerCase()) == true);
    renderMultiMarkets(EVENTTYPEIDS, 'runners', inplayonly, res);
});


function renderMultiMarkets(eventTypeIds, page, inplayonly, res) {

    betfair.getMultiMarkets(eventTypeIds, inplayonly).then(function (multimarkets) {

        res.render(page, {
            title: 'Betfair Markets',
            markets: multimarkets,
            inplayonly: inplayonly
        });

        //console.log(multimarkets);

        if (multimarkets && inplayonly) {
            //betfair.saveMarketData(multimarkets).then(function (obj) {

            //}).
            //catch((error) => {
            //    console.log(error, 'renderMultiMarkets unable to save market data ' + error.status);
            //});
        }

    }).
        catch((error) => {
            console.log(error);
            res.render("error", {
                message: 'not market data was returned by betfair api call to getMarketList()',
                error: error
            });
        });
}

function renderMarkets(eventTypeIds, page, inplayonly, res) {

    betfair.getMarketList(eventTypeIds, inplayonly).then(function (marketList)
    {        
        //marketList.map(function (market) {
        //    console.log("market event id --> " + market.eventTypeId);
        //});

        //for (var i = 0; i < marketList.length; i++) {
        //    console.log(marketList[i].eventTypeId);
        //}

        res.render(page, {
            title: 'Betfair Markets',
            markets: marketList,
            inplayonly: inplayonly
        });

     
        if (marketList && inplayonly)
        {
            betfair.saveMarketData(marketList).then(function (obj) {
                
            }).
            catch((error) => {
                console.log(error, 'renderMarkets unable to save market data ' + error.status);
            });
        }

    }).
    catch((error) => {
        console.log(error);
        res.render("error", {
            message: 'not market data was returned by betfair api call to getMarketList()',
            error: error
        });
    });
}

module.exports = router;
