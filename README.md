decision-tree-js
================

Small JavaScript implementation of ID3 Decision tree

###Random forest demo###
Online demo: http://jsfiddle.net/SjrSz/embedded/result/
![Random forest demo](https://raw.github.com/lagodiuk/decision-tree-js/master/random-forest-demo/demo_2d.png)

###Decision tree demo###
Online demo: http://jsfiddle.net/HJ9Rv/embedded/result/
![Decision tree demo](https://raw.github.com/lagodiuk/decision-tree-js/master/decision-tree-demo/demo_2d.png)

###Predict sex of character from 'The Simpsons'###
Online demo: http://jsfiddle.net/rz8Wg/2/
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

###Play tennis###
Online demo: http://jsfiddle.net/rtkrt/4/
```javascript
var trainingSet =
    [{sky: 'sunny', temp: 'warm', humid: 'high', wind: 'strong', water: 'cool', forecast: 'change', decision: 'yes'},
     {sky: 'rainy', temp: 'cold', humid: 'high', wind: 'strong', water: 'warm', forecast: 'change', decision: 'no'},
     {sky: 'sunny', temp: 'warm', humid: 'high', wind: 'strong', water: 'warm', forecast: 'same', decision: 'yes'},
     {sky: 'sunny', temp: 'warm', humid: 'normal', wind: 'strong', water: 'warm', forecast: 'same', decision: 'yes'},
     {sky: 'sunny', temp: 'warm', humid: 'normal', wind: 'weak', water: 'warm', forecast: 'same', decision: 'no'}];

var decisionTree = new dt.DecisionTree({
    trainingSet: trainingSet, 
    categoryAttr: 'decision'
});
```
Data taken from: http://www.cvc.uab.es/~jbernal/Old%20Page/ID3%20COMPLETE%20EXAMPLE.pdf