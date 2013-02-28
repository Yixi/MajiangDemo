/**
 * Author: Yixi
 * Date: 13-2-27
 * Time: 下午11:11
 */


var MJ = (function(){

    function init(selector){
        return new MaJiang(selector);
    }

    /* Util function*/

    var Util = {
        getEle:function(selector){
            return document.querySelector(selector);
        },
        setStyle:function(dom,attr,value){
            dom.style[attr] = value;
        },
        setAttr:function(dom,attr,value){
            dom[attr] = value;
        }

    }

    function MaJiang(selector){
        var z = this;
        /*init*/
        z.MJdom = Util.getEle(selector);
        Util.setAttr(z.MJdom,'width',800);
        Util.setAttr(z.MJdom,'height',700);
        z.Ctx = z.MJdom.getContext('2d');
        z._initcards();
        z._buildDrawInfo();
        z._drawByInfo();
    }

    /*function*

     */

    MaJiang.prototype = {
        _initcards:function(){
            /*生成麻将牌
                a_1_1 a_1_2 a_1_3 a_1_4
            */
            var z = this;
            z.cards = [];
            var colo_ = ["a","b","c"];
            for(var i = 0;i<3;i++){
                var p_1 = colo_[i];
                for(var m=1;m<=9;m++){
                    for(var n=1;n<=4;n++){
                        z.cards.push(p_1+"_"+m+"_"+n);
                    }
                }
            }
        },
        _buildDrawInfo:function(){
            var z =this;
            z.drawinfo = {};
            var _top = 0,_left = 130;
            for(var i = 0 ; i< z.cards.length;i++){
                if(i%12==0){
                    _top += 65;
                    _left = 130;
                }
                z.drawinfo[z.cards[i]] = {
                    type:'rect',
                    top:_top,
                    left:_left
                }

                _left+=45;
            }

        },


        _drawByInfo:function(){
            var z = this;
            for(i in z.drawinfo){
                switch(z.drawinfo[i].type){
                    case "rect":
                        z.Ctx.fillStyle="rgba(0,0,0,.5)";
                        z.Ctx.fillRect(z.drawinfo[i].left,z.drawinfo[i].top,40,60);

                        break;
                }
            }
        }

    }

    return init;
})();


var Game1 = MJ('#games');