function DecisionTree(builder) {
    
    var predicates = {
        '==' : function(a, b) {return a == b},
        '>=' : function(a, b) {return a >= b},
        '<=' : function(a, b) {return a <= b}
    };
    
    var countUniqueAttributes = function(items, attr) {
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
    
    var entropy = function(items, attr) {
        var counter = countUniqueAttributes(items, attr);
        
        var entropy = 0;
        for(var i in counter) {
            var p = counter[i] / items.length;
            entropy += -p * Math.log(p);
        }
        
        return entropy;
    }
    
    var split = function(items, attr, predicateName, pivot) {
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
    
    var mostFrequentCategory = function(items, attr) {
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
    
    var buildDecisionTree = function(builder) {
        
        var trainingSet = builder.trainingSet;
        var minItemsCount = builder.minItemsCount;
        var categoryAttr = builder.categoryAttr;
        var entropyThrehold = builder.entropyThrehold;
        var maxTreeDepth = builder.maxTreeDepth;
        
        var initialEntropy = entropy(trainingSet, categoryAttr);
        
        if((maxTreeDepth == 0) || (initialEntropy < entropyThrehold) || (trainingSet.length <= minItemsCount)) {
            return {category : mostFrequentCategory(trainingSet, categoryAttr)}
        };
        
        var bestSplit = {
            gain : 0
        };
        
        for(var i in trainingSet) {
            var item = trainingSet[i];
            
            for(var attr in item) {
                if(attr == categoryAttr) {
                    continue;
                }
                
                for(var predicate in predicates) {
                    
                    var currSplit = split(trainingSet, attr, predicate, item[attr]);
                    
                    var matchEntropy = entropy(currSplit.match, categoryAttr);
                    var notMatchEntropy = entropy(currSplit.notMatch, categoryAttr);
                    
                    var newEntropy = 0;
                    newEntropy += matchEntropy * currSplit.match.length;
                    newEntropy += notMatchEntropy * currSplit.notMatch.length;
                    newEntropy /= trainingSet.length;
                    
                    currSplit.gain = initialEntropy - newEntropy;
                    
                    if(currSplit.gain > 0 && bestSplit.gain < currSplit.gain) {
                        bestSplit = currSplit;
                    }
                }
            }
        }
        
        if(bestSplit.gain <= 0) {
            // Can't find optimal split
            return {category : mostFrequentCategory(trainingSet, categoryAttr)}
        }
        
        return {attribute : bestSplit.attribute,
            predicate : bestSplit.predicate,
            pivot     : bestSplit.pivot,
            match     : buildDecisionTree({
                                          trainingSet : bestSplit.match,
                                          minItemsCount : minItemsCount,
                                          categoryAttr : categoryAttr,
                                          entropyThrehold : entropyThrehold,
                                          maxTreeDepth : maxTreeDepth - 1
                                          }),
            notMatch  : buildDecisionTree({
                                          trainingSet : bestSplit.notMatch,
                                          minItemsCount : minItemsCount,
                                          categoryAttr : categoryAttr,
                                          entropyThrehold : entropyThrehold,
                                          maxTreeDepth : maxTreeDepth - 1
                                          })};
    }
    
    var predict = function(tree, item) {
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
    
    if(builder.removeDefaultPredicates) {
        for(var p in builder.removeDefaultPredicates) {
            delete predicates[p];
        }
    }
    
    this.root = buildDecisionTree({
                                  trainingSet : builder.trainingSet,
                                  categoryAttr : (builder.categoryAttr ? builder.categoryAttr : 'category'),
                                  minItemsCount : (builder.minItemsCount ? builder.minItemsCount : 1),
                                  entropyThrehold : (builder.entropyThrehold ? builder.entropyThrehold : 0.01),
                                  maxTreeDepth : (builder.maxTreeDepth ? builder.maxTreeDepth : 70)
                                  });
    
    this.predict = function(item) {
        return predict(this.root, item);
    }
}

function RandomForest(builder, treesNumber) {
    
    var buildRandomForest = function(builder, treesNumber) {
        var items = builder.trainingSet;
        
        var forest = [];
        
        for(var t = 0; t < treesNumber; t++) {
            
            builder.trainingSet = [];
            
            for(var i = 1; i <= items.length; i++) {
                if(i % (t + 2) == 0) {
                    builder.trainingSet.push(items[i - 1]);
                }
            }
            
            var tree = new DecisionTree(builder);
            forest.push(tree);
        }
        return forest;
    }
    
    var predictRandomForest = function(forest, item) {
        var result = {};
        for(var i in forest) {
            var tree = forest[i];
            var prediction = tree.predict(item);
            if(result[prediction]) {
                result[prediction] += 1;
            } else {
                result[prediction] = 1;
            }
        }
        return result;
    }
    
    this.trees = buildRandomForest(builder, treesNumber);
    
    this.predict = function(item) {
        return predictRandomForest(this.trees, item);
    }
}