/**
 * Created by liuyixi on 3/25/14.
 */

var Util={
    randomArray:function(array){
        for(var i = 0;i<array.length;i++){
            var iRand = parseInt(array.length * Math.random());
            array[i] = [array[iRand],array[iRand] = array[i]][0];
        }
        return array;
    },
    setAttr:function(dom,attr,value){
        dom[attr] = value;
    }
};



var Card = (function(){

    function _Card(){
        this.id = null;
        this.name = null;
        this.value = null;
        this.x = 0;
        this.y = 0;
        this.width = 40;
        this.height = 60;
    }

    _Card.prototype.includePoint = function(x,y){
        if(x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height ){
            return true;
        }
        return false;
    };

    return _Card;
})();




function MJ(element){
    this.Dom  = element;
    this.Ctx = this.Dom.getContext('2d');
    Util.setAttr(this.Dom,'width',800);
    Util.setAttr(this.Dom,'height',700);
    this.layers = [];
    this.cards = [];
    this.initCards();
    this.bindEvent();


    this.renderView();
}

MJ.prototype = {
    initCards:function(){
        var z = this;
        var colo = ["a","b","c"];
        var _tmpCards = [];
        for(var i=0;i<3;i++){
            var p_1 = colo[i];
            for(var m=1;m<=9;m++){
                for(var n=0;n<4;n++){
                    var _card = new Card();
                    _card.id = p_1 + '_' + m + '_' + n;
                    _card.name = p_1+m;
                    _card.value = m;
                    _tmpCards.push(_card);
                }
            }
        }
        _tmpCards = Util.randomArray(_tmpCards);
        var baseX = 130,baseY = 60;
        for(i=0;i<9;i++){
            z.cards[i] = [];
            for(m=0;m<12;m++){
                z.cards[i][m] = _tmpCards[i*12 + m];
                z.cards[i][m].x = m * ( z.cards[i][m].width + 5) + baseX;
                z.cards[i][m].y = i * ( z.cards[i][m].height + 5) + baseY;
            }
        }
    },

    /*bind Event*/

    bindEvent:function(){
        this.Dom.addEventListener('mousemove',this.mouseMove.bind(this),false);
    },

    mouseMove:function(e){
//        console.log(e.offsetX, e.offsetY);
        var z = this;
        var intersected = false;
        for(var i=0;i < z.cards.length;i++ ){
            for(var m=0;m< z.cards[i].length;m++){
                var card = z.cards[i][m];
                if(card.includePoint(e.offsetX, e.offsetY)){
                    intersected = true;
                    z.drawMarker(z.cards[i][m]);
                }
            }
        }
        if(!intersected){
            z.renderView();
        }

    },


    /*draw*/

    drawMarker:function(card){
        this.renderView();
        this.Ctx.save();
        this.Ctx.fillStyle = "#000";
        this.Ctx.strokeRect(card.x,card.y,card.width,card.height);

        this.Ctx.restore();
    },


    renderView:function(){

        this.Ctx.clearRect(0,0,this.Dom.width,this.Dom.height);

        this.drawCards();
    },

    drawCards:function(){
        var z = this,
            i = 0 ,
            len = z.cards.length;
        for(;i<len;i++){
            for(var m=0;m< z.cards[i].length;m++) {
                z.Ctx.save();

                var card = z.cards[i][m];
                z.Ctx.fillStyle = '#c1c1c1';
                z.Ctx.fillRect(card.x, card.y, card.width, card.height);

                z.Ctx.font = "Bold 20px Arial";
                z.Ctx.textAlign = 'center';
                z.Ctx.fillStyle = '#000';
                z.Ctx.fillText(card.name,card.x + 20,card.y + 40);

                z.Ctx.restore();
            }
        }
    }
};