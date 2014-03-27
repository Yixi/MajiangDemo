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
        this.height = 53;
        this.isSelect = false;
        this.location = {x:null,y:null};
        this.sprite = null;
    }

    _Card.prototype.includePoint = function(x,y){
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height ;
    };

    return _Card;
})();

function BaseLayer(){
    this.x = 0;
    this.y = 0;
    this.id = null;
    this.type = null;
}

function TextLayer(ctx,content,fontFamily,fontSize,fontColor){
    this.type = 'text';
    this.content = content;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.Ctx = ctx;

    this.draw = function(){
        this.clear();
        this.Ctx.save();
        this.Ctx.font = this.fontSize + 'px ' + this.fontFamily;
        this.Ctx.textAlign = 'left';
        this.Ctx.fillStyle = this.fontColor;
        this.Ctx.fillText(this.content,this.x,this.y);
        this.Ctx.restore();
    };

    this.clear = function(){

    }
}

TextLayer.prototype = new BaseLayer();


function Player(ctx,name){
    this.scoreBoard = new TextLayer(ctx,'Score 0','Arial','20','green');
    this._x = 0;
    this._y = 0;
    this.scoreBoard.x = this._x;
    this.scoreBoard.y = this._y;
    this.__defineSetter__('x',function(value){
        this._x = value;
        this.scoreBoard.x = value;
    });
    this.__defineSetter__('y',function(value){
        this._y = value;
        this.scoreBoard.y = value;
    });
    this.name = this.scoreBoard.id = name;
    this.score = 0;

    this.addScore = function(score){
        this.score += score;
        this.scoreBoard.content = 'Score ' + this.score;
    }
}



function MJ(element){

    this.Dom  = element;
    this.Ctx = this.Dom.getContext('2d');
    Util.setAttr(this.Dom,'width',800);
    Util.setAttr(this.Dom,'height',700);
    this.layers = [];
    this.cards = [];
    this.currentPlayer = null;
    this.lastSelect = null;
    this.CurrentselectCard = null;
    this.currentSelectColor = null;
    this.sprites = new Sprite(this.Ctx,'res/mj.png',MJSprites);






    this.init = function(){
        this.initCards();
        this.initPlayers();
        this.bindEvent();
        this.renderView();
    };


    resources.load([
        'res/mj.png'
    ]);
    resources.onReady(this.init.bind(this));
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
                    _card.sprite = z.sprites.get(_card.name + '.png');
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
                z.cards[i][m].location = {
                    x:m,y:i
                };
            }
        }
    },

    rearrageCards:function(){
        var baseX = 130,baseY = 60;
        for(var i=0;i<9;i++){
            for(var m=0;m<12;m++){
                var iRandi = parseInt(9 * Math.random());
                var iRandm = parseInt(12 * Math.random());
                if(this.cards[iRandi][iRandm] && this.cards[i][m]){
                    this.cards[i][m] = [this.cards[iRandi][iRandm],this.cards[iRandi][iRandm] = this.cards[i][m]][0]

                    this.cards[i][m].x = m * (this.cards[i][m].width + 5) + baseX;
                    this.cards[i][m].y = i * (this.cards[i][m].height + 5) + baseY;
                    this.cards[i][m].location = {x:m,y:i};

                    this.cards[iRandi][iRandm].x = iRandm * (this.cards[iRandi][iRandm].width + 5) + baseX;
                    this.cards[iRandi][iRandm].y = iRandi * (this.cards[iRandi][iRandm].height + 5) + baseY;
                    this.cards[iRandi][iRandm].location = {x:iRandm,y:iRandi};
                }
            }
        }
    },

    initPlayers:function(){
        this.playerA = new Player(this.Ctx,'playerA');
        this.playerA.x = 30; this.playerA.y = 30;
        this.layers.push(this.playerA.scoreBoard);

        this.playerB = new Player(this.Ctx,'playerB');
        this.playerB.x = 30; this.playerB.y = 640;
        this.playerB.scoreBoard.fontColor = 'red';
        this.layers.push(this.playerB.scoreBoard);

        this.changePlayer();
    },

    changePlayer :function(){
        if(this.getAllDual().length<1){
            this.rearrageCards();
            this.renderView();
        }
        if(this.currentPlayer == this.playerB){
            this.currentPlayer = this.playerA;
            this.currentSelectColor = ['green','rgba(0,255,0,.5)'];
            this.AISelect();
        }else{
            this.currentPlayer = this.playerB;
            this.currentSelectColor = ['red','rgba(255,0,0,.5)'];
//            this.AISelect();
        }
    },

    /* AI*/


    AISelect:function(){
        var z = this;
        var allDual = this.getAllDual();
        allDual.sort(function(left,right){
            if(left.score > right.score)
                return -1;
            else
                return 1;
        });

        /*hard*/
        var standby = allDual.slice(0,2);
        var take = standby[parseInt(standby.length * Math.random())];
        console.log(take);
        setTimeout(function(){
            take.f.isSelect = true;
            z.lastSelect = take.f;
            z.renderView();
        },1000);
        setTimeout(function(){
            take.s.isSelect = true;
            z.lastSelect = null;
            z.renderView();
        },2000);
        setTimeout(function(){
            z.currentPlayer.addScore(take.score);
            z.cleanCard(take.f);
            z.cleanCard(take.s);
            z.renderView();
            z.changePlayer();
        },3000);


    },

    getAllDual:function(){
        var canSelect = this.getAllCanSelect();
        var dual = [];
        for(var i=0;i<canSelect.length;i++){
            for(var m = i+1;m<canSelect.length;m++){
                if(canSelect[m].name == canSelect[i].name){
                    dual.push({
                        f:canSelect[i],
                        s:canSelect[m],
                        score:canSelect[m].value
                    });
                }
            }
        }
        return dual;
    },

    getAllCanSelect:function(){
        var z = this;
        var canSelect = [];
        for(var i=0;i < z.cards.length;i++ ){
            for(var m=0;m< z.cards[i].length;m++){
                var card = z.cards[i][m];
                if(!card) continue;
                if(z.cardCanSelect(card)){
                    canSelect.push(card);
                }
            }
        }
        return canSelect;
    },

    /**/

    cardCanSelect:function(card){
        var z = this;
        var x = card.location.x;
        var y = card.location.y;
        if(y < 1 || y>=8) {
            return true
        }
        return !z.cards[y-1][x] || !z.cards[y+1][x]
    },

    /*bind Event*/

    bindEvent:function(){
        this.Dom.addEventListener('mousemove',this.mouseMove.bind(this),false);
        this.Dom.addEventListener('mousedown',this.mouseDown.bind(this),false);
    },

    mouseDown:function(e){
        if(this.currentPlayer == this.playerA) return;
        if(this.CurrentselectCard){
            if(!this.lastSelect){
                if(this.cardCanSelect(this.CurrentselectCard)){
                    this.lastSelect = this.CurrentselectCard;
                    this.CurrentselectCard.isSelect = true;
                }
            }else{
                if(this.CurrentselectCard == this.lastSelect){
                    this.CurrentselectCard.isSelect = false;
                    this.lastSelect = null;
                }else{
                    if(this.cardCanSelect(this.CurrentselectCard)){
                        if(this.CurrentselectCard.name == this.lastSelect.name) {
                            console.log('get point ' + this.lastSelect.value);
                            this.currentPlayer.addScore(this.lastSelect.value);
                            this.cleanCard(this.CurrentselectCard);
                            this.cleanCard(this.lastSelect);
                            this.lastSelect = null;
                            this.CurrentselectCard = null;
                            this.changePlayer();
                        }else{
                            this.lastSelect.isSelect = false;
                            this.lastSelect = this.CurrentselectCard;
                            this.lastSelect.isSelect = true;
                        }
                    }
                }
            }
            this.renderView();
        }
    },

    mouseMove:function(e){
        var z = this;
        var intersected = false;
        z.CurrentselectCard = null;
        for(var i=0;i < z.cards.length;i++ ){
            for(var m=0;m< z.cards[i].length;m++){
                var card = z.cards[i][m];
                if(!card) continue;
                if(card.includePoint(e.offsetX, e.offsetY) && z.cardCanSelect(card)){
                    intersected = true;
                    z.drawMarker(z.cards[i][m],'#000');
                    z.CurrentselectCard = z.cards[i][m];
                }
            }
        }
        if(!intersected){
            z.renderView();
        }

    },


    /*draw*/

    cleanCard:function(card){
        this.cards[card.location.y][card.location.x] = null;
    },

    drawMarker:function(card,color){
        this.renderView();
        this.Ctx.save();
        this.Ctx.strokeStyle = color;
        this.Ctx.strokeRect(card.x,card.y,card.width,card.height);

        this.Ctx.restore();
    },


    renderView:function(){

        this.Ctx.clearRect(0,0,this.Dom.width,this.Dom.height);
        this.drawLayers();
        this.drawCards();
    },
    drawLayers:function(){
        var z = this;
        for(var i=0;i<this.layers.length;i++){
            var layer = z.layers[i];
            layer.draw();
        }
    },
    drawCards:function(){
        var z = this,
            i = 0 ,
            len = z.cards.length;
        for(;i<len;i++){
            for(var m=0;m< z.cards[i].length;m++) {
                z.Ctx.save();

                var card = z.cards[i][m];
                if(!card) continue;

//                z.Ctx.fillStyle = '#c1c1c1';
//                z.Ctx.fillRect(card.x, card.y, card.width, card.height);
                card.sprite.draw(card.x, card.y);

                if(card.isSelect) {
                    z.Ctx.strokeStyle = z.currentSelectColor[0];
                    z.Ctx.strokeRect(card.x,card.y,card.width,card.height);
                    z.Ctx.fillStyle = z.currentSelectColor[1];
                    z.Ctx.fillRect(card.x, card.y, card.width, card.height);
                }

//                z.Ctx.font = "Bold 20px Arial";
//                z.Ctx.textAlign = 'center';
//                z.Ctx.fillStyle = '#000';
//                z.Ctx.fillText(card.name,card.x + 20,card.y + 40);



                z.Ctx.restore();
            }
        }
    }
};