import CLASS from './class';
import { inherit, Component } from './core';
import { isValue, isFunction, isString, isEmpty } from './util';

export var c3_axis_fn;
export var c3_axis_internal_fn;

function AxisInternal(component, params) {
    var $$$ = this;
    $$$.component = component;
    $$$.params = params || {};

    $$$.d3 = component.d3;
    $$$.scale = $$$.d3.scale.linear();
    $$$.range;
    $$$.orient = "bottom";
    $$$.innerTickSize = 6;
    $$$.outerTickSize = this.params.withOuterTick ? 6 : 0;
    $$$.tickPadding = 3;
    $$$.tickValues = null;
    $$$.tickFormat;
    $$$.tickArguments;

    $$$.tickOffset = 0;
    $$$.tickCulling = true;
    $$$.tickCentered;
    $$$.tickTextCharSize;
    $$$.tickTextRotate = $$$.params.tickTextRotate;
    $$$.tickLength;

    $$$.axis = $$$.generateAxis();
}
c3_axis_internal_fn = AxisInternal.prototype;

c3_axis_internal_fn.axisX = function (selection, x, tickOffset) {
    selection.attr("transform", function (d) {
        return "translate(" + Math.ceil(x(d) + tickOffset) + ", 0)";
    });
};
c3_axis_internal_fn.axisY = function (selection, y) {
    selection.attr("transform", function (d) {
        return "translate(0," + Math.ceil(y(d)) + ")";
    });
};
c3_axis_internal_fn.scaleExtent = function (domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
};
c3_axis_internal_fn.generateTicks = function (scale) {
    var $$$ = this;
    var i, domain, ticks = [];
    if (scale.ticks) {
        return scale.ticks.apply(scale, $$$.tickArguments);
    }
    domain = scale.domain();
    for (i = Math.ceil(domain[0]); i < domain[1]; i++) {
        ticks.push(i);
    }
    if (ticks.length > 0 && ticks[0] > 0) {
        ticks.unshift(ticks[0] - (ticks[1] - ticks[0]));
    }
    return ticks;
};
c3_axis_internal_fn.copyScale = function () {
    var $$$ = this;
    var newScale = $$$.scale.copy(), domain;
    if ($$$.params.isCategory) {
        domain = $$$.scale.domain();
        newScale.domain([domain[0], domain[1] - 1]);
    }
    return newScale;
};
c3_axis_internal_fn.textFormatted = function (v) {
    var formatted = this.tickFormat ? this.tickFormat(v) : v;
    return typeof formatted !== 'undefined' ? formatted : '';
};
c3_axis_internal_fn.updateRange = function () {
    var $$$ = this;
    $$$.range = $$$.scale.rangeExtent ? $$$.scale.rangeExtent() : $$$.scaleExtent($$$.scale.range());
    return $$$.range;
};
c3_axis_internal_fn.updateTickTextCharSize = function (tick) {
    var $$$ = this;
    if ($$$.tickTextCharSize) {
        return $$$.tickTextCharSize;
    }
    var size = {
        h: 11.5,
        w: 5.5
    };
    tick.select('text').text($$$.textFormatted).each(function (d) {
        var box = this.getBoundingClientRect(),
            text = $$$.textFormatted(d),
            h = box.height,
            w = text ? (box.width / text.length) : undefined;
        if (h && w) {
            size.h = h;
            size.w = w;
        }
    }).text('');
    $$$.tickTextCharSize = size;
    return size;
};
c3_axis_internal_fn.transitionise = function (selection) {
    return this.params.withoutTransition ? selection : this.d3.transition(selection);
};
c3_axis_internal_fn.isVertical = function () {
    return this.orient === 'left' || this.orient === 'right';
};
c3_axis_internal_fn.tspanData = function (d, i, ticks, scale) {
    var $$$ = this;
    var splitted = $$$.params.tickMultiline ? $$$.splitTickText(d, ticks, scale) : [].concat($$$.textFormatted(d));
    return splitted.map(function (s) {
        return { index: i, splitted: s, length: splitted.length };
    });
};
c3_axis_internal_fn.splitTickText = function (d, ticks, scale) {
    var $$$ = this,
        tickText = $$$.textFormatted(d),
        maxWidth = $$$.params.tickWidth,
        subtext, spaceIndex, textWidth, splitted = [];

    if (Object.prototype.toString.call(tickText) === "[object Array]") {
        return tickText;
    }

    if (!maxWidth || maxWidth <= 0) {
        maxWidth = $$$.isVertical() ? 95 : $$$.params.isCategory ? (Math.ceil(scale(ticks[1]) - scale(ticks[0])) - 12) : 110;
    }

    function split(splitted, text) {
        spaceIndex = undefined;
        for (var i = 1; i < text.length; i++) {
            if (text.charAt(i) === ' ') {
                spaceIndex = i;
            }
            subtext = text.substr(0, i + 1);
            textWidth = $$$.tickTextCharSize.w * subtext.length;
            // if text width gets over tick width, split by space index or crrent index
            if (maxWidth < textWidth) {
                return split(
                    splitted.concat(text.substr(0, spaceIndex ? spaceIndex : i)),
                    text.slice(spaceIndex ? spaceIndex + 1 : i)
                );
            }
        }
        return splitted.concat(text);
    }

    return split(splitted, tickText + "");
};
c3_axis_internal_fn.updateTickLength = function () {
    var $$$ = this;
    $$$.tickLength = Math.max($$$.innerTickSize, 0) + $$$.tickPadding;
};
c3_axis_internal_fn.lineY2 = function (d) {
    var $$$ = this,
        tickPosition = $$$.scale(d) + ($$$.tickCentered ? 0 : $$$.tickOffset);
    return $$$.range[0] < tickPosition && tickPosition < $$$.range[1] ? $$$.innerTickSize : 0;
};
c3_axis_internal_fn.textY = function (){
    var $$$ = this, rotate = $$$.tickTextRotate;
    return rotate ? 11.5 - 2.5 * (rotate / 15) * (rotate > 0 ? 1 : -1) : $$$.tickLength;
};
c3_axis_internal_fn.textTransform = function () {
    var $$$ = this, rotate = $$$.tickTextRotate;
    return rotate ? "rotate(" + rotate + ")" : "";
};
c3_axis_internal_fn.textTextAnchor = function () {
    var $$$ = this, rotate = $$$.tickTextRotate;
    return rotate ? (rotate > 0 ? "start" : "end") : "middle";
};
c3_axis_internal_fn.tspanDx = function () {
    var $$$ = this, rotate = $$$.tickTextRotate;
    return rotate ? 8 * Math.sin(Math.PI * (rotate / 180)) : 0;
};
c3_axis_internal_fn.tspanDy = function (d, i) {
    var $$$ = this,
        dy = $$$.tickTextCharSize.h;
    if (i === 0) {
        if ($$$.isVertical()) {
            dy = -((d.length - 1) * ($$$.tickTextCharSize.h / 2) - 3);
        } else {
            dy = ".71em";
        }
    }
    return dy;
};


c3_axis_internal_fn.generateAxis = function () {
    var $$$ = this, d3 = $$$.d3, params = $$$.params;
    function axis(g) {
        g.each(function () {
            var g = axis.g = d3.select(this);

            var scale0 = this.__chart__ || $$$.scale,
                scale1 = this.__chart__ = $$$.copyScale();

            var ticks = $$$.tickValues ? $$$.tickValues : $$$.generateTicks(scale1),
                tick = g.selectAll(".tick").data(ticks, scale1),
                tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", 1e-6),
                // MEMO: No exit transition. The reason is this transition affects max tick width calculation because old tick will be included in the ticks.
                tickExit = tick.exit().remove(),
                tickUpdate = $$$.transitionise(tick).style("opacity", 1),
                tickTransform, tickX, tickY;

            if (params.isCategory) {
                $$$.tickOffset = Math.ceil((scale1(1) - scale1(0)) / 2);
                tickX = $$$.tickCentered ? 0 : $$$.tickOffset;
                tickY = $$$.tickCentered ? $$$.tickOffset : 0;
            } else {
                $$$.tickOffset = tickX = 0;
            }

            tickEnter.append("line");
            tickEnter.append("text");

            $$$.updateRange();
            $$$.updateTickLength();
            $$$.updateTickTextCharSize(g.select('.tick'));

            var lineUpdate = tickUpdate.select("line"),
                textUpdate = tickUpdate.select("text"),
                tspanUpdate = tick.select("text").selectAll('tspan')
                    .data(function (d, i) { return $$$.tspanData(d, i, ticks, scale1); });

            tspanUpdate.enter().append('tspan');
            tspanUpdate.exit().remove();
            tspanUpdate.text(function (d) { return d.splitted; });

            var path = g.selectAll(".domain").data([ 0 ]),
                pathUpdate = (path.enter().append("path").attr("class", "domain"), $$$.transitionise(path));

            // TODO: each attr should be one function and change its behavior by $$$.orient, probably
            switch ($$$.orient) {
            case "bottom":
                {
                    tickTransform = $$$.axisX;
                    lineUpdate.attr("x1", tickX)
                        .attr("x2", tickX)
                        .attr("y2", function (d, i) { return $$$.lineY2(d, i); });
                    textUpdate.attr("x", 0)
                        .attr("y", function (d, i) { return $$$.textY(d, i); })
                        .attr("transform", function (d, i) { return $$$.textTransform(d, i); })
                        .style("text-anchor", function (d, i) { return $$$.textTextAnchor(d, i); });
                    tspanUpdate.attr('x', 0)
                        .attr("dy", function (d, i) { return $$$.tspanDy(d, i); })
                        .attr('dx', function (d, i) { return $$$.tspanDx(d, i); });
                    pathUpdate.attr("d", "M" + $$$.range[0] + "," + $$$.outerTickSize + "V0H" + $$$.range[1] + "V" + $$$.outerTickSize);
                    break;
                }
            case "top":
                {
                    // TODO: rotated tick text
                    tickTransform = $$$.axisX;
                    lineUpdate.attr("x2", 0)
                        .attr("y2", -$$$.innerTickSize);
                    textUpdate.attr("x", 0)
                        .attr("y", -$$$.tickLength)
                        .style("text-anchor", "middle");
                    tspanUpdate.attr('x', 0)
                        .attr("dy", "0em");
                    pathUpdate.attr("d", "M" + $$$.range[0] + "," + -$$$.outerTickSize + "V0H" + $$$.range[1] + "V" + -$$$.outerTickSize);
                    break;
                }
            case "left":
                {
                    tickTransform = $$$.axisY;
                    lineUpdate.attr("x2", -$$$.innerTickSize)
                        .attr("y1", tickY)
                        .attr("y2", tickY);
                    textUpdate.attr("x", -$$$.tickLength)
                        .attr("y", $$$.tickOffset)
                        .style("text-anchor", "end");
                    tspanUpdate.attr('x', -$$$.tickLength)
                        .attr("dy", function (d, i) { return $$$.tspanDy(d, i); });
                    pathUpdate.attr("d", "M" + -$$$.outerTickSize + "," + $$$.range[0] + "H0V" + $$$.range[1] + "H" + -$$$.outerTickSize);
                    break;
                }
            case "right":
                {
                    tickTransform = $$$.axisY;
                    lineUpdate.attr("x2", $$$.innerTickSize)
                        .attr("y2", 0);
                    textUpdate.attr("x", $$$.tickLength)
                        .attr("y", 0)
                        .style("text-anchor", "start");
                    tspanUpdate.attr('x', $$$.tickLength)
                        .attr("dy", function (d, i) { return $$$.tspanDy(d, i); });
                    pathUpdate.attr("d", "M" + $$$.outerTickSize + "," + $$$.range[0] + "H0V" + $$$.range[1] + "H" + $$$.outerTickSize);
                    break;
                }
            }
            if (scale1.rangeBand) {
                var x = scale1, dx = x.rangeBand() / 2;
                scale0 = scale1 = function (d) {
                    return x(d) + dx;
                };
            } else if (scale0.rangeBand) {
                scale0 = scale1;
            } else {
                tickExit.call(tickTransform, scale1, $$$.tickOffset);
            }
            tickEnter.call(tickTransform, scale0, $$$.tickOffset);
            tickUpdate.call(tickTransform, scale1, $$$.tickOffset);
        });
    }
    axis.scale = function (x) {
        if (!arguments.length) { return $$$.scale; }
        $$$.scale = x;
        return axis;
    };
    axis.orient = function (x) {
        if (!arguments.length) { return $$$.orient; }
        $$$.orient = x in {top: 1, right: 1, bottom: 1, left: 1} ? x + "" : "bottom";
        return axis;
    };
    axis.tickFormat = function (format) {
        if (!arguments.length) { return $$$.tickFormat; }
        $$$.tickFormat = format;
        return axis;
    };
    axis.tickCentered = function (isCentered) {
        if (!arguments.length) { return $$$.tickCentered; }
        $$$.tickCentered = isCentered;
        return axis;
    };
    axis.tickOffset = function () {
        return $$$.tickOffset;
    };
    axis.tickInterval = function () {
        var interval, length;
        if (params.isCategory) {
            interval = $$$.tickOffset * 2;
        }
        else {
            length = axis.g.select('path.domain').node().getTotalLength() - $$$.outerTickSize * 2;
            interval = length / axis.g.selectAll('line').size();
        }
        return interval === Infinity ? 0 : interval;
    };
    axis.ticks = function () {
        if (!arguments.length) { return $$$.tickArguments; }
        $$$.tickArguments = arguments;
        return axis;
    };
    axis.tickCulling = function (culling) {
        if (!arguments.length) { return $$$.tickCulling; }
        $$$.tickCulling = culling;
        return axis;
    };
    axis.tickValues = function (x) {
        if (typeof x === 'function') {
            $$$.tickValues = function () {
                return x($$$.scale.domain());
            };
        }
        else {
            if (!arguments.length) { return $$$.tickValues; }
            $$$.tickValues = x;
        }
        return axis;
    };
    return axis;
};

export default function Axis(owner) {
    var fn = {
        fn: c3_axis_fn,
        internal: {
            fn: c3_axis_internal_fn
        }
    };
    this.d3 = owner.d3;
    this.internal = AxisInternal;
    Component.call(this, owner, 'axis', fn);
}
inherit(Component, Axis);
c3_axis_fn = Axis.prototype;

c3_axis_fn.init = function init() {
    var $$ = this.owner, config = $$.config, main = $$.main;
    $$.axes.x = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisX)
        .attr("clip-path", $$.clipPathForXAxis)
        .attr("transform", $$.getTranslate('x'))
        .style("visibility", config.axis_x_show ? 'visible' : 'hidden');
    $$.axes.x.append("text")
        .attr("class", CLASS.axisXLabel)
        .attr("transform", config.axis_rotated ? "rotate(-90)" : "")
        .style("text-anchor", this.textAnchorForXAxisLabel.bind(this));
    $$.axes.y = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisY)
        .attr("clip-path", config.axis_y_inner ? "" : $$.clipPathForYAxis)
        .attr("transform", $$.getTranslate('y'))
        .style("visibility", config.axis_y_show ? 'visible' : 'hidden');
    $$.axes.y.append("text")
        .attr("class", CLASS.axisYLabel)
        .attr("transform", config.axis_rotated ? "" : "rotate(-90)")
        .style("text-anchor", this.textAnchorForYAxisLabel.bind(this));

    $$.axes.y2 = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisY2)
        // clip-path?
        .attr("transform", $$.getTranslate('y2'))
        .style("visibility", config.axis_y2_show ? 'visible' : 'hidden');
    $$.axes.y2.append("text")
        .attr("class", CLASS.axisY2Label)
        .attr("transform", config.axis_rotated ? "" : "rotate(-90)")
        .style("text-anchor", this.textAnchorForY2AxisLabel.bind(this));
};
c3_axis_fn.getXAxis = function getXAxis(scale, orient, tickFormat, tickValues, withOuterTick, withoutTransition, withoutRotateTickText) {
    var $$ = this.owner, config = $$.config,
        axisParams = {
            isCategory: $$.isCategorized(),
            withOuterTick: withOuterTick,
            tickMultiline: config.axis_x_tick_multiline,
            tickWidth: config.axis_x_tick_width,
            tickTextRotate: withoutRotateTickText ? 0 : config.axis_x_tick_rotate,
            withoutTransition: withoutTransition,
        },
        axis = new this.internal(this, axisParams).axis.scale(scale).orient(orient);

    if ($$.isTimeSeries() && tickValues && typeof tickValues !== "function") {
        tickValues = tickValues.map(function (v) { return $$.parseDate(v); });
    }

    // Set tick
    axis.tickFormat(tickFormat).tickValues(tickValues);
    if ($$.isCategorized()) {
        axis.tickCentered(config.axis_x_tick_centered);
        if (isEmpty(config.axis_x_tick_culling)) {
            config.axis_x_tick_culling = false;
        }
    }

    return axis;
};
c3_axis_fn.updateXAxisTickValues = function updateXAxisTickValues(targets, axis) {
    var $$ = this.owner, config = $$.config, tickValues;
    if (config.axis_x_tick_fit || config.axis_x_tick_count) {
        tickValues = this.generateTickValues($$.mapTargetsToUniqueXs(targets), config.axis_x_tick_count, $$.isTimeSeries());
    }
    if (axis) {
        axis.tickValues(tickValues);
    } else {
        $$.xAxis.tickValues(tickValues);
        $$.subXAxis.tickValues(tickValues);
    }
    return tickValues;
};
c3_axis_fn.getYAxis = function getYAxis(scale, orient, tickFormat, tickValues, withOuterTick, withoutTransition, withoutRotateTickText) {
    var $$ = this.owner, config = $$.config,
        axisParams = {
            withOuterTick: withOuterTick,
            withoutTransition: withoutTransition,
            tickTextRotate: withoutRotateTickText ? 0 : config.axis_y_tick_rotate
        },
        axis = new this.internal(this, axisParams).axis.scale(scale).orient(orient).tickFormat(tickFormat);
    if ($$.isTimeSeriesY()) {
        axis.ticks($$.d3.time[config.axis_y_tick_time_value], config.axis_y_tick_time_interval);
    } else {
        axis.tickValues(tickValues);
    }
    return axis;
};
c3_axis_fn.getId = function getId(id) {
    var config = this.owner.config;
    return id in config.data_axes ? config.data_axes[id] : 'y';
};
c3_axis_fn.getXAxisTickFormat = function getXAxisTickFormat() {
    var $$ = this.owner, config = $$.config,
        format = $$.isTimeSeries() ? $$.defaultAxisTimeFormat : $$.isCategorized() ? $$.categoryName : function (v) { return v < 0 ? v.toFixed(0) : v; };
    if (config.axis_x_tick_format) {
        if (isFunction(config.axis_x_tick_format)) {
            format = config.axis_x_tick_format;
        } else if ($$.isTimeSeries()) {
            format = function (date) {
                return date ? $$.axisTimeFormat(config.axis_x_tick_format)(date) : "";
            };
        }
    }
    return isFunction(format) ? function (v) { return format.call($$, v); } : format;
};
c3_axis_fn.getTickValues = function getTickValues(tickValues, axis) {
    return tickValues ? tickValues : axis ? axis.tickValues() : undefined;
};
c3_axis_fn.getXAxisTickValues = function getXAxisTickValues() {
    return this.getTickValues(this.owner.config.axis_x_tick_values, this.owner.xAxis);
};
c3_axis_fn.getYAxisTickValues = function getYAxisTickValues() {
    return this.getTickValues(this.owner.config.axis_y_tick_values, this.owner.yAxis);
};
c3_axis_fn.getY2AxisTickValues = function getY2AxisTickValues() {
    return this.getTickValues(this.owner.config.axis_y2_tick_values, this.owner.y2Axis);
};
c3_axis_fn.getLabelOptionByAxisId = function getLabelOptionByAxisId(axisId) {
    var $$ = this.owner, config = $$.config, option;
    if (axisId === 'y') {
        option = config.axis_y_label;
    } else if (axisId === 'y2') {
        option = config.axis_y2_label;
    } else if (axisId === 'x') {
        option = config.axis_x_label;
    }
    return option;
};
c3_axis_fn.getLabelText = function getLabelText(axisId) {
    var option = this.getLabelOptionByAxisId(axisId);
    return isString(option) ? option : option ? option.text : null;
};
c3_axis_fn.setLabelText = function setLabelText(axisId, text) {
    var $$ = this.owner, config = $$.config,
        option = this.getLabelOptionByAxisId(axisId);
    if (isString(option)) {
        if (axisId === 'y') {
            config.axis_y_label = text;
        } else if (axisId === 'y2') {
            config.axis_y2_label = text;
        } else if (axisId === 'x') {
            config.axis_x_label = text;
        }
    } else if (option) {
        option.text = text;
    }
};
c3_axis_fn.getLabelPosition = function getLabelPosition(axisId, defaultPosition) {
    var option = this.getLabelOptionByAxisId(axisId),
        position = (option && typeof option === 'object' && option.position) ? option.position : defaultPosition;
    return {
        isInner: position.indexOf('inner') >= 0,
        isOuter: position.indexOf('outer') >= 0,
        isLeft: position.indexOf('left') >= 0,
        isCenter: position.indexOf('center') >= 0,
        isRight: position.indexOf('right') >= 0,
        isTop: position.indexOf('top') >= 0,
        isMiddle: position.indexOf('middle') >= 0,
        isBottom: position.indexOf('bottom') >= 0
    };
};
c3_axis_fn.getXAxisLabelPosition = function getXAxisLabelPosition() {
    return this.getLabelPosition('x', this.owner.config.axis_rotated ? 'inner-top' : 'inner-right');
};
c3_axis_fn.getYAxisLabelPosition = function getYAxisLabelPosition() {
    return this.getLabelPosition('y', this.owner.config.axis_rotated ? 'inner-right' : 'inner-top');
};
c3_axis_fn.getY2AxisLabelPosition = function getY2AxisLabelPosition() {
    return this.getLabelPosition('y2', this.owner.config.axis_rotated ? 'inner-right' : 'inner-top');
};
c3_axis_fn.getLabelPositionById = function getLabelPositionById(id) {
    return id === 'y2' ? this.getY2AxisLabelPosition() : id === 'y' ? this.getYAxisLabelPosition() : this.getXAxisLabelPosition();
};
c3_axis_fn.textForXAxisLabel = function textForXAxisLabel() {
    return this.getLabelText('x');
};
c3_axis_fn.textForYAxisLabel = function textForYAxisLabel() {
    return this.getLabelText('y');
};
c3_axis_fn.textForY2AxisLabel = function textForY2AxisLabel() {
    return this.getLabelText('y2');
};
c3_axis_fn.xForAxisLabel = function xForAxisLabel(forHorizontal, position) {
    var $$ = this.owner;
    if (forHorizontal) {
        return position.isLeft ? 0 : position.isCenter ? $$.width / 2 : $$.width;
    } else {
        return position.isBottom ? -$$.height : position.isMiddle ? -$$.height / 2 : 0;
    }
};
c3_axis_fn.dxForAxisLabel = function dxForAxisLabel(forHorizontal, position) {
    if (forHorizontal) {
        return position.isLeft ? "0.5em" : position.isRight ? "-0.5em" : "0";
    } else {
        return position.isTop ? "-0.5em" : position.isBottom ? "0.5em" : "0";
    }
};
c3_axis_fn.textAnchorForAxisLabel = function textAnchorForAxisLabel(forHorizontal, position) {
    if (forHorizontal) {
        return position.isLeft ? 'start' : position.isCenter ? 'middle' : 'end';
    } else {
        return position.isBottom ? 'start' : position.isMiddle ? 'middle' : 'end';
    }
};
c3_axis_fn.xForXAxisLabel = function xForXAxisLabel() {
    return this.xForAxisLabel(!this.owner.config.axis_rotated, this.getXAxisLabelPosition());
};
c3_axis_fn.xForYAxisLabel = function xForYAxisLabel() {
    return this.xForAxisLabel(this.owner.config.axis_rotated, this.getYAxisLabelPosition());
};
c3_axis_fn.xForY2AxisLabel = function xForY2AxisLabel() {
    return this.xForAxisLabel(this.owner.config.axis_rotated, this.getY2AxisLabelPosition());
};
c3_axis_fn.dxForXAxisLabel = function dxForXAxisLabel() {
    return this.dxForAxisLabel(!this.owner.config.axis_rotated, this.getXAxisLabelPosition());
};
c3_axis_fn.dxForYAxisLabel = function dxForYAxisLabel() {
    return this.dxForAxisLabel(this.owner.config.axis_rotated, this.getYAxisLabelPosition());
};
c3_axis_fn.dxForY2AxisLabel = function dxForY2AxisLabel() {
    return this.dxForAxisLabel(this.owner.config.axis_rotated, this.getY2AxisLabelPosition());
};
c3_axis_fn.dyForXAxisLabel = function dyForXAxisLabel() {
    var $$ = this.owner, config = $$.config,
        position = this.getXAxisLabelPosition();
    if (config.axis_rotated) {
        return position.isInner ? "1.2em" : -25 - this.getMaxTickWidth('x');
    } else {
        return position.isInner ? "-0.5em" : config.axis_x_height ? config.axis_x_height - 10 : "3em";
    }
};
c3_axis_fn.dyForYAxisLabel = function dyForYAxisLabel() {
    var $$ = this.owner,
        position = this.getYAxisLabelPosition();
    if ($$.config.axis_rotated) {
        return position.isInner ? "-0.5em" : "3em";
    } else {
        return position.isInner ? "1.2em" : -10 - ($$.config.axis_y_inner ? 0 : (this.getMaxTickWidth('y') + 10));
    }
};
c3_axis_fn.dyForY2AxisLabel = function dyForY2AxisLabel() {
    var $$ = this.owner,
        position = this.getY2AxisLabelPosition();
    if ($$.config.axis_rotated) {
        return position.isInner ? "1.2em" : "-2.2em";
    } else {
        return position.isInner ? "-0.5em" : 15 + ($$.config.axis_y2_inner ? 0 : (this.getMaxTickWidth('y2') + 15));
    }
};
c3_axis_fn.textAnchorForXAxisLabel = function textAnchorForXAxisLabel() {
    var $$ = this.owner;
    return this.textAnchorForAxisLabel(!$$.config.axis_rotated, this.getXAxisLabelPosition());
};
c3_axis_fn.textAnchorForYAxisLabel = function textAnchorForYAxisLabel() {
    var $$ = this.owner;
    return this.textAnchorForAxisLabel($$.config.axis_rotated, this.getYAxisLabelPosition());
};
c3_axis_fn.textAnchorForY2AxisLabel = function textAnchorForY2AxisLabel() {
    var $$ = this.owner;
    return this.textAnchorForAxisLabel($$.config.axis_rotated, this.getY2AxisLabelPosition());
};
c3_axis_fn.getMaxTickWidth = function getMaxTickWidth(id, withoutRecompute) {
    var $$ = this.owner, config = $$.config,
        maxWidth = 0, targetsToShow, scale, axis, dummy, svg;
    if (withoutRecompute && $$.currentMaxTickWidths[id]) {
        return $$.currentMaxTickWidths[id];
    }
    if ($$.svg) {
        targetsToShow = $$.filterTargetsToShow($$.data.targets);
        if (id === 'y') {
            scale = $$.y.copy().domain($$.getYDomain(targetsToShow, 'y'));
            axis = this.getYAxis(scale, $$.yOrient, config.axis_y_tick_format, $$.yAxisTickValues, false, true, true);
        } else if (id === 'y2') {
            scale = $$.y2.copy().domain($$.getYDomain(targetsToShow, 'y2'));
            axis = this.getYAxis(scale, $$.y2Orient, config.axis_y2_tick_format, $$.y2AxisTickValues, false, true, true);
        } else {
            scale = $$.x.copy().domain($$.getXDomain(targetsToShow));
            axis = this.getXAxis(scale, $$.xOrient, $$.xAxisTickFormat, $$.xAxisTickValues, false, true, true);
            this.updateXAxisTickValues(targetsToShow, axis);
        }
        dummy = $$.d3.select('body').append('div').classed('c3', true);
        svg = dummy.append("svg").style('visibility', 'hidden').style('position', 'fixed').style('top', 0).style('left', 0),
        svg.append('g').call(axis).each(function () {
            $$.d3.select(this).selectAll('text').each(function () {
                var box = this.getBoundingClientRect();
                if (maxWidth < box.width) { maxWidth = box.width; }
            });
            dummy.remove();
        });
    }
    $$.currentMaxTickWidths[id] = maxWidth <= 0 ? $$.currentMaxTickWidths[id] : maxWidth;
    return $$.currentMaxTickWidths[id];
};

c3_axis_fn.updateLabels = function updateLabels(withTransition) {
    var $$ = this.owner;
    var axisXLabel = $$.main.select('.' + CLASS.axisX + ' .' + CLASS.axisXLabel),
        axisYLabel = $$.main.select('.' + CLASS.axisY + ' .' + CLASS.axisYLabel),
        axisY2Label = $$.main.select('.' + CLASS.axisY2 + ' .' + CLASS.axisY2Label);
    (withTransition ? axisXLabel.transition() : axisXLabel)
        .attr("x", this.xForXAxisLabel.bind(this))
        .attr("dx", this.dxForXAxisLabel.bind(this))
        .attr("dy", this.dyForXAxisLabel.bind(this))
        .text(this.textForXAxisLabel.bind(this));
    (withTransition ? axisYLabel.transition() : axisYLabel)
        .attr("x", this.xForYAxisLabel.bind(this))
        .attr("dx", this.dxForYAxisLabel.bind(this))
        .attr("dy", this.dyForYAxisLabel.bind(this))
        .text(this.textForYAxisLabel.bind(this));
    (withTransition ? axisY2Label.transition() : axisY2Label)
        .attr("x", this.xForY2AxisLabel.bind(this))
        .attr("dx", this.dxForY2AxisLabel.bind(this))
        .attr("dy", this.dyForY2AxisLabel.bind(this))
        .text(this.textForY2AxisLabel.bind(this));
};
c3_axis_fn.getPadding = function getPadding(padding, key, defaultValue, domainLength) {
    var p = typeof padding === 'number' ? padding : padding[key];
    if (!isValue(p)) {
        return defaultValue;
    }
    if (padding.unit === 'ratio') {
        return padding[key] * domainLength;
    }
    // assume padding is pixels if unit is not specified
    return this.convertPixelsToAxisPadding(p, domainLength);
};
c3_axis_fn.convertPixelsToAxisPadding = function convertPixelsToAxisPadding(pixels, domainLength) {
    var $$ = this.owner,
        length = $$.config.axis_rotated ? $$.width : $$.height;
    return domainLength * (pixels / length);
};
c3_axis_fn.generateTickValues = function generateTickValues(values, tickCount, forTimeSeries) {
    var tickValues = values, targetCount, start, end, count, interval, i, tickValue;
    if (tickCount) {
        targetCount = isFunction(tickCount) ? tickCount() : tickCount;
        // compute ticks according to tickCount
        if (targetCount === 1) {
            tickValues = [values[0]];
        } else if (targetCount === 2) {
            tickValues = [values[0], values[values.length - 1]];
        } else if (targetCount > 2) {
            count = targetCount - 2;
            start = values[0];
            end = values[values.length - 1];
            interval = (end - start) / (count + 1);
            // re-construct unique values
            tickValues = [start];
            for (i = 0; i < count; i++) {
                tickValue = +start + interval * (i + 1);
                tickValues.push(forTimeSeries ? new Date(tickValue) : tickValue);
            }
            tickValues.push(end);
        }
    }
    if (!forTimeSeries) { tickValues = tickValues.sort(function (a, b) { return a - b; }); }
    return tickValues;
};
c3_axis_fn.generateTransitions = function generateTransitions(duration) {
    var $$ = this.owner, axes = $$.axes;
    return {
        axisX: duration ? axes.x.transition().duration(duration) : axes.x,
        axisY: duration ? axes.y.transition().duration(duration) : axes.y,
        axisY2: duration ? axes.y2.transition().duration(duration) : axes.y2,
        axisSubX: duration ? axes.subx.transition().duration(duration) : axes.subx
    };
};
c3_axis_fn.redraw = function redraw(transitions, isHidden) {
    var $$ = this.owner;
    $$.axes.x.style("opacity", isHidden ? 0 : 1);
    $$.axes.y.style("opacity", isHidden ? 0 : 1);
    $$.axes.y2.style("opacity", isHidden ? 0 : 1);
    $$.axes.subx.style("opacity", isHidden ? 0 : 1);
    transitions.axisX.call($$.xAxis);
    transitions.axisY.call($$.yAxis);
    transitions.axisY2.call($$.y2Axis);
    transitions.axisSubX.call($$.subXAxis);
};
