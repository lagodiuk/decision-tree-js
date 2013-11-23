function countUniqueAttributes(items, attr) {
    //var counter = items.reduce(function(acc, item) { acc[item[categoryAttr]] = acc[item[categoryAttr]] ? acc[item[categoryAttr]] + 1 : 1; return acc }, {});
    var counter = {};
    
    for(var i in items) {
        var item = items[i];
        
        var attrValue = item[attr];
        
        if(counter[attrValue]) {
            counter[attrValue] += 1;
        } else {
            counter[attrValue] = 1;
        }
    }
    
    return counter;
}

function entropy(items, attr) {
    var counter = countUniqueAttributes(items, attr);
    
    var entropy = 0;
    for(var i in counter) {
        var p = counter[i] / items.length;
        entropy += -p * Math.log(p);
    }
    
    return entropy;
}

var predicates = {
                    '==' : function(a, b) {return a == b},
                    '>=' : function(a, b) {return a >= b},
                    '<=' : function(a, b) {return a <= b}
                 };

function split(items, attr, predicateName, pivot) {
    var result = {
                    attribute : attr,
                    predicate : predicateName,
                    pivot     : pivot,
                    match     : [],
                    notMatch  : []
                 };
    
    var predicate = predicates[predicateName];
    
    for(var i in items) {
        var item = items[i];
        
        var attrValue = item[attr];
        
        if((attrValue != null) && predicate(attrValue, pivot)) {
            result.match.push(item);
        } else {
            result.notMatch.push(item);
        }
    };
    
    return result;
}

function mostFrequentCategory(items, attr) {
    var counter = countUniqueAttributes(items, attr);
    
    var mostFrequentCount;
    var mostFrequentCategory;
    
    for(var c in counter) {
        if(!mostFrequentCategory || (counter[c] > mostFrequentCount)) {
            
            mostFrequentCount = counter[c];
            mostFrequentCategory = c;
        }
    };
    
    return mostFrequentCategory;
}

var ENTROPY_THRESHOLD = 0.001;

function buildTree(items, threshold, categoryAttr) {
    if(!categoryAttr) {
        categoryAttr = 'category';
    }
    if(!threshold) {
        threshold = 1;
    }
    
    var initialEntropy = entropy(items, categoryAttr);
    
    if((initialEntropy < ENTROPY_THRESHOLD) || (items.length <= threshold)) {
        return {category : mostFrequentCategory(items, categoryAttr)}
    };
    
    var bestSplit;
    
    for(var i in items) {
        var item = items[i];
        
        for(var attr in item) {
            if(attr == categoryAttr) {
                continue;
            }
            
            for(var predicate in predicates) {
                
                var currSplit = split(items, attr, predicate, item[attr]);
                
                var matchEntropy = entropy(currSplit.match, categoryAttr);
                var notMatchEntropy = entropy(currSplit.notMatch, categoryAttr);
                
                var newEntropy = (matchEntropy * currSplit.match.length + notMatchEntropy * currSplit.notMatch.length) / items.length;
                
                currSplit.gain = initialEntropy - newEntropy;
                
                if(!bestSplit || (currSplit.gain > 0 && bestSplit.gain < currSplit.gain)) {
                    bestSplit = currSplit;
                }
            }
        }
    }
    return {attribute : bestSplit.attribute,
            predicate : bestSplit.predicate,
            pivot     : bestSplit.pivot,
            match     : buildTree(bestSplit.match, threshold, categoryAttr),
            notMatch  : buildTree(bestSplit.notMatch, threshold, categoryAttr)};
}

function predict(tree, item) {
    if(tree.category) {
        return tree.category;
    }
    
    var attrName = tree.attribute;
    var attrValue = item[attrName];
    
    var predicateName = tree.predicate;
    var predicate = predicates[predicateName];
    
    var pivot =  tree.pivot;
    
    if((attrValue != null) && predicate(attrValue, pivot)) {
        return predict(tree.match, item);
    } else {
        return predict(tree.notMatch, item);
    }
}



/*
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
*/