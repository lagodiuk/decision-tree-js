var dt = (function () {
          
    /**
     * Creates an instance of DecisionTree
     *
     * @constructor
     * @param builder - contains training set and
     *                  some configuration parameters
     */
    function DecisionTree(builder) {
        
        var ignoredAttributes = {};
        if (builder.ignoredAttributes) {
            for(var i in builder.ignoredAttributes) {
                var attr = builder.ignoredAttributes[i];
                ignoredAttributes[attr] = true;
            }
        }

        this.root = buildDecisionTree({
            trainingSet: builder.trainingSet.slice(),
            ignoredAttributes: ignoredAttributes,
            categoryAttr: builder.categoryAttr || 'category',
            minItemsCount: builder.minItemsCount || 1,
            entropyThrehold: builder.entropyThrehold || 0.01,
            maxTreeDepth: builder.maxTreeDepth || 70,
            startIndex: 0,
            endIndex: builder.trainingSet.length - 1
        });
    }
          
    DecisionTree.prototype.predict = function (item) {
        return predict(this.root, item);
    }

    /**
     * Creates an instance of RandomForest
     * with specific number of trees
     *
     * @constructor
     * @param builder - contains training set and some
     *                  configuration parameters for
     *                  building decision trees
     */
    function RandomForest(builder, treesNumber) {
        this.trees = buildRandomForest(builder, treesNumber);
    }
          
    RandomForest.prototype.predict = function (item) {
        return predictRandomForest(this.trees, item);
    }
    
    /**
     * Calculating how many objects of subarray have the same
     * values of specific attribute
     *
     * @param items - array of objects
     *
     * @param attr  - variable with name of attribute, 
     *                which embedded in each object
     *
     * @param startIndex - left bound of subarray
     *
     * @param endIndex - right bound of subarray
     */
    function countUniqueValues(items, attr, startIndex, endIndex) {
        var counter = {};

        // detecting different values of attribute
        for (var i = startIndex; i <= endIndex; i++) {
            // items[i][attr] - value of attribute
            counter[items[i][attr]] = 0;
        }
          
        // counting number of occurrences of each of values
        // of attribute
        for (var i = startIndex; i <= endIndex; i++) {
            counter[items[i][attr]] += 1;
        }

        return counter;
    }
    
    /**
     * Calculating entropy of subarray of objects
     * by specific attribute.
     *
     * @param items - array of objects
     *
     * @param attr  - variable with name of attribute, 
     *                which embedded in each object
     *
     * @param startIndex - left bound of subarray
     *
     * @param endIndex - right bound of subarray
     */
    function entropy(items, attr, startIndex, endIndex) {
        // counting number of occurrences of each of values
        // of attribute
        var counter = countUniqueValues(items, attr, startIndex, endIndex);

        var totalCount = (endIndex - startIndex + 1);
        
        var entropy = 0;
        var p;
        for (var i in counter) {
            p = counter[i] / totalCount;
            entropy -= p * Math.log(p);
        }

        return entropy;
    }
          
    /**
     * In-place splitting of subarray of objects 
     * by value of specific attribute,
     * using specific predicate and pivot.
     *
     * Items which matched by predicate will be moved to
     * the left part of subarray, and the rest of the items
     * will be moved to the right part of subarray
     *
     * @param items - array of objects
     *
     * @param attr  - variable with name of attribute,
     *                which embedded in each object
     *
     * @param predicate - function(x, y) 
     *                    which returns 'true' or 'false'
     *
     * @param pivot - used as the second argument when 
     *                calling predicate function:
     *                e.g. predicate(item[attr], pivot)
     *
     * @param startIndex - left bound of subarray
     *
     * @param endIndex - right bound of subarray
     *
     * @returns index of last item which been matched by predicate
     */
    function split(items, attr, predicate, pivot, startIndex, endIndex) {
        var l = startIndex;
        var r = endIndex;
        
        var tmp;
        while(true) {
            if(l > r) {
                break;
            }
          
            while((l <= r) && (predicate(items[l][attr], pivot))) {
                l++
            }
            
            while((l <= r) && (!predicate(items[r][attr], pivot))) {
                r--;
            }
            
            if(l < r) {
                tmp = items[l];
                items[l] = items[r];
                items[r] = tmp;
                l++;
                r--;
            }
        }
                
        return l - 1;
    }

    /**
     * Finding value of specific attribute which is most frequent
     * in given subarray of objects.
     *
     * @param items - array of objects
     *
     * @param attr  - variable with name of attribute, 
     *                which embedded in each object
     *
     * @param startIndex - left bound of subarray
     *
     * @param endIndex - right bound of subarray
     */
    function mostFrequentValue(items, attr, startIndex, endIndex) {
        // counting number of occurrences of each of values
        // of attribute
        var counter = countUniqueValues(items, attr, startIndex, endIndex);

        var mostFrequentCount = 0;
        var mostFrequentValue;

        for (var value in counter) {
            if (counter[value] > mostFrequentCount) {
                mostFrequentCount = counter[value];
                mostFrequentValue = value;
            }
        };

        return mostFrequentValue;
    }
          
    var predicates = {
        '==': function (a, b) { return a == b },
        '>=': function (a, b) { return a >= b }
    };

    /**
     * Function for building decision tree
     */
    function buildDecisionTree(builder) {

        var trainingSet = builder.trainingSet;
        var minItemsCount = builder.minItemsCount;
        var categoryAttr = builder.categoryAttr;
        var entropyThrehold = builder.entropyThrehold;
        var maxTreeDepth = builder.maxTreeDepth;
        var ignoredAttributes = builder.ignoredAttributes;
        
        var startIndex = builder.startIndex;
        var endIndex = builder.endIndex;
        var length = (endIndex - startIndex + 1);

        if ((maxTreeDepth == 0) || (length <= minItemsCount)) {
            // restriction by maximal depth of tree
            // or size of training set is to small
            // so we have to terminate process of building tree
            return {
                category: mostFrequentValue(trainingSet, categoryAttr, startIndex, endIndex)
            };
        }

        var initialEntropy = entropy(trainingSet, categoryAttr, startIndex, endIndex);

        if (initialEntropy <= entropyThrehold) {
            // entropy of training set too small
            // (it means that training set is almost homogeneous),
            // so we have to terminate process of building tree
            return {
                category: mostFrequentValue(trainingSet, categoryAttr, startIndex, endIndex)
            };
        }

        // used as hash-set for avoiding the checking of split by rules
        // with the same 'attribute-predicate-pivot' more than once
        var alreadyChecked = {};
          
        // this variable expected to contain rule, which splits training set
        // into subsets with smaller values of entropy (produces informational gain)
        var bestSplit = {gain: 0};

        // we have to iterate over the copy of training set,
        // to guarantee that all items will be processed
        // (because after each splitting of subarray -
        // the items of this subarray might be shuffled)
        var copyOfTrainingSet = trainingSet.slice(startIndex, endIndex + 1);
          
        for (var i = copyOfTrainingSet.length; i >= 0; i--) {

            var item = copyOfTrainingSet[i];

            // iterating over all attributes of item
            for (var attr in item) {
                if ((attr == categoryAttr) || ignoredAttributes[attr]) {
                    continue;
                }

                // let the value of current attribute be the pivot
                var pivot = item[attr];

                // pick the predicate
                // depending on the type of the attribute value
                var predicateName;
                if (typeof pivot == 'number') {
                    predicateName = '>=';
                } else {
                    // there is no sense to compare non-numeric attributes
                    // so we will check only equality of such attributes
                    predicateName = '==';
                }

                var attrPredPivot = attr + predicateName + pivot;
                if (alreadyChecked[attrPredPivot]) {
                    // skip such pairs of 'attribute-predicate-pivot',
                    // which been already checked
                    continue;
                }
                alreadyChecked[attrPredPivot] = true;

                var predicate = predicates[predicateName];
          
                // splitting training set by given 'attribute-predicate-value'
                var splitPoint = split(trainingSet, attr, predicate, pivot, startIndex, endIndex);

                if((splitPoint < startIndex) || (splitPoint > endIndex)) {
                    continue;                    
                }

                // calculating entropy of subsets
                var matchEntropy = entropy(trainingSet, categoryAttr, startIndex, splitPoint);
                var notMatchEntropy = entropy(trainingSet, categoryAttr, splitPoint + 1, endIndex);

                // calculating informational gain
                var newEntropy = 0;
                newEntropy += matchEntropy * (splitPoint - startIndex + 1);
                newEntropy += notMatchEntropy * (endIndex - (splitPoint + 1) + 1);
                newEntropy /= length;
                var currGain = initialEntropy - newEntropy;

                if (currGain > bestSplit.gain) {
                    // remember pairs 'attribute-predicate-value'
                    // which provides informational gain
                    bestSplit.predicate = predicate;
                    bestSplit.attribute = attr;
                    bestSplit.pivot = pivot;
                    bestSplit.gain = currGain;
                    bestSplit.predicateName = predicateName;
                }
            }
        }

        if (!bestSplit.gain) {
            // can't find optimal split
            return {
                category: mostFrequentValue(trainingSet, categoryAttr, startIndex, endIndex)
            };
        }

        var splitPoint = split(trainingSet, bestSplit.attribute, bestSplit.predicate, bestSplit.pivot, startIndex, endIndex);
        
        // building subtrees
          
        builder.maxTreeDepth = maxTreeDepth - 1;

        builder.startIndex = startIndex;
        builder.endIndex = splitPoint;
        var matchSubTree = buildDecisionTree(builder);

        builder.startIndex = splitPoint + 1;
        builder.endIndex = endIndex;
        var notMatchSubTree = buildDecisionTree(builder);
          
        if((matchSubTree.category) && (notMatchSubTree.category) && (matchSubTree.category == notMatchSubTree.category)){
            return {
                category: matchSubTree.category
            };
        }

        return {
            attribute: bestSplit.attribute,
            predicate: bestSplit.predicate,
            predicateName: bestSplit.predicateName,
            pivot: bestSplit.pivot,
            match: matchSubTree,
            notMatch: notMatchSubTree,
            matchedCount: (splitPoint - startIndex + 1),
            notMatchedCount: (endIndex - (splitPoint + 1) + 1)
        };
    }

    /**
     * Classifying item, using decision tree
     */
    function predict(tree, item) {
        var attr,
            value,
            predicate,
            pivot;
        
        // Traversing tree from the root to leaf
        while(true) {
          
            if (tree.category) {
                // only leafs contains predicted category
                return tree.category;
            }

            attr = tree.attribute;
            value = item[attr];

            predicate = tree.predicate;
            pivot = tree.pivot;

            // move to one of subtrees
            if (predicate(value, pivot)) {
                tree = tree.match;
            } else {
                tree = tree.notMatch;
            }
        }
    }

    /**
     * Building array of decision trees
     */
    function buildRandomForest(builder, treesNumber) {
        var items = builder.trainingSet;
          
        // creating training sets for each tree
        var trainingSets = [];
        for (var t = 0; t < treesNumber; t++) {
            trainingSets[t] = [];
        }
        for (var i = items.length - 1; i >= 0 ; i--) {
          // assigning items to training sets of each tree
          // using 'round-robin' strategy
          var correspondingTree = i % treesNumber;
          trainingSets[correspondingTree].push(items[i]);
        }

        // building decision trees
        var forest = [];
        for (var t = 0; t < treesNumber; t++) {
            builder.trainingSet = trainingSets[t];

            var tree = new DecisionTree(builder);
            forest.push(tree);
        }
        return forest;
    }

    /**
     * Each of decision tree classifying item
     * ('voting' that item corresponds to some class).
     *
     * This function returns hash, which contains 
     * all classifying results, and number of votes 
     * which were given for each of classifying results
     */
    function predictRandomForest(forest, item) {
        var result = {};
        for (var i in forest) {
            var tree = forest[i];
            var prediction = tree.predict(item);
            result[prediction] = result[prediction] ? result[prediction] + 1 : 1;
        }
        return result;
    }

    var exports = {};
    exports.DecisionTree = DecisionTree;
    exports.RandomForest = RandomForest;
    return exports;
})();