KISSY.add('kg/linetip/2.0.1/index',["node","base"],function(S ,require, exports, module) {
 ;(function(doc) {
    var $ = require('node').all;
    var Base = require('base');

    var svg_url = "http://www.w3.org/2000/svg";
    var animate = {
        delayLine: function(fns, durations) {
            var selfFn = arguments.callee;
            var time = durations.shift();
            fns.shift()();
            if (fns.length) {
                setTimeout(function() {
                    selfFn(fns, durations);
                }, time * 1000);
            }
        }
    };

    var styleDeal = {

        cssCircle: function(dom, r) {
            var dis = Math.PI * r * 2;
            $(dom).css({
                "stroke-dasharray": (dis + "," + dis),
                "stroke-dashoffset": 0
            });
        },

        cssPolyline: function(dom, points) {
            var start = points[0],
                next = points[1],
                end = points[2];
            var dis_1 = Math.sqrt((start[0] - next[0]) * (start[0] - next[0]) + (start[1] - next[1]) * (start[1] - next[1]));
            var dis_2 = Math.sqrt((end[0] - next[0]) * (end[0] - next[0]) + (end[1] - next[1]) * (end[1] - next[1]));
            var dis = dis_1 + dis_2;

            $(dom).css({
                "stroke-dasharray": (dis + "," + dis),
                "stroke-dashoffset": 0
            });
        },

        cssStrCommon: function(mark, obj) {
            var css = (mark + "{");
            for (var v in obj) {
                css += (v + ":" + obj[v] + ";");
            }
            css += "}";
            return css;
        },

        cssStrAnimation: function(name, fromCss, toCss) {
            return (' @-webkit-keyframes ' + name + ' {' +
                this.cssStrCommon("from", fromCss) +
                this.cssStrCommon("to", toCss) +
                '}');
        }
    };

    var lib = {
        $: function(id) {
            return $[0];
        },

        create: function(type, values) {
            var ele = doc.createElementNS(svg_url, type);
            if (type === "svg") {
                values["xmlns"] = svg_url;
            }
            $(ele).attr(values);
            return ele;
        },

        getHorizontalDir: function(points) {
            var len = points.length;
            return points[0][0] < points[len - 1][0] ? "left2right" : "right2left";
        },

        getLongitudinalDir: function(points) {
            var len = points.length;
            return points[0][1] < points[len - 1][1] ? "top2bottom" : "bottom2top";
        },

        getLineLength: function(points) {
            var length = 0;
            for (var i = 0, len = points.length; i < len; i++) {
                var pos_a = points[i],
                    pos_b = points[i + 1];
                if (pos_b) {
                    length += Math.sqrt((pos_b[0] - pos_a[0]) * (pos_b[0] - pos_a[0]) + (pos_b[1] - pos_a[1]) * (pos_b[1] - pos_a[1]))
                }
            }
            return length;
        }
    };


    var LineTip = function(options) {

        var defaultOptions = {
            // 整体线条圆环颜色
            color: "#000",
            // 整体尺寸
            size: 2,
            // 圆环半径，单位px
            radius: 4,
            // 绘图部分颜色透明度
            opacity: 0.5,
            // 动画持续时间
            animateTime: 1,
            // 动画速度类型，同css3
            animateType: "linear"
        }

        if (!options) {
            options = {}
        }

        this.pointsOps = S.merge(defaultOptions, options.points);
        this.lineOps = S.merge(defaultOptions, options.line);

    };

    S.extend(LineTip, Base, {
        addDefault: function (options) {
            for (var v in options) {
                if (!options[v] && options[v] !== false) {
                    options[v] = this.defaultOptions[v];
                }
            }
            return options;
        },


        countSVGWH: function(options) {
            var pos = options.points,
                html = options.html,
                max = [0, 0],
                svg_height = 0,
                html_width = html.width || 0,
                html_height = html.height || 0;

            for (var i = 0, len = pos.length; i < len; i++) {
                if (Math.abs(pos[i][0]) > Math.abs(max[0])) {
                    max[0] = pos[i][0];
                }
                if (Math.abs(pos[i][1]) > Math.abs(max[1])) {
                    max[1] = pos[i][1];
                }
            }
            if (lib.getHorizontalDir(pos) == "right2left") {
                html_width = 0;
            }

            if (lib.getLongitudinalDir(pos) == "top2bottom") {
                svg_height = Math.max(Math.abs(max[1]), html_height);
            } else {
                svg_height = Math.min(Math.abs(max[1]), html_height);
            }

            return {
                width: Math.abs(max[0]) + html_width,
                height: svg_height
            };
        },

        formatePoints: function(options) {
            var html = options.html,
                points = options.points,
                x_max = 0,
                y_max = 0,
                points_str = "";

            for (var i = 0, len = points.length; i < len; i++) {
                var pos = points[i];
                if (pos[0] < 0 && Math.abs(pos[0]) > Math.abs(x_max)) {
                    x_max = pos[0];
                }
                if (pos[1] < 0 && Math.abs(pos[1]) > Math.abs(y_max)) {
                    y_max = pos[1];
                }
            }

            for (i = 0; i < len; i++) {
                points[i][0] += (-1) * x_max;
                points[i][1] += (-1) * y_max;
            }

            for (i = 0; i < len; i++) {
                if (lib.getHorizontalDir(points) == "right2left") {
                    points[i][0] += html.width;
                }
                points_str += (points[i].join(" ") + ",");
            }

            points_str = points_str.substr(0, points_str.length - 1);

            return {
                arr: points,
                str: points_str
            };
        },

        fixCxCy: function(r, points, strokeWidth) {
            var dis = r / 2 + strokeWidth,

                x_dis = r / 2,
                y_dis = r / 2 + strokeWidth,

                headPoint = points[0],
                nextPoint = points[1],

                tailPoint = points[points.length - 1],
                prePoint = points[points.length - 2],

                head_flag = nextPoint[0] > headPoint[0] ? -1 : 1,

                x_tail_flag = prePoint[0] > tailPoint[0] ? -1 : 1,
                y_tail_flag = prePoint[1] > tailPoint[1] ? -1 : 1;

            return {
                head: [headPoint[0] + head_flag * dis, headPoint[1]],
                tail: [tailPoint[0] + x_tail_flag * x_dis, tailPoint[1] + y_tail_flag * y_dis]
            };
        },

        getValues: function(points, options) {
            var c_xy = this.fixCxCy(this.pointsOps.radius, points.arr, this.pointsOps.size);
            return {
                polyline: {
                    "class": "polyline",
                    "fill": "none",
                    "stroke": this.lineOps.color,
                    "stroke-width": this.lineOps.size,
                    "stroke-opacity": this.lineOps.opacity, // 一定的透明度可以减弱锯齿
                    "points": points.str
                },

                headCircle: {
                    "class": "head-circle",
                    "fill": "none",
                    "cx": c_xy["head"][0],
                    "cy": c_xy["head"][1],
                    "r": this.pointsOps.radius,
                    "stroke": this.pointsOps.color,
                    "stroke-width": this.pointsOps.size,
                    "stroke-opacity": this.pointsOps.opacity
                },

                tailCircle: {
                    "class": "tail-circle",
                    "fill": "none",
                    "cx": c_xy["tail"][0],
                    "cy": c_xy["tail"][1],
                    "r": this.pointsOps.radius,
                    "stroke": this.pointsOps.color,
                    "stroke-width": this.pointsOps.size,
                    "stroke-opacity": this.pointsOps.opacity
                },

                foreignObject: {
                    "x": lib.getHorizontalDir(points.arr) == "right2left" ? (c_xy["tail"][0] - options.html.width) : c_xy["tail"][0],
                    "y": c_xy["tail"][1],
                    "width": options.html.width || 0,
                    "height": options.html.height || 0
                }
            }
        },

        getRotate: function(pos) {
            var start_point = pos[0],
                middle_point = pos[1],
                end_point = pos[2];

            var tan = Math.atan((end_point[1] - middle_point[1]) / (end_point[0] - middle_point[0])),
                deg = 180 * tan / Math.PI,
                deg_flag, p_deg;
            if (lib.getHorizontalDir(pos) == "left2right") {
                deg_flag = (deg >= 0 ? -1 : 1);
                p_deg = deg_flag * (180 - Math.abs(deg));
            } else {
                deg_flag = (deg >= 0 ? 1 : -1);
                p_deg = deg_flag * (Math.abs(deg));
            }
            return p_deg;
        },

        add: function(options) {
            var points = this.formatePoints(options),
                svg_wh = this.countSVGWH(options),
                values = this.getValues(points, options),

                svg = lib.create("svg", svg_wh),
                polyline = lib.create("polyline", values["polyline"]),
                headCircle = lib.create("circle", values["headCircle"]),
                tailCircle = lib.create("circle", values["tailCircle"]),
                foreignObject = lib.create("foreignObject", values["foreignObject"]);

            styleDeal.cssCircle(headCircle, this.pointsOps.radius);
            styleDeal.cssPolyline(polyline, points.arr);
            styleDeal.cssCircle(tailCircle, this.pointsOps.radius);
            tailCircle.style.webkitTransform = "rotate(" + this.getRotate(points.arr) + "deg)";

            cssStyle = styleDeal.cssStrCommon("svg", {
                "padding": "10px"
            });

            cssStyle += styleDeal.cssStrCommon(".head-circle", {
                "-webkit-animation": "dash_circle " + this.pointsOps.animateTime + "s " + this.pointsOps.animateType + " 1 alternate"
            });

            cssStyle += styleDeal.cssStrCommon(".tail-circle", {
                "-webkit-transform-origin": "50% 50%",
                "-webkit-animation": "dash_circle " + this.pointsOps.animateTime + "s " + this.pointsOps.animateType + " 1 alternate"
            });

            cssStyle += styleDeal.cssStrCommon(".polyline", {
                "-webkit-animation": "dash " + this.lineOps.animateTime + "s " + this.lineOps.animateType + " 1 alternate"
            });


            cssStyle += styleDeal.cssStrAnimation("dash_circle", {
                "stroke-dashoffset": this.pointsOps.radius * 2 * Math.PI
            }, {
                "stroke-dashoffset": 0
            });

            cssStyle += styleDeal.cssStrAnimation("dash", {
                "stroke-dashoffset": lib.getLineLength(points.arr)
            }, {
                "stroke-dashoffset": 0
            });


            if (!lib.$("lineChartStyle")) {
                var styleCon = doc.createElement("style");
                styleCon.id = "lineChartStyle";
                styleCon.innerHTML = cssStyle;
                doc.getElementsByTagName("head")[0].appendChild(styleCon);
            }

            foreignObject.innerHTML = options.html.tpl();

            animate.delayLine([
                function() {
                    svg.appendChild(headCircle);
                },
                function() {
                    svg.appendChild(polyline);
                },
                function() {
                    svg.appendChild(tailCircle);
                },
                function() {
                    svg.appendChild(foreignObject);
                }
            ], [
                this.pointsOps.animateTime,
                this.lineOps.animateTime,
                this.pointsOps.animateTime
            ]);

            doc.getElementsByTagName("body")[0].appendChild(svg);
        }
    }, {
        ATTRS: {
            $target: {
                value: '',
                getter: function(v) {
                    return $(v);
                }
            }
        }
    });

    module.exports = LineTip;

})(document);
});