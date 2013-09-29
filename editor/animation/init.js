//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            //Dont change the code before it

            var canvas = new ThreePointsCircle();
            canvas.createCanvas($content.find(".explanation")[0]);
            canvas.createPlane();
            canvas.createPoints(checkioInput);
            canvas.createCircle(rightResult);


            this_e.setAnimationHeight($content.height() + 60);

        });

        var $tryit;
        var tcanvas;
        var tooltip = false;
//
        ext.set_console_process_ret(function (this_e, ret) {

            tcanvas.removeCircle();
            if (typeof(ret) === "string") {
                ret = ret.replace(/\'/g, "");
                var reg = /^\(x-\d+(?:\.\d+)?\)\^2\+\(y-\d+(?:\.\d+)?\)\^2=\d+(?:\.\d+)?\^2$/.exec(ret);
                if (reg) {
                    $tryit.find(".checkio-result-in").html("Return:<br>" +ret);
                    setTimeout(tcanvas.createCircle(ret), 200);
                }
                else {
                    $tryit.find(".checkio-result-in").html("Cant parse:<br>" +ret);
                }
            }
            else {
                $tryit.find(".checkio-result-in").html("Return not a string:<br>" +ret);
            }
        });

        ext.set_generate_animation_panel(function (this_e) {

            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit')));

            tcanvas = new ThreePointsCircle();
            tcanvas.createCanvas($tryit.find(".tryit-canvas")[0]);
            tcanvas.createPlane();
            tcanvas.createFeedback(this_e);
            $tryit.find(".tryit-canvas").mouseenter(function (e) {
                if (tooltip) {
                    return false;
                }
                var $tooltip = $tryit.find(".tryit-canvas .tooltip");
                $tooltip.fadeIn(1000);
                setTimeout(function () {
                    $tooltip.fadeOut(1000);
                }, 2000);
                tooltip = true;
                return false;
            });

        });

        var colorOrange4 = "#F0801A";
        var colorOrange3 = "#FA8F00";
        var colorOrange2 = "#FAA600";
        var colorOrange1 = "#FABA00";

        var colorBlue4 = "#294270";
        var colorBlue3 = "#006CA9";
        var colorBlue2 = "#65A1CF";
        var colorBlue1 = "#8FC7ED";

        var colorGrey4 = "#737370";
        var colorGrey3 = "#9D9E9E";
        var colorGrey2 = "#C5C6C6";
        var colorGrey1 = "#EBEDED";

        var colorWhite = "#FFFFFF";

        function createPath(x1, y1, x2, y2) {
            return "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
        }

        function ThreePointsCircle() {
            var zx = 20;
            var zy = 20;
            var cellSize = 20;
            var cellN = 10;
            var fullSize = 2 * zx + cellSize * (cellN + 1);

            var colorDark = "#294270";
            var colorOrange = "#F0801A";
            var colorBlue = "#6BA3CF";
            var colorDarkBlue = "#0A82BD";
            var colorWhite = "#FFFFFF";
            var attrAxis = {"stroke": colorDark, "stroke-width": 2, "arrow-end": "classic"};
            var attrCircle = {"stroke": colorDarkBlue, "stroke-width": 4};
            var attrInnerLine = {"stroke": colorBlue, "stroke-width": 1, "stroke-dasharray": ["-"]};
            var attrText = {"font-family": "Verdana", "font-size": 14, "stroke": colorDark};
            var attrPoint = {"stroke": colorOrange, "fill": colorOrange, "r": cellSize / 4};

            var delay = 400;

            var paper;
            var points;
            var circle;
            var activeRect;
            var countP = 0;


            this.createCanvas = function(dom){
                paper = Raphael(dom, fullSize, fullSize, 0, 0);
            };

            this.createPlane = function(){
                for (var i = 1; i <= cellN; i++) {
                    paper.path(createPath(
                        zx, fullSize - zy - i * cellSize,
                        zx + cellN * cellSize + zx / 2, fullSize - zy - i * cellSize)
                    ).attr(attrInnerLine);

                    paper.path(createPath(
                        zx + i * cellSize, fullSize - zy,
                        zx + i * cellSize, fullSize - zy - cellN * cellSize - zy / 2)
                    ).attr(attrInnerLine);
                    paper.text(zx + i * cellSize, fullSize - zy / 2, String(i)).attr(attrText);
                    paper.text(zx / 2, fullSize - zy - i * cellSize, String(i)).attr(attrText);
                }

                paper.path(createPath(zx, fullSize - zy / 2, zx, zy / 2)).attr(attrAxis);
                paper.text(zx / 2, zy / 2, "Y").attr(attrText);
                paper.path(createPath(zx / 2, fullSize - zy, fullSize - zx / 2, fullSize - zy)).attr(attrAxis);
                paper.text(fullSize - zx / 2, fullSize - zy / 2, "X").attr(attrText);
                paper.text(zx / 2, fullSize - zy / 2, "0").attr(attrText);
            };

            this.createPoints = function(pointString) {
                points = paper.set();
                var r = pointString.match(/\d+/gi);
                for (var i = 0; i < 6; i += 2){
                    var p = paper.circle(zx + r[i] * cellSize,
                        fullSize - (zy + r[i + 1] * cellSize),
                        1).attr(attrPoint);
                    points.push(p);
                }
            };

            this.createFeedback = function(this_e) {
                if (!points) {
                    points = paper.set();
                }
                activeRect = paper.rect(zx + cellSize / 2,
                    fullSize - (zy + cellSize / 2 + cellSize * cellN),
                    cellSize * cellN,
                    cellSize * cellN
                ).attr({"fill": colorWhite, "fill-opacity": 0, "opacity": 0});
                activeRect.toFront();
                activeRect.click(function(e){
                    var clx = e.offsetX || e.layerX;
                    var cly = e.offsetY || e.layerY;
                    var x = Math.round((clx - zx) / cellSize);
                    var y = Math.round((fullSize - cly - zy) / cellSize);
                    var p = paper.circle(
                        zx + x * cellSize,
                        fullSize - (zy + y * cellSize),
                        1).attr(attrPoint);
                    p.coor = "(" + x + "," + y + ")";
                    if (points[countP]) {
                        points[countP].remove();
                        points[countP] = p;
                    }
                    else {
                        points.push(p)
                    }
                    countP = (countP + 1) % 3;
                    if (points && points.length == 3) {
                        var data = [];
                        for (var i = 0; i < 3; i++) {
                            data.push(points[i].coor);
                        }
                        this_e.sendToConsoleCheckiO(data.join(","));
                        e.stopPropagation();
                    }
                });

            };
            this.createCircle = function(equation){
                var r = /\(x([+-]\d+(?:\.\d+)?)\)\^2\+\(y([+-]\d+(?:\.\d+)?)\)\^2=(\d+(?:\.\d+)?)\^2/.exec(equation);
                //var r = /\(x-(\d+)\)\^2+\(y-(\d+)\)\^2=(\d+\.\d+)\^2/.exec(equation);
                var radius = r[3];
                var a = -r[1];
                var b = -r[2];
                circle = paper.circle(zx + a * cellSize,
                    fullSize - (zy + b * cellSize), 1).attr(attrCircle);

                circle.animate({
                    "r": radius * cellSize}, delay);
                for (var i = 0; i < points.length; i++){
                    points[i].toFront();
                }
            };

            this.removeCircle = function() {
                if (circle) {
                    circle.remove();
                }
            }
        }



    }
);
