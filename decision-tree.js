function countUniqueAttributes(items, attr) {
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

function buildDecisionTree(builder) {
    
    var items = builder.trainingSet;
    var threshold = builder.minItemsCount;
    var categoryAttr = builder.categoryAttr;
    var entropyThrehold = builder.entropyThrehold;

    // Default values
    if(!categoryAttr) {
        categoryAttr = 'category';
    }
    if(!threshold) {
        threshold = 1;
    }
    if(!entropyThrehold) {
        entropyThrehold = 0.0001;
    }
    
    var initialEntropy = entropy(items, categoryAttr);
    
    if((initialEntropy < entropyThrehold) || (items.length <= threshold)) {
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
                
                var newEntropy = 0;
                newEntropy += matchEntropy * currSplit.match.length;
                newEntropy += notMatchEntropy * currSplit.notMatch.length;
                newEntropy /= items.length;
                
                currSplit.gain = initialEntropy - newEntropy;
                
                if(!bestSplit || (currSplit.gain > 0 && bestSplit.gain < currSplit.gain)) {
                    bestSplit = currSplit;
                }
            }
        }
    }
    
    if(currSplit.gain <= 0) {
        // Can't find optimal split
        return {category : mostFrequentCategory(items, categoryAttr)}
    }
    
    return {attribute : bestSplit.attribute,
            predicate : bestSplit.predicate,
            pivot     : bestSplit.pivot,
            match     : buildDecisionTree({
                                            trainingSet : bestSplit.match,
                                            minItemsCount : threshold,
                                            categoryAttr : categoryAttr,
                                            entropyThrehold : entropyThrehold
                                          }),
            notMatch  : buildDecisionTree({
                                            trainingSet : bestSplit.notMatch,
                                            minItemsCount : threshold,
                                            categoryAttr : categoryAttr,
                                            entropyThrehold : entropyThrehold
                                          })};
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

function buildRandomForest(builder) {
    var items = builder.trainingSet;
    var categoryAttr = builder.categoryAttr;
    var treesNumber = builder.treesNumber;
    
    var forest = [];
    
    for(var t = 0; t < treesNumber - 1; t++) {
        
        var treeBuilder = {
            trainingSet : []
        };
        
        for(var i in items) {
            if(Math.random() < 0.5) {
                continue;
            }
            treeBuilder.trainingSet.push(items[i]);
        }
        
        if(categoryAttr) {
            treeBuilder.categoryAttr = categoryAttr;
        }
        
        var tree = buildDecisionTree(treeBuilder);
        forest.push(tree);
    }
    return forest;
}

function predictRandomForest(forest, item) {
    var result = {};
    for(var i in forest) {
        var tree = forest[i];
        var prediction = predict(tree, item);
        if(result[prediction]) {
            result[prediction] += 1;
        } else {
            result[prediction] = 1;
        }
    }
    return result;
}