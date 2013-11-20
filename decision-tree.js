function entropy(items, categoryAttr) {
    var counter = items.reduce(function(acc, item) { acc[item[categoryAttr]] = acc[item[categoryAttr]] ? acc[item[categoryAttr]] + 1 : 1; return acc }, {});
    var entropy = 0;
    for(var i in counter) entropy += - (counter[i] / items.length) * Math.log(counter[i] / items.length);
    return entropy;
}

var predicates = {'==' : function(a, b) {return a == b}, '>=' : function(a, b) {return a >= b}, '<=' : function(a, b) {return a <= b}};

function split(items, attribute, predicate, pivot) {
    var result = {attribute : attribute, predicate : predicate, pivot : pivot, true : [], false : []};
    items.forEach(function(item) {result[(item[attribute] != null) && predicates[predicate](item[attribute], pivot)].push(item)});    
    return result;
}

function mostFrequentCategory(items, categoryAttr) {
    var counter = items.reduce(function(acc, item) { acc[item[categoryAttr]] = acc[item[categoryAttr]] ? acc[item[categoryAttr]] + 1 : 1; return acc }, {});
    var mostFrequent;
    for(var c in counter) if(!mostFrequent || counter[c] > mostFrequent.count) mostFrequent = {category : c, count : counter[c]};
    return mostFrequent.category;
}

function buildTree(items, threshold, categoryAttr) {
    if(!categoryAttr) categoryAttr = 'category';
    if(!threshold) threshold = 1;
    var initialEntropy = entropy(items, categoryAttr);
    if((initialEntropy == 0) || (items.length <= threshold)) return {category : mostFrequentCategory(items, categoryAttr)};
    var bestSplit; 
    items.forEach(function(item) {
        for(var attr in item) if(attr !== categoryAttr) {            
            for(var predicate in predicates) {
                var currSplit = split(items, attr, predicate, item[attr]);            
                currSplit.gain = initialEntropy - (entropy(currSplit.true, categoryAttr) * currSplit.true.length + entropy(currSplit.false, categoryAttr) * currSplit.false.length) / items.length;
                if(!bestSplit || (currSplit.gain > 0 && bestSplit.gain < currSplit.gain)) bestSplit = currSplit;
            }
        }
    });   
    return {attribute : bestSplit.attribute, predicate : bestSplit.predicate, pivot : bestSplit.pivot, true : buildTree(bestSplit.true, threshold, categoryAttr), false : buildTree(bestSplit.false, threshold, categoryAttr)};
}

function predict(tree, item) {
    if(tree.category) return tree.category;
    return predict(tree[(item[tree.attribute] != null) && predicates[tree.predicate](item[tree.attribute], tree.pivot)], item);
}




var points = []
for(var i = 0; i < 150; i++) {
    var x = (Math.random() - Math.random()) * 10;
    var y = (Math.random() - Math.random()) * 10;
    var pt = {x : x, y : y}
    if(x * x + y * y < 5 * 5) pt.category = 'in_circle'; else pt.category = 'out_of_circle';
    points.push(pt)
}
var tree = buildTree(points, 5);
alert(JSON.stringify(tree, null, 4))
var pt = {x : 0, y : 0};
pt.prediction = predict(tree, pt);
alert(JSON.stringify(pt, null, 4))
pt = {x : 7, y : 7};
pt.prediction = predict(tree, pt);
alert(JSON.stringify(pt, null, 4))

var stat = {correct : 0, incorrect : 0}
for(var i = 0; i < 1000; i++) {
    var x = (Math.random() - Math.random()) * 10;
    var y = (Math.random() - Math.random()) * 10;
    var pt = {x : x, y : y}
    pt.prediction = predict(tree, pt);
    if(x * x + y * y < 5 * 5) pt.c = 'in_circle'; else pt.c = 'out_of_circle';
    if(pt.c == pt.prediction) stat.correct++; else stat.incorrect++;
}
alert(JSON.stringify(stat, null, 4))
