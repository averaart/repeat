//$( function(){
var size = 1000;
var half = size / 2;

var color;
var baseShape;

var baseShapeList = [
	{name: "Diamond", path: "M 50 0 L 100 200 L 50 400 L 0 200 Z"},
	{name: "Square",  path: "M 0 0 L 200 0 L 200 200 L 0 200 Z"},
	{name: "V", path: "M219.33,30.157v-0.223L155.279,8.102c-2.116-0.668-3.341-1.894-3.341-3.899c0-2.451,1.559-4.01,3.787-4.01 c0.891,0,2.562,0.445,5.57,1.559l66.39,23.504c2.228,0.78,4.901,2.005,4.901,4.79c0,2.785-2.673,4.01-4.901,4.79l-66.39,23.504c-3.008,1.114-4.679,1.56-5.57,1.56c-2.228,0-3.787-1.56-3.787-4.011c0-2.005,1.225-3.23,3.341-3.898L219.33,30.157L219.33,30.157z"}
	];

baseShapeList.forEach(function(shape){
	$("#shapes").append($("<option>", {value: shape.path}).text(shape.name));
});

$("#shapes").change(function(e){
	$("#baseShape").val($(e.target).val());
	redraw();
})

$("#wrapper").css("width", size);

var svg = d3.select("#wrapper").append("svg")
	.attr("width", size)
	.attr("height", size);


function drawBaseShape(){
	return svg.append("svg:path")
		.attr("class", "base_shape")
		.attr("d", baseShape)
		.attr("transform", "translate ("+(half-50)+",0)")
		.attr("fill", color)
		.attr("fill-opacity", $("#opacity").slider( "value" ));
 }

function cloneSelection(selection, o){
	var node = selection.node();
	if (selection.attr("fill") != null){
		color = d3.hsl(selection.attr("fill"));
	}

	for (var i = 1; i <= o.times; i++){
		var origTrans = ""
		if (selection.attr("transform") != null) {
			origTrans = selection.attr("transform") + " ";
		}
		var clone = d3.select(node.parentNode.insertBefore(node.cloneNode(true), node.nextSibling));
		clone.attr("transform", origTrans + "rotate(" + (i * o.angle) +" "+ o.anchorX+" " + o.anchorY + ")");
		if (clone.attr("fill") != null){
			color.h = color.h + o.hDelta;
			color.s = color.s + o.sDelta;
			color.l = color.l + o.lDelta;
			clone.attr("fill", color)
			clone.attr("fill-opacity", $("#opacity").slider( "value" ) + (i * $("#oDelta").slider( "value" )));
		}
	}
}

function repeat(selection, optionsList) {
	selection.attr("class", "level0");
	var outerElement = selection;
	for (var i = 0; i < optionsList.length; i++){
		var currentLevel = "level" + i;
		var nextLevel = "level" + (i + 1);
		options = optionsList[i];
		cloneSelection(outerElement, options);
		svg.append("g").attr("class", nextLevel);
		$("g."+ nextLevel ).append($('.'+currentLevel));
		outerElement = d3.select("."+nextLevel);
	}
	var bb = outerElement.node().getBBox();
	var max = Math.max(bb.height, bb.width);
	var scale = size / max;
	outerElement.attr("transform", "scale("+scale+") translate("+(bb.x * -1)+", "+(bb.y * -1)+")");
}

function redraw(){
	color = d3.hsl($("#color").val());
	color.h = $("#h").slider( "value" );
	color.s = $("#s").slider( "value" );
	color.l = $("#l").slider( "value" );

	baseShape = $("#baseShape").val();
	$("#wrapper svg g").remove();
	repeat(drawBaseShape(), buildOptionsList());
}


function buildOptionsList(){
	var optionsList = [];
	$blocks = $(".optionBlock");
	$blocks.each(function(){
		var options = {};
		options.circle = $(this).find("input[type='checkbox']")[0].checked;
		options.times = $(this).find(".times").slider( "value" );
		options.angle = options.circle ? 360.0 / (options.times + 1) : $(this).find(".angle").slider( "value" );
		options.anchorX = $(this).find(".anchorX").slider( "value" );
		options.anchorY = $(this).find(".anchorY").slider( "value" );
		options.hDelta = $("#hDelta").slider( "value" );
		options.sDelta = $("#sDelta").slider( "value" );
		options.lDelta = $("#lDelta").slider( "value" );
		options.oDelta = $("#oDelta").slider( "value" );
		optionsList.push(options);
	});
	return optionsList;
}

$("button#add").on("click", function(){
	addOptionBlock(
		Math.floor((Math.random()*360)),
		Math.floor((Math.random()*10)),
		Math.floor((Math.random()*400)),
		Math.floor((Math.random()*400)),
		10, 0.1);
	redraw();
});

$("#optionsList").on("input propertychange", function(){
	redraw();
});


$("#controls").on(".sliderWrapper input propertychange", function(e){
	$slider = $(e.target).parent().find(".ui-slider");
	min = Number( $slider.parent().find('.min').val() );
	max = Number( $slider.parent().find('.max').val() );
	curValue = $slider.slider("value");
	newValue = curValue <= min ? min : Math.min(curValue, max);
	value = Math.min()
	var options = { min: min, max: max, value: newValue };
	// console.log(options);
	$slider.slider("option", options);
});




function addOptionBlock(angle, times, anchorX, anchorY){
	var $optionBlock, $sliderdiv, $labeldiv, $holder;

	$optionBlock = $("<div>", {class: "optionBlock"});

	var sliderList = [{name: "angle", value: angle, min: -180, max: 180, step: 0.25},
					  {name: "times", value: times, min: 0, max: 50, step: 1},
					  {name: "anchorX", value: anchorX, min: 0, max: 500, step: 1},
					  {name: "anchorY", value: anchorY, min: 0, max: 500, step: 1}]

	sliderList.forEach(function(s){
		$sliderdiv = $("<div>", {class: s.name});
		$min = $("<input>", {type: "text", class: "min", value: s.min}).attr('size', 1);
		$max = $("<input>", {type: "text", class: "max", value: s.max}).attr('size', 1);
		$labeldiv = $("<div>", {class: "label"}).text(s.name);
		$holder = $("<div>", {class: "sliderWrapper"});
		$holder.append($labeldiv, $min, $sliderdiv, $max);

		$optionBlock.append($holder);

		$sliderdiv.slider({
			orientation: "horizontal",
			value: s.value,
			min: s.min,
			max: s.max,
			step: s.step,
			slide: redraw,
			change: redraw
		});
	});


	var $circleLabel = $("<span>Create cirle (ignores angle)</span>");
	var $circleCheckbox = $("<input>", {type: "checkbox", name: "circle"});
	$optionBlock.append($circleCheckbox, $circleLabel);

	var $removeButton =
		$("<button>Remove level</button>", {type: "submit"})
			.on("click", function(){
				$(this).parent().remove();
				redraw();
			})

	$optionBlock.append($removeButton);

	$('#controls').append($optionBlock);

}

$( "div#h" ).slider({
	orientation: "horizontal",
	max: 360,
	step: 0.25,
	value: 267,
	slide: redraw,
	change: redraw
});
$( "div#h").parent().find(".min").val(0);
$( "div#h").parent().find(".max").val(360);
$( "div#hDelta" ).slider({
	orientation: "horizontal",
	max: 90,
	min: -90,
	step: 1,
	value: 10,
	slide: redraw,
	change: redraw
});
$( "div#s, div#l" ).slider({
	orientation: "horizontal",
	max: 1.0,
	step: 0.01,
	value: 0.5,
	slide: redraw,
	change: redraw
});
$( "div#opacity" ).slider({
	orientation: "horizontal",
	max: 1.0,
	step: 0.01,
	value: 0.15,
	slide: redraw,
	change: redraw
});
$( "div#sDelta, div#lDelta, div#oDelta" ).slider({
	orientation: "horizontal",
	min: -0.5,
	max: 0.5,
	step: 0.001,
	value: 0.0,
	slide: redraw,
	change: redraw
});

$(".ui-slider").each(function(){
	$slider = $(this);
	$slider.before( '<input type="text" class="min" size="1" />' );
	$slider.after( '<input type="text" class="max" size="1" />' );
	var o = $slider.slider("option");
	$slider.parent().find(".min").val(o.min);
	$slider.parent().find(".max").val(o.max);
})

addOptionBlock(2, 8, 50, 400);
addOptionBlock(60, 5, 385, 200);
// addOptionBlock(60, 5, 0, 0, 10, 0.1);

redraw();
//});






$( "body" ).on( "dblclick", ".ui-slider-handle", function() {
	var $slider = $(this).parent();
	var o = $slider.slider("option");
	var center = o.min + ((o.max - o.min) / 2.0);
	$slider.slider("value", center);
});

$( "body" ).on( "change", "input[type='checkbox']", redraw );
