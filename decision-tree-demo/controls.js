function init() {

    var canv = document.getElementById('myCanvas');
    var clearBtn = document.getElementById('clearBtn');
    var context = canv.getContext('2d');
    var displayTreeDiv = document.getElementById('displayTree');

    var NOT_SELECTED_COLOR_STYLE = '2px solid white';
    var SELECTED_COLOR_STYLE = '2px solid black';
    var colorSelectElements = document.getElementsByClassName('color-select');
    for (var i = 0; i < colorSelectElements.length; i++) {
        colorSelectElements[i].style.backgroundColor = colorSelectElements[i].getAttribute('label');
        colorSelectElements[i].style.border = NOT_SELECTED_COLOR_STYLE;
    }

    var color = colorSelectElements[0].getAttribute('label');
    var POINT_RADIUS = 3;
    var points = [];
    var tree = null;
    var MAX_ALPHA = 128;
    var addingPoints = false;

    colorSelectElements[0].style.border = SELECTED_COLOR_STYLE;

    canv.addEventListener('mousedown', enableAddingPointsListener, false);

    canv.addEventListener('mouseup', rebuildForestListener, false);

    canv.addEventListener('mouseout', rebuildForestListener, false);

    canv.addEventListener('mousemove', addPointsListener, false);


    for (var i = 0; i < colorSelectElements.length; i++) {
        colorSelectElements[i].addEventListener('click', selectColorListener, false);
    }

    clearBtn.addEventListener('click', clearCanvasListener, false);

    function enableAddingPointsListener(e) {
        e.preventDefault();
        addingPoints = true;
    }

    function addPointsListener(e) {
        if (addingPoints) {
            var x = e.offsetX ? e.offsetX : (e.layerX - canv.offsetLeft);
            var y = e.offsetY ? e.offsetY : (e.layerY - canv.offsetTop);

            drawCircle(context, x, y, POINT_RADIUS, color);
            points.push({
                x: x,
                y: y,
                color: color
            });
        }
    }

    function rebuildForestListener(e) {

        if (!addingPoints) return;

        if (points.length == 0) return;

        addingPoints = false;


        var threshold = Math.floor(points.length / 100);
        threshold = (threshold > 1) ? threshold : 1;

        tree = new dt.DecisionTree({
            trainingSet: points,
            categoryAttr: 'color',
            minItemsCount: threshold
        });

        displayTreePredictions();
        displayPoints();

        displayTreeDiv.innerHTML = treeToHtml(tree.root);
    }

    function displayTreePredictions() {
        context.clearRect(0, 0, canv.width, canv.height);
        var imageData = context.getImageData(0, 0, canv.width, canv.height);

        for (var x = 0; x < canv.width; x++) {
            for (var y = 0; y < canv.height; y++) {
                var predictedHexColor = tree.predict({
                    x: x,
                    y: y
                });
                putPixel(imageData, canv.width, x, y, predictedHexColor, MAX_ALPHA);
            }
        }

        context.putImageData(imageData, 0, 0);
    }

    function displayPoints() {
        for (var p in points) {
            drawCircle(context, points[p].x, points[p].y, POINT_RADIUS, points[p].color);
        }
    }

    function drawCircle(context, x, y, radius, hexColor) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);

        var c = hexToRgb(hexColor)
        context.fillStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';

        context.fill();
        context.closePath();
        context.stroke();
    }

    function putPixel(imageData, width, x, y, hexColor, alpha) {
        var c = hexToRgb(hexColor);
        var indx = (y * width + x) * 4;

        var currAlpha = imageData.data[indx + 3];

        imageData.data[indx + 0] = (c.r * alpha + imageData.data[indx + 0] * currAlpha) / (alpha + currAlpha);
        imageData.data[indx + 1] = (c.g * alpha + imageData.data[indx + 1] * currAlpha) / (alpha + currAlpha);
        imageData.data[indx + 2] = (c.b * alpha + imageData.data[indx + 2] * currAlpha) / (alpha + currAlpha);
        imageData.data[indx + 3] = alpha + currAlpha;
    }

    function selectColorListener(event) {
        color = this.getAttribute('label');

        for (var i = 0; i < colorSelectElements.length; i++) {
            colorSelectElements[i].style.border = NOT_SELECTED_COLOR_STYLE;
        }

        this.style.border = SELECTED_COLOR_STYLE;
    }

    function clearCanvasListener(event) {
        context.clearRect(0, 0, canv.width, canv.height);
        points = [];
        displayTreeDiv.innerHTML = '';
    }

    /**
     * Taken from: http://stackoverflow.com/a/5624139/653511
     */
    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Repeating of string taken from: http://stackoverflow.com/a/202627/653511
    var EMPTY_STRING = new Array(26).join('&nbsp;');
    
    // Recursively traversing decision tree (DFS)
    function treeToHtml(tree) {
        
        if (tree.category) {
            return  ['<ul>',
                        '<li>',
                            '<a href="#" style="background-color:', tree.category, '">', EMPTY_STRING, '</a>',
                        '</li>',
                     '</ul>'].join('');
        }
        
        return  ['<ul>',
                    '<li>',
                        '<a href="#"><b>', tree.attribute, ' ', tree.predicateName, ' ', tree.pivot, ' ?</b></a>',
                        '<ul>',
                            '<li>',
                                '<a href="#">yes (', tree.matchedCount, ' points) </a>',
                                treeToHtml(tree.match),
                            '</li>',
                            '<li>',
                                '<a href="#">no (', tree.notMatchedCount, ' points) </a>',
                                treeToHtml(tree.notMatch),
                            '</li>',
                        '</ul>',
                    '</li>',
                 '</ul>'].join('');
    }
}