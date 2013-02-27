/**
 * Created with JetBrains WebStorm.
 * User: SBLYH
 * Date: 13-2-27
 * Time: 下午11:11
 * To change this template use File | Settings | File Templates.
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
        }
    }

    function MaJiang(selector){
        var z = this;
        /*init*/
        z.MJdom = Util.getEle(selector);
        Util.setStyle(z.MJdom,'width','800px');
        Util.setStyle(z.MJdom,'height','700px');
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
            var _top = 0,_left = 0;
            for(var i = 0 ; i< z.cards.length;i++){
                if(i%9==0){
                    _top += 65;
                    _left =0;
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
                        z.Ctx.fillStyle="rgba(0,0,0,1)";
                        z.Ctx.fillRect(z.drawinfo[i].left,z.drawinfo[i].top,10,20);

                        break;
                }
            }
        }

    }

    return init;
})();


var Game1 = MJ('#games');