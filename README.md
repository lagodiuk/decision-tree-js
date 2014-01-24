decision-tree-js
================

Small JavaScript implementation of algorithm for training <b>ID3 Decision Tree</b> and <b>Random Forest</b> classifiers.

###Random forest demo###

Online demo: http://fiddle.jshell.net/SjrSz/2/show/light/ 

![Random forest demo](https://raw.github.com/lagodiuk/decision-tree-js/master/random-forest-demo/demo_2d.png)

###Decision tree demo###

Online demo: http://fiddle.jshell.net/HJ9Rv/2/show/light/

![Decision tree demo](https://raw.github.com/lagodiuk/decision-tree-js/master/decision-tree-demo/demo_2d.png)

###Predict sex of character from 'The Simpsons'###
Online demo: http://jsfiddle.net/9WvW7/
```javascript
var trainingSet = 
    [{person: 'Homer', hairLength: 0, weight: 250, age: 36, sex: 'male'},
     {person: 'Marge', hairLength: 10, weight: 150, age: 34, sex: 'female'},
     {person: 'Bart', hairLength: 2, weight: 90, age: 10, sex: 'male'},
     {person: 'Lisa', hairLength: 6, weight: 78, age: 8, sex: 'female'},
     {person: 'Maggie', hairLength: 4, weight: 20, age: 1, sex: 'female'},
     {person: 'Abe', hairLength: 1, weight: 170, age: 70, sex: 'male'},
     {person: 'Selma', hairLength: 8, weight: 160, age: 41, sex: 'female'},
     {person: 'Otto', hairLength: 10, weight: 180, age: 38, sex: 'male'},
     {person: 'Krusty', hairLength: 6, weight: 200, age: 45, sex: 'male'}];

var decisionTree = new dt.DecisionTree({
    trainingSet: trainingSet, 
    categoryAttr: 'sex', 
    ignoredAttributes: ['person']
});

var comic = {person: 'Comic', hairLength: 8, weight: 290, age: 38};
var predictedSex = decisionTree.predict(comic);
```
Data taken from presentation: http://www.cs.sjsu.edu/faculty/lee/cs157b/ID3-AllanNeymark.ppt
