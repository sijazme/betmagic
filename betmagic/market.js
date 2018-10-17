const moment = require('moment');

class Market {

    constructor(marketCatalogue, marketBook) {
        this.marketCatalogue = marketCatalogue;
        this.marketBook = marketBook;
    }

    NaNcheck(val) {

        var valfloat = parseFloat(val);

        if (isNaN(valfloat)) {
            return 0;
        }
        else {
            return valfloat;
        }
    }

    getLeastBetPrice(runner) {

        if (runner.ex.availableToBack[0] != null && typeof runner.ex.availableToBack[0].price !== 'undefined') {
            return this.NaNcheck(runner.ex.availableToBack[0].price);
        }

        if (runner.ex.availableToBack[1] != null && typeof runner.ex.availableToBack[1].price !== 'undefined') {
            return this.NaNcheck(runner.ex.availableToBack[1].price);
        }

        if (runner.ex.availableToBack[2] != null && typeof runner.ex.availableToBack[2].price !== 'undefined') {
            return this.NaNcheck(runner.ex.availableToBack[2].price);
        }

        return parseFloat(0);
    }

    get eventTypeId() {
        return this.marketCatalogue.eventType.id;
    }
    
    get inPlay() {
        return this.marketBook.inplay;
    }

    get betprice0() {

        var betprice = 0;

        if (this.inPlay) {

            betprice = this.NaNcheck(this.marketBook.runners[0].lastPriceTraded);
            if (betprice == null || betprice <= 0) {
                betprice = this.getLeastBetPrice(this.marketBook.runners[0]);
            }
        }

        else {

            betprice = this.getLeastBetPrice(this.marketBook.runners[0]);
        }

        return betprice;
    }

    get betprice1() {
        var betprice = 0;

        if (this.inPlay) {

            betprice = this.NaNcheck(this.marketBook.runners[1].lastPriceTraded);
            if (betprice == null || betprice <= 0) {
                betprice = this.getLeastBetPrice(this.marketBook.runners[1]);
            }
        }

        else {

            betprice = this.getLeastBetPrice(this.marketBook.runners[1]);
        }

        return betprice;
    }

    get betpricedelta() {        
        if (isNaN(this.betprice0) || isNaN(this.betprice1))
            return 0;
        else
            return Math.abs(this.betprice0 - this.betprice1).toFixed(2);
    }

    get startTime() {
        return moment.utc(this.marketCatalogue.marketStartTime).local().format('lll');
    }

    get startDateTime() {
        return moment.utc(this.marketCatalogue.marketStartTime).local();
    }

    get startDay() {

        var startdate = moment.utc(this.marketCatalogue.marketStartTime).local();
        const today = moment().endOf('day')

        if (startdate < today)
            return 'Today'
        else
            return startdate.format('dddd');
    }

    get startHour() {
        return moment.utc(this.marketCatalogue.marketStartTime).local().format('HH:mm');
    }

    get startTimeCustom() {
        
        var start = moment(this.marketCatalogue.marketStartTime);
        
        var hours = start.diff(moment(), 'hours', true);
        var hoursFloor = Math.floor(parseFloat(hours));

        
        if (hoursFloor < 4) {
            return start.fromNow();
        }
        else {

            var day = this.startDay;
            var hour = this.startHour;

            return day + ' ' + hour;
        }
    }

    get marketDuration() {

        var start = moment(this.marketCatalogue.marketStartTime);
        var minutes = moment().diff(start, 'minutes', true);
        var minutesFloor = Math.floor(parseInt(minutes));
        return Math.abs(minutesFloor);
    }

    get eventType() {

        var eventTypeId = parseInt(this.marketCatalogue.eventType.id);
        var eventName = this.marketCatalogue.eventType.name.toLowerCase();
        
        switch (eventTypeId) {
            case 1:                
                eventName = "football";
                break;
            //case 2:
            //    eventName = "tennis";
            //    break;
            //case 3:
            //    eventName = "american-football";
            //    break;
            //case 4:
            //    eventName = "rugby";
            //    break;
        }

        return eventName;
    }

    get fromNow() {
        return moment.utc(this.marketCatalogue.marketStartTime).local().fromNow();
    }

    get leastBetPrice() {
        return this.betprice0 < this.betprice1 ? this.betprice0 : this.betprice1;
    }

    get betpriceId0() {
        var selectionId = '';
        if (this.marketBook) {
            selectionId = this.marketBook.runners[0].selectionId;
        }
        return 'betprice' + selectionId;
    }

    get betpriceId1() {
        var selectionId = '';
        if (this.marketBook) {
            selectionId = this.marketBook.runners[1].selectionId;
        }
        return 'betprice' + selectionId;
    }

    get betpriceClass0() {

        if (this.marketBook) {
            if (this.marketBook.runners[0].lastPriceTraded < 1.05)
                return 'betpriceG';
            if (this.marketBook.runners[0].lastPriceTraded >= 34)
                return 'betpriceZ';
            if (this.marketBook.runners[0].lastPriceTraded < this.marketBook.runners[1].lastPriceTraded)
                return 'betprice'
            if (this.marketBook.runners[0].lastPriceTraded >= this.marketBook.runners[1].lastPriceTraded)
                return 'betpriceY'
        }

        return 'betprice';
    }

    get betpriceClass1() {

        if (this.marketBook) {
            if (this.marketBook.runners[1].lastPriceTraded < 1.05)
                return 'betpriceG';
            if (this.marketBook.runners[1].lastPriceTraded >= 34)
                return 'betpriceZ';
            if (this.marketBook.runners[1].lastPriceTraded < this.marketBook.runners[0].lastPriceTraded)
                return 'betprice'
            if (this.marketBook.runners[1].lastPriceTraded >= this.marketBook.runners[0].lastPriceTraded)
                return 'betpriceY'
        }

        return 'betprice';
    }
};

module.exports = Market;