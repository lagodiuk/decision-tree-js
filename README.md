decision-tree-js
================

Small JavaScript implementation of algorithm for training [Decision Tree](http://en.wikipedia.org/wiki/Decision_tree) and [Random Forest](http://en.wikipedia.org/wiki/Random_forest) classifiers.

### Random forest demo ###

Online demo: http://fiddle.jshell.net/7WsMf/show/light/

![Random forest demo](https://raw.github.com/lagodiuk/decision-tree-js/master/random-forest-demo/demo_2d.png)

### Decision tree demo ###

Online demo: http://fiddle.jshell.net/92Jxj/show/light/

![Decision tree demo](https://raw.github.com/lagodiuk/decision-tree-js/master/decision-tree-demo/demo_2d.png)

### Toy example of usage ###
Predicting sex of characters from 'The Simpsons' cartoon, using such features as weight, hair length and age

Online demo: http://jsfiddle.net/xur98/
```javascript
// Training set
var data = 
    [{person: 'Homer', hairLength: 0, weight: 250, age: 36, sex: 'male'},
     {person: 'Marge', hairLength: 10, weight: 150, age: 34, sex: 'female'},
     {person: 'Bart', hairLength: 2, weight: 90, age: 10, sex: 'male'},
     {person: 'Lisa', hairLength: 6, weight: 78, age: 8, sex: 'female'},
     {person: 'Maggie', hairLength: 4, weight: 20, age: 1, sex: 'female'},
     {person: 'Abe', hairLength: 1, weight: 170, age: 70, sex: 'male'},
     {person: 'Selma', hairLength: 8, weight: 160, age: 41, sex: 'female'},
     {person: 'Otto', hairLength: 10, weight: 180, age: 38, sex: 'male'},
     {person: 'Krusty', hairLength: 6, weight: 200, age: 45, sex: 'male'}];

// Configuration
var config = {
    trainingSet: data, 
    categoryAttr: 'sex', 
    ignoredAttributes: ['person']
};

// Building Decision Tree
var decisionTree = new dt.DecisionTree(config);

// Building Random Forest
var numberOfTrees = 3;
var randomForest = new dt.RandomForest(config, numberOfTrees);

// Testing Decision Tree and Random Forest
var comic = {person: 'Comic guy', hairLength: 8, weight: 290, age: 38};

var decisionTreePrediction = decisionTree.predict(comic);
var randomForestPrediction = randomForest.predict(comic);
```
Data taken from presentation: http://www.cs.sjsu.edu/faculty/lee/cs157b/ID3-AllanNeymark.ppt
