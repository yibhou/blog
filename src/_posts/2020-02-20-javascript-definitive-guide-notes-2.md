---
title: 《JavaScript权威指南》读书笔记（二）
author: 林明杰
date: 2020-02-20
location: Canton
tags:
- JavaScript
- 读书笔记
---

> *本文目的是对原书（《JavaScript权威指南》第六版）中的一些错误或疑惑点进行纠正与补充，以及记录一些重要的知识点。文章中的标题序号与书籍目录序号保持一致。*

[TOC]

## 6 对象

对象的属性特性 (property attribute)：

- 可写 (writable attribute)：表明是否可以设置该属性的值。
- 可枚举 (enumerable attribute)：表明是否可以通过for/in循环返回该属性。
- 可配置 (configurable attribute)：表明是否可以删除该属性或修改属性特性。

对象特性 (object attribute)：

- 对象的原型 (prototype)：指向另外一个对象，当前对象的属性继承自它的原型对象。
- 对象的类 (class)：是一个标识对象类型的字符串。
- 对象的扩展标记 (extensible flag)：表明（在ECMAScript 5中）是否可以向该对象添加新属性。

### 6.1 创建对象

#### 6.1.3 原型

::: danger 纠正
*Page 121* -> 每一个JavaScript对象都和另一个对象（原型对象）或null相关联。
:::

```js
var o = Object.create(null);
Object.getPrototypeOf(o) === null; // => true
```

所有通过对象直接量创建的对象都有一个相同的原型对象，可以通过Object.prototype获得这个原型对象的引用：

```js
var o = {};
o.__proto__ === Object.prototype // => true
Object.getPrototypeOf(o) === Object.prototype // => true

Object.prototype.__proto__ === null // => true

Date.prototype.__proto__ === Object.prototype // => true
```

#### 6.1.4 Object.create()

```js
function inherit(p) {
  if (p == null) throw TypeError();
  if (Object.create)
    return Object.create(p);
  var t = typeof p;
  if (t !== "object" && t !== "function") throw TypeError();
  function f() {};
  f.prototype = p;
  return new f();
}

var o = { x: 0 };
library_function(inherit(o)); // 防止对o的意外修改
```

### 6.2 属性的查询和设置

#### 6.2.2 继承

```js
// o继承自Object.prototype
var o = {
  x: 1,
  $r: 1,
  get r() { return this.$r; },
  set r(value) { this.$r = value; }
};
var p = inherit(o);
p.y = 2;
var q = inherit(p);
q.z = 3;

// 在q的原型链查询属性x：q.x->p.x->o.x(=1)
console.log(q.x); // => 1
// 属性赋值操作首先检查原型链，以此判定是否允许赋值操作，
// 如果原型链上属性x不存在或x允许被修改（可写），即允许赋值操作，那么会
// 在原始对象q上创建属性（当x是继承属性或x不存在时）或修改属性（当x为q的属性时）。
// 如果不允许赋值操作，则赋值失败但不报错（在严格模式中会抛出TypeError）。
q.x = 12;
// 不会修改原型链上原型对象的属性，
// 属性赋值要么失败，要么在原始对象创建新属性或修改属性
console.log(o.x); // => 1
console.log(q.x); // => 12

// 如果赋值给存取器属性，那么创建操作替换为使用原型对象o的setter方法，
// 修改操作替换为原始对象q的setter方法，
// 并且setter或getter方法是由原始对象q调用的，而不是原型对象o
q.r = 10;
// 依然不会修改原型对象的属性
console.log(o.r); // => 1
console.log(q.r); // => 10
```

#### 6.2.3 属性访问错误

在这些场景下给对象设置属性会失败：

- “不可写”的自有属性或继承属性；
- “不可扩展”的对象添加新属性。

### 6.3 删除属性

delete运算符只能删除自有属性，不能删除继承属性（要删除继承属性必须从定义这个属性的原型对象上删除它，而且这会影响到继承自这个原型的所有对象）。

```js
var x = 1;  // 全局对象的不可配置属性
this.y = 1; // 全局对象的可配置属性
z = 1; // 全局对象的可配置属性

console.log(window.x); // 1
console.log(window.z); // 1

Object.getOwnPropertyDescriptor(window, 'x').configurable; // => false
Object.getOwnPropertyDescriptor(window, 'z').configurable; // => true

delete z; // => true
```

### 6.4 检测属性

```js
var o = Object.create({ x: 1 });
o.y = 2;

// 检测是否为对象的自有属性或继承属性
"x" in o // => true
"y" in o // => true
"toString" in o // => true

// 是否为自有属性
o.hasOwnProperty("x") // => false
o.hasOwnProperty("y") // => true

// 是否为可枚举的自有属性
o.propertyIsEnumerable("x") // => false
o.propertyIsEnumerable("y") // => true
```

### 6.5 枚举属性

```js
// 内置方法不可枚举
Object.prototype.propertyIsEnumerable("toString") // => false

var o = { a: 1, b: 2, c: 3 };

// 返回所有可枚举的自有属性
Object.keys(o); // => ["a", "b", "c"]
// 返回所有自有属性
Object.getOwnPropertyNames(o); // => ["a", "b", "c"]
```

### 6.6 属性getter和setter

由getter和setter方法定义的属性称为“存取器属性” (accessor property)。

与“数据属性” (data property) 不同，如果存取器属性同时具有getter和setter方法，那么它是一个可读/写属性。如果只有getter方法，那么它是一个只读属性。如果只有setter方法，那么它是一个只写属性，读取只写属性始终返回undefined。

```js
var o = {
  data_prop: "", // 一般的数据属性

  // 存取器属性
  get accessor_prop() {
    return this.data_prop;
  },
  set accessor_prop(value) {
    this.data_prop = value;
  },
  set write_only_prop(value) {
    this.accessor_prop = value;
  }
}

o.write_only_prop // => undefined
o.write_only_prop = "richard";
console.log(o.data_prop); // => "richard"
```

### 6.7 属性的特性

数据属性的特性分别是它的**值** (value)、**可写性** (writable)、**可枚举性** (enumerable) 和**可配置性** (configurable)。

存取器属性的特性分别是**读取** (get)、**写入** (set)、**可枚举性**和**可配置性**。存取器属性没有值和可写性，它的可写性是由setter方法存在与否来决定的。

“属性描述符”对象的属性与属性特性同名：

```js
// => { value: "", writable: true, enumerable: true, configurable: true }
Object.getOwnPropertyDescriptor(o, "data_prop");

// => { get: undefined, enumerable: true, configurable: true, set: /*ƒunc*/ }
Object.getOwnPropertyDescriptor(o, "write_only_prop");

// 顾名思义，getOwnPropertyDescriptor只是获取自有属性的描述符，
// 如果用来获取继承属性或不存在属性的描述符，将会返回undefined
Object.getOwnPropertyDescriptor({}, "x"); // => undefined
Object.getOwnPropertyDescriptor({}, "toString"); // => undefined
```

```js
var o = {};
// 添加一个不可枚举的数据属性x并赋值为1
Object.defineProperty(o, "x", {
  value: 1,
  writable: true,
  enumerable: false,
  configurable: true
});
o.x; // => 1
// 所有可枚举的自有属性
Object.keys(o); // => []
// 将属性x改为只读
Object.defineProperty(o, "x", { writable: false });
// 尝试修改只读属性
o.x = 2;
// 修改失败但不报错（在严格模式中抛出类型错误异常）
o.x // => 1
// 由于o是可配置的 可以通过修改描述符的方式修改只读属性的值
Object.defineProperty(o, "x", { value: 2 });
o.x // => 2
// 将x从数据属性修改为存取器属性
Object.defineProperty(o, "x", {
  get: function() {
    return 0;
  }
});
o.x // => 0

// 不能既使用数据属性又使用存取器属性的特性 否则将抛出TypeError
Object.defineProperty(o, "x", {
  value: 1,
  writable: true,
  get: function() {
    return 2;
  }
});
```

::: tip
传入Object.defineProperty()的属性描述符对象不必包含所有4个特性。注意，这个方法不能既使用数据属性又使用存取器属性的特性，否则将抛出TypeError。它也不能用来修改继承属性的特性 [(类似6.2.2节)](#_6-2-2-继承)。

对于创建属性来说，默认的属性特性值为false（writable/configurable/enumerable）或undefined（value/get/set）。对于修改已有属性来说，默认的属性特性值没有做任何修改。但如果将属性从数据属性修改为存取器属性，或者从存取器属性修改为数据属性，那么configurable和enumerable除外的属性特性值将丢弃，即重置为false或undefined。
:::

```js
var o = Object.create({ x: 1 });
// 修改继承属性的特性 将会在原始对象o上创建新属性x
Object.defineProperty(o, "x", { writable: false });
o.x // => undefined
```

使用Object.defineProperties()可以创建或修改对象的多个属性：

```js
var o = Object.defineProperties({}, {
  x: { value: 1, writable: true, enumerable:true, configurable:true },
  y: { value: 1, writable: true, enumerable:true, configurable:true },
  r: {
    get: function() { return Math.sqrt(this.x*this.x + this.y*this.y) },
    enumerable:true,
    configurable:true
  }
});
o.x // => 1
o.y // => 1
```

对于不能被创建或修改的属性，如果使用Object.defineProperty()和Object.defineProperties()进行创建或修改，将抛出类型错误异常。例如，不能给不可扩展的对象新增属性，否则将抛出TypeError。规则如下：

- 如果对象是不可扩展的，则可以修改已有的自有属性，但不能给它创建新属性。
- 如果属性是不可配置的，则不能修改它的可配置性和可枚举性。
- 如果存取器属性是不可配置的，则不能修改它的getter和setter方法，也不能将它转换为数据属性。
- 如果数据属性是不可配置的，则不能将它转换为存取器属性。
- 如果数据属性是不可配置的，则不能将它的可写性从false修改为true，但可以从true修改为false。（即仅仅可以修改为只读数据属性）
- 如果数据属性是不可配置且不可写的，则不能修改它的值。而可配置且不可写属性可以修改它的值（实际上是先将它标记为可写的，然后修改它的值，最后转换为不可写的）。

::: tip
从规则可见，不可配置的属性是不能修改get、set、enumerable和configurable这些特性的，并且也不能互相转换为数据属性或存取器属性。writable仅仅能修改为false（只读），而value必须在writable为true时可修改。
:::

### 6.8 对象的特性

#### 6.8.1 prototype

```js
var o = {};
var p = Object.create(o);
var q = Object.create(null);

// 通过对象直接量或Object.create创建的对象有一个constructor属性，
// 这个constructor属性指向Object构造函数
o.constructor === Object // => true
p.constructor === Object // => true
q.constructor // => undefined

// 对象直接量的原型是o.constructor.prototype，即Object.prototype
Object.getPrototypeOf(o) === Object.prototype // => true
// 或者通过__proto__来获得原型对象（非标准，不推荐使用）
o.__proto__ === Object.prototype // => true

// 检测Object.prototype是否为对象o的原型，或者是否在对象o的原型链上
Object.prototype.isPrototypeOf(o) // => true
```

#### 6.8.2 class

```js
function classof(o) {
  // 在ES5中不需要对null和undefined进行特殊处理
  if (o === null) return "Null";
  if (o === undefined) return "Undefined";
  return Object.prototype.toString.call(o).slice(8,-1);
}

classof(NaN) // => "Number"
classof("") // => "String"
classof(false) // => "Boolean"
classof([]) // => "Array"
classof(/./) // => "Regexp"

// 通过对象直接量或Object.create创建对象 它的class为Object
classof({}) // => "Object"
classof(Object.create({})) // => "Object"
classof(Object.create(null)) // => "Object"

// 通过内置构造函数创建对象 它的class与构造函数名称一致
classof(new Date) // => "Date"
// 宿主对象的class与具体实现由关
classof(window) // => "Window"
// 通过自定义构造函数创建对象 它的class为Object
classof(new function(){}) // => "Object"
```

#### 6.8.3 可扩展性

在ECMAScript 5中，所有的内置对象和自定义对象都是可扩展的，除非将它们转换为不可扩展的。而宿主对象的可扩展性是由实现的JavaScript引擎定义的。

```js
var o = { x: 1 };

// 检测对象是否可扩展
Object.isExtensible(o) // => true

// 将对象转换为不可扩展的 一旦转换成功将无法转为可扩展
Object.preventExtensions(o); // => { x: 1 }

Object.isExtensible(o) // => false
o.y = 2;
o.y // => undefined

// preventExtensions方法只影响原始对象的可扩展性 而不会影响原型对象
o.__proto__.y = 2
o.y // => 2
```

```js
var o = {
  x: 1,
  set y (value) {
    this.__proto__.z = value;
  }
};

// 检测对象是否已封锁（对象不可扩展+所有自有属性都不可配置）
Object.isSealed(o) // => false
// 封锁对象
Object.seal(o)
Object.isSealed(o) // => true
// 不能删除不可配置属性
delete o.x // => false

// 检测对象是否已冻结（对象已封锁+所有自有属性设置为只读）
Object.isFrozen(o) // => false
// 冻结对象
Object.freeze(o)
Object.isFrozen(o) // => true
o.x = 2
o.x // => 1
// 存取器属性不受影响 可以通过setter方法正常赋值
o.y = 2
o.z // => 2
```

### 6.9 序列化对象

JSON.stringify只能序列化对象的可枚举自有属性。

```js
JSON.stringify(NaN); // => "null"
JSON.stringify(Infinity); // => "null"
JSON.stringify(-Infinity); // => "null"

// 不能序列化undefined和函数
JSON.stringify(undefined); // => undefined
JSON.stringify(new Function); // => undefined

JSON.stringify(new Date); // => ""2020-02-23T13:35:43.583Z""

JSON.stringify(new Error); // => "{}"
JSON.stringify(new RegExp); // => "{}"
```

```js
// => "{"x":1,"y":false,"z":["",null,null,null,null],"null":null,"r":{},"date":"2020-02-23T14:07:20.221Z","error":{},"number":1}"
var s = JSON.stringify({
  "x": 1,     // => 1
  "y": false, // => false
  "z": ["", NaN, Infinity, null, undefined], // => ["", null, null, null, null]
  "null": null,           // => null
  "undefined": undefined, // 不能序列化
  "f": function() {},     // 不能序列化
  "r": /(?:)/,            // => {}
  "date": new Date,       // => "2020-02-23T13:59:42.501Z"
  "error": new Error,     // => {}
  "number": new Number(1) // => 1
})

/*
  => {
        x: 1,
        y: false,
        z: ["", null, null, null, null],
        null: null,
        r: {},
        date: "2020-02-23T14:14:04.652Z", // 日期字符串不会解析为日期对象
        error: {},
        number: 1
      }
*/
JSON.parse(s);
```

```js
var s = '{"x":[1,2],"date":"2020-02-23T14:07:20.221Z"}';
/**
 * @param key 属性名或数组索引
 * @param value 属性值或数组元素
 */
var o = JSON.parse(s, function (key, value) {
  if (key == "date") {
    return new Date(value);
  } else {
    if (value == 1) {
      return; // 返回undefined则delete该属性或元素
    } else {
      return value; // 返回非undefined则替换值
    }
  }
})

o.date.getMonth() // => 1
```

```js
/**
 * 序列化指定参数
 */
var o = {
  x: 1,
  y: {
    z: 2
  }
}

// 格式化JSON字符串：换行符+2个空格
JSON.stringify(o, null, 2)
/*
  => "{
      ##"x": 1,
      ##"y": {
      ####"z": 2
      ##}
      }"
*/
// 格式化JSON字符串：换行符+2个#
JSON.stringify(o, null, '##')

JSON.stringify(o, ["x", "y"]) // => "{"x":1,"y":{}}"

JSON.stringify(o, function (key, value) {
  return key == "z" ? undefined : value; // => "{"x":1,"y":{}}"
})
```

```js
var o = {
  x: 1,
  y: {
    toJSON: function (key) { // key="y"
      return { z: 2 };
    }
  },
  toJSON: function (key) { // key=""
    delete this.x;
    return this;
  }
}

JSON.stringify(o) // => "{"y":{"z":2}}"
```

## 7 数组

### 7.2 数组元素的读和写

在使用方括号访问数组元素时，与方括号访问对象属性一样，JavaScript会将方括号中的值转换成字符串。如果它是一个[0, 2^32^-2]之间的非负整数字符串，则这个字符串称为数组的索引。除此之外，这个字符串只能作为数组对象的属性名，而不是一个索引。数组的特殊之处在于，使用索引的数组会自动维护它的length属性值。实际上，数组索引也是数组对象的属性名，这意味着数组没有“越界”错误的概念。

```js
var a = [];
a[-1.23] = true; // 创建一个名为"-1.23"的属性

a["1000"] = 0; // 创建数组的1001个元素
a.length // => 1001

a[1.000] // a[String(1.000)]->a["1"]
```

### 7.3 稀疏数组

```js
var a = [,,,]
a.length // => 3
0 in a // => false
```

### 7.4 数组长度

```js
var a = [1, 2, 3]

a.length = 2 // a => [1, 2]
a.length = 3 // a => [1, 2, /*empty*/]

Object.seal(a)
// a的属性不可配置 因此不能删除
a.length = 1 // a => [1, 2]

a.length = 3 // a => [1, 2, /*empty*/]
// 将length设为只读属性
Object.defineProperty(a, "length", { writable: false })
a.length = 1 // a => [1, 2, /*empty*/]
```

### 7.8 数组方法

这些数组方法调用后将会修改原数组：`reverse`、`sort`、`splice`、`push`、`pop`、`unshift`、`shift`。

#### 7.8.1 join()

```js
[1, [2, "c"]].join() // => "1,2,c"
```

#### 7.8.6 splice()

```js
var a = [1, 2, 3, 4, 5, 6, 7, 8]

console.log(a.splice(6))    // => [7,8] a=[1,2,3,4,5,6]
console.log(a.splice(3, 2)) // => [4,5] a=[1,2,3,6]

// => []        a=[1,2,3,'a','b',6]
console.log(a.splice(3, 0, 'a', 'b'))
// => ['a','b'] a=[1,2,3,4,[5],6]
console.log(a.splice(3, 2, 4, [5]))
// => []        a=[1,2,3,4,[5],6]
console.log(a.splice(3, -1))
// => [[5]]     a=[1,2,3,4,5,6]
console.log(a.splice(-2, 1, 5))

console.log(a.splice(-7, 1)) // => [1] a=[2,3,4,5,6]
console.log(a.splice(5, 1)) // => [6] a=[2,3,4,5]
```

### 7.9 ECMAScript 5中的数组方法

```js
var a = [1, 2, 3]

// 与map|filter|every|some方法的参数一样
a.forEach(function(value, index, array) {
  this // => { x: 1 }
  array == a // => true
}, { x: 1 })
```

#### 7.9.2 map()

```js
var a = [1, 2, , 3]
// 稀疏数组调用依然返回稀疏数组
a.map(function(value) { // => [1, 2, /*empty*/, 3]
  // 但这里不遍历不存在的元素
  return value
})
```

#### 7.9.3 filter()

filter()会跳过稀疏数组中缺少的元素，它的返回数组总是稠密的。

#### 7.9.4 every()和some()

```js
// 当空数组或所有元素判断为true时返回true
[].every(function() { /* 不执行函数 */ }) // => true

// 当空数组或所有元素判断为false时返回false
[].some(function() { /* 不执行函数 */ }) // => false
```

#### 7.9.5 reduce()和reduceRight()

::: danger 纠正
*Page 159* -> reduce()和reduceRight()都不能接收一个可选参数作为化简函数调用时的this值。
:::

```js
var a = [2, 3, 4]

a.reduce(function(accumulator, value, index, array) { // => 10
  return accumulator + value
}, 1)

// 计算2^(3^4) 等价于先reverse再reduce
a.reduceRight(function(accumulator, value) {
  return Math.pow(value, accumulator)
})

// 空数组不传初始值参数将抛出类型错误异常：
// TypeError: Reduce of empty array with no initial value
// [].reduce(function() { /* 不执行函数 */ })

// 仅有一个值时直接返回该值
[].reduce(function() { /* 不执行函数 */ }, 1) // => 1
[1].reduce(function() { /* 不执行函数 */ }) // => 1
```

#### 7.9.5 indexOf()和lastIndexOf()

```js
var a = [1, 2, 3, 2, 4]

a.indexOf(2) // => 1
// 从索引为2的元素开始搜索
a.indexOf(2, 2) // => 3
// 从倒数三个元素开始搜索
a.indexOf(2, -3) // => 3

a.lastIndexOf(2, -3) // => 1
```

### 7.10 数组类型

```js
Array.isArray([]) // => true

[] instanceof Array // => true

// 使用instanceof操作符的问题
var iframe = document.body.appendChild(document.createElement("iframe"));
var a = new window.frames[window.frames.length - 1].Array;
a instanceof Array // => false
```

```js
// 数组检测方法（兼容ES3）
var isArray = Array.isArray || function(o) {
  return typeof o === "object" && Object.prototype.toString.call(o) === "[object Array]"
}
```

### 7.11 类数组对象

```js
/**
 * 类数组对象检测方法
 * 字符串与函数都有length属性 可以通过typeof排除
 * 在客户端JavaScript中的DOM文本节点也有length，可以通过o.nodeType != 3排除
 */
function isArrayLike(o) {
  if (o &&                                 // o非null或undefined等
      typeof o === "object" &&             // o是对象
      isFinite(o.length) &&                // o.length是有限数值
      o.length >= 0 &&                     // o.length是非负数
      o.length === Math.floor(o.length) && // o.length是整数
      o.length < Math.pow(2, 32))          // o.length小于2^32
    return true
  else
    return false
}
```

```js
var a = [1, 2]
var o = { "0": 1, "1": 2, length: 2 }

// 数组与类数组使用数组方法的两个特例：返回结果不一样
Array.prototype.toString.call(a) // => "1,2"
Array.prototype.toString.call(o) // => "[object Object]"
Array.prototype.concat.call(a, 3) // => [1, 2, 3]
Array.prototype.concat.call(o, 3) // => [o, 3]

// slice方法将类数组对象转换成真正的数组
Array.prototype.slice.call(o, 0) // => [1, 2]
```

### 7.12 作为数组的字符串

```js
var s = "JavaScript"

s.charAt(0) // => "J"
s[0] // => "J"

Array.prototype.join.call(s, " ") // => "J a v a S c r i p t"

// 字符串是不可变值
// 如果作为数组的字符串使用了诸如reverse、sort、splice等会修改
// 原数组的方法，将抛出类型错误异常
Array.prototype.push.call(s, "")
```

## 8 函数

### 8.1 函数定义

函数定义表达式的名称是该函数内部的一个局部变量，它指向了这个函数对象。

```js
var f = function g() {
  console.log(f === g) // => true
}
f()
console.log(typeof g) // => "undefined"
```

::: warning
函数声明语句并非真正的语句 [(5.3.2节)](2020-02-08-javascript-definitive-guide-notes-1.html#_5-3-2-function)，ECMAScript规范仅允许它们作为顶级语句。它们可以出现在全局代码中或者作为其他函数的嵌套函数，但不能出现在循环、条件判断或者try/catch/finally以及with语句中。一些JavaScript实现并未严格遵循这条规范。
:::

### 8.2 函数调用

#### 8.2.3 构造函数调用

构造函数调用时会创建一个新的空对象，这个对象继承自构造函数的prototype属性。构造函数可以使用this关键字来引用这个新创建的对象。注意，尽管构造函数是一个方法调用，它依然会使用这个新对象作为调用上下文。

```js
var o = {
  m: function() {
    this === o // => false
  }
}

new o.m()
```

如果构造函数显式地return一个对象，那么调用表达式的值就是这个对象。如果构造函数没有指定返回值，或者显式地返回一个原始值，那么这时将忽略返回值并将这个新对象this作为调用结果。

### 8.3 函数的实参和形参

#### 8.3.2 实参对象

在非严格模式下，实参对象中的数字索引和形参名称可以认为是相同变量的不同命名。

```js
function f(x) {
  console.log(x); // => 1
  arguments[0] = null;
  console.log(x); // => null
}
f(1);
```

在非严格模式中，函数的arguments仅仅是一个标识符，在严格模式中，它变成了一个保留字。严格模式中的函数不能使用arguments作为形参名或局部变量名，也不能赋值给arguments。[(5.7.3节)](2020-02-08-javascript-definitive-guide-notes-1.html#_5-7-3-use-strict-指令)
