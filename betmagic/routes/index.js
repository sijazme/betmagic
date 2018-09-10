﻿'use strict';
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

router.get('/', function (req, res) {
    console.log("renderMarkets() called on server side");    
    renderMarkets(DEFAULT_MARKET, 'index', INPLAYONLY, res);
});

router.get('/markets', function (req, res) {

    betfair.setDefaultUrl(req);
    var inplayonly = (req.query.inplayonly != null && JSON.parse(req.query.inplayonly.toLowerCase()) == true);
    renderMarkets(DEFAULT_MARKET, 'markets', inplayonly, res);
});

function renderMarkets(eventTypeId, page, inplayonly, res) {

    betfair.getMarketList(eventTypeId, inplayonly).then(function (marketList)
    {
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
                console.log(error, 'Promise error' + error.status);
            });
        }

    }).
    catch((error) => {
        console.log(error, 'Promise error' + error.status);
    });
}

module.exports = router;
