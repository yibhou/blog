---
title: 《JavaScript权威指南》读书笔记（一）
author: 林明杰
date: 2020-02-08
location: Canton
tags:
- JavaScript
- 读书笔记
---

> *本文目的是对原书（《JavaScript权威指南》第六版）中的一些错误或疑惑点进行纠正与补充，以及记录一些重要的知识点。文章中的标题序号与书籍目录序号保持一致。*

[TOC]

## 2 词法结构

### 2.1 字符集

::: danger 纠正
*Page 38* -> 零宽非连接符为`\u200C`
:::

### 2.5 可选的分号

通常来讲，如果一条语句以“(”、“[”、“/”、“+”或“-”开始，那么它极有可能和前一条语句和在一起解析。例如：

```js
var y = x + f
(a + b).toString()
// 将解析为 var y = x + f(a + b).toString()
```

所以如果遇到以这些符号开始，最好在语句前显式加上分号，这样哪怕之前的语句被怎么修改也不会出现误解析的情况：

```js
var y = x + f
;(a + b).toString()
```

一般情况，JavaScript会合并解析下一行语句直到无法合并为止，但有两个例外情况。第一个例外是在`return`、`break`和`continue`这三个关键字后紧跟着换行时，JavaScript则会在换行处填补分号，例如：

```js
return
true
// 本意是 return true; 但会解析为 return; true;
```

第二个例外是在涉及“`++`”和“`--`”运算符时，运算符可作为表达式的前缀，也可当做表达式的后缀使用。例如：

```js
x
++
y
// 将解析为 x; ++y; 而不是 x++; y;
```

## 3 类型、值和变量

JavaScript的数据类型分为：
- `原始类型`：数字、字符串、布尔值、null 和 undefined；
- `对象类型`：对象、数组、函数。

::: tip
`null` 和 `undefined` 不能拥有方法，但数字、字符串和布尔值可以通过包装对象拥有自己的方法。[3.6](#_3-6-包装对象)
:::

```js
var a = 1;
a.toString(); // => "1"
```

### 3.1 数字

JavaScript不区分整数值和浮点数值，所有数字均采用浮点数值表示。能够表示整数的范围在 [-2^53^, 2^53^] 之间，如果使用超过此范围的整数，则无法保证低位数字的精度。

#### 3.1.3 JavaScript中的算术运算

```js
// 以10为底100的对数
Math.log(100) / Math.LN10 // => 2
// 等价于
Math.log(100) / Math.log(10) // => 2
```

其实就是利用换底公式换算log~m~a / log~m~b = log~b~a，这里的m等于e，即自然对数的底数。

---

JavaScript中的算术运算，如果超过所能表示数字的范围（**溢出**），结果值为正无穷大或负无穷大。如果当运算结果无限接近于零并比JavaScript所能表示的数值还要接近（**下溢**），此时会返回0或-0。

任何非零数值被零整除不会报错，它只是简单返回Infinity或-Infinity。

任何无意义的运算如零除以零、无穷大除以无穷大、给任何负数开平方运算或与非数字/无法转换为数字的运算，都将返回NaN。

::: tip
NaN使用了Significand非零、指数是特定2^e^-1且Sign无要求的所有可能，即2^53^减去±∞两种情况。
:::

```js
// 在Chrome, Safari, Firefox, Opera
Number.MAX_VALUE + 1 === Number.MAX_VALUE // => true
// 书上是Infinity返回结果为true 实际测试结果是还没溢出
Number.MAX_VALUE + 1 == Infinity // => false
// 这样才发生溢出！？目前无法找到溢出的临界值
Number.MAX_VALUE * 2 === Infinity // => true

- Number.MAX_VALUE - 1 === - Number.MAX_VALUE // true
- Number.MAX_VALUE - 1 == -Infinity // => false
```

另外，还有一个注意点：

```js
var zero = 0;
var negz = -0;
// 正零等于负零
zero === negz // => true
// 正无穷不等于负无穷
1 / zero === 1 / negz // => false
```

### 3.6 包装对象

数字、字符串和布尔值可以具有属性和方法，例如：

```js
var s = "hello world!";
// 使用字符串的属性和方法
var word = s.substring(s.indexOf(" ") + 1, s.length)
```

字符串在调用时通过new String(s)创建一个临时包装对象，一旦调用完成随即销毁这个对象（其实在实现上不一定创建或销毁这个临时对象，然而整个过程看起来是这样）。

```js
var s = "test";
// 等价于new String(s).len = 4
s.len = 4;
// 上面的临时对象被销毁了
s.len; // => undefined
```

### 3.8 类型转换

|值|字符串|数字|布尔值|对象|
|:---|:---|:---|:---|:---|
|undefined|"undefined"|NaN|false|throws TypeError|
|null|"null"|0|false|throws TypeError|
|true|"true"|1||new Boolean(true)|
|false|"false"|0||new Boolean(false)|
|""(空字符串)||0|false|new String("")|
|"1.2"(非空,数字)||1.2|true|new String("1.2")|
|"one"(非空,非数字)||NaN|true|new String("one")|
|0|"0"||false|new Number(0)|
|-0|"0"||false|new Number(-0)|
|NaN|"NaN"||false|new Number(NaN)|
|Infinity|"Infinity"||true|new Number(Infinity)|
|-Infinity|"-Infinity"||true|new Number(-Infinity)|
|1(有限的,非零)|"1"||true|new Number(1)|
|{}(任意对象)|参考3.8.3节|参考3.8.3节|true||
|\[\](任意数组)|""|0|true||
|\[9\](1个数字元素)|"9"|9|true||
|\['a'\]|使用join()方法|NaN|true||
|function(){}(任意函数)|参考3.8.3节|NaN|true||

```js
// 允许开始或结尾处带任意空白符的数字字符串转换为数字
+"  1  " // => 1
+"  1  \n" // => 1
```

#### 3.8.1 转换和相等性

`if`语句将undefined转换为false，但`==`运算符不会试图将其操作数转为为布尔值。

```js
"0" == 0 // 字符串转换成数字再进行比较
0 == false // 布尔值转换成数字再进行比较
"0" == false // 字符串和布尔值都转换成数字再进行比较
```

#### 3.8.2 显式类型转换

隐式地将`null`和`undefined`转换为对象会抛出一个类型错误 (TypeError)，但显式地使用`Object()`函数进行转换不会抛出异常，仅简单地返回一个新创建的空对象。

```js
Object(null) // => {}
Object(undefined) // => {}
```

#### 3.8.3 对象转换为原始值

```js
// 包装对象的默认valueOf方法返回原始值，复合值对象则简单返回对象本身
new Number('123').valueOf() // => 123
new Object({a: 1, b: 2}).valueOf() // => {a: 1, b: 2}
```

对象到字符串的转换有以下步骤：

![](~@images/javascript-definitive-guide-notes/object2string.png)

对象到数字的转换，不同的是首先尝试使用valueOf()方法：

![](~@images/javascript-definitive-guide-notes/object2number.png)

对象转换数字的细节解释了为什么空数组或一个数字元素的数组会被转换成一个数字，因为数组继承的默认valueOf()方法返回的是一个对象而不是原始值，因此需要进一步调用toString()方法，空数组转换完成空字符串，空字符串转换成数字0。

::: warning
值得注意的是，这里提到的字符串和数字的转换规则只适用于本地对象 (native object)，宿主对象（例如，由Web浏览器定义的对象）根据各自的算法可以转换成字符串和数字。
:::

::: warning
[加法运算符](#_4-8-1-运算符)`+`、[相等运算符](#_4-9-1-相等和不相等运算符)`==`的操作数中，日期对象会使用对象到字符串的转换模式，而非日期对象则基本上使用对象到数字的转换模式（首先调用valueOf方法，但不完全一致）。

然而，这里的转换和上文讲述（流程图）的并不完全一致：通过valueOf或toString方法返回的原始值将被直接使用，而不会被强制转换为数字或字符串。
:::

### 3.10 变量作用域

#### 3.10.1 函数作用域和声明提前

**声明提前**是在JavaScript引擎的预编译时进行的。

::: tip
ES6的`let`关键字所声明变量是属于块级作用域的，且不会对变量声明提前。
:::

#### 3.10.2 作为属性的变量

全局变量是全局对象的属性，而局部变量当做跟函数调用相关的某个对象的属性。ECMAScript 3规范称该对象为“调用对象” (call object)，ECMAScript 5规范称为“声明上下文对象” (declarative environment record)。

JavaScript允许this关键字引用全局对象，却没有可以引用存放局部变量的对象，这种存放局部变量的对象是我们不可见的内部实现。

#### 3.10.3 作用域链

```js
var a = 1;
function fn_1 () {
  var b = 2;
  function fn_2 () {
    var c = 3;
  }
  return fn_2;
}

// 创建call_fn_1_obj对象存放局部变量
var fn = fn_1()
// call_fn_2_obj_1
fn()
// call_fn_2_obj_2
fn()
```

![](~@images/javascript-definitive-guide-notes/scope-chain.png)

## 4 表达式和运算符

### 4.7 运算符概述

#### 4.7.7 运算顺序

运算符的优先级和结合性规定复杂表达式的运算顺序，而子表达式的运算顺序总是严格按照从左到右的顺序来计算表达式的。例如：

```js
// 运算顺序：o.m → o.n(=x) → a → b → a*b(=y) → x+y(=z) → o.m=z
o.m = o.n + a * b
```

只有在任何一个表达式具有副作用而影响到其他表达式的时候，其运算顺序才有所不同：

```js
// ++运算符有副作用且影响到其他表达式
// 假设两个表达式的a=1

// 运算顺序：b → a++(=1) → a(=2) → b=1+2
// 而不是：b → a(=1) → a(=1) → a++(=1) → b=1+1
b = a++ + a // => 3

// 运算顺序：b → ++a(=2) → a(=2) → b=2+2
b = ++a + a // => 4
```

### 4.8 算术表达式

#### 4.8.1 `+`运算符

加法运算符的类型转换规则为：

- 如果其中一个操作数是对象，则对象会遵循对象到原始值的转换规则转换为原始值（[3.8.3节](#_3-8-3-对象转换为原始值)）：日期对象通过toString方法进行转换，其他对象则通过valueOf方法进行转换（如果valueOf方法返回一个原始值的话），由于多数对象都不具备可用的valueOf方法或者返回的是对象，因此它们会通过toString方法进行转换。
- 在进行对象到原始值转换后，如果其中一个操作数是字符串的话，另一个操作数也会被转换为字符串，然后进行字符串连接。
- 否则，两个操作数都将转换为数字（或者NaN），然后进行加法操作。

```js
var o = {
  valueOf: function() { return "1" },
  toString: function() { return 2 }
}
o + 1 // => "11"
o + o // => "11"

var s = {
  valueOf: function() { return 1 },
  toString: function() { return "2" }
}
s + 1 // => 2
s + s // => 2
s + "1" // => "11"
// 显式类型转换有所不同 是直接调用toString来转换的
String(s) + "1" // => "21"
```

#### 4.8.3 位运算符

```
0x1234 = 1 0010 0011 0100
0x00FF = 1111 1111
0x0034 = 11 0100

0x12FF = 1 0010 1111 1111

0xFF00 = 1111 1111 0000 0000
0xF0F0 = 1111 0000 1111 0000
0x0FF0 = 1111 1111 0000
```

负数在计算机内部是以补码形式存放的，所以左移右移操作实际是对补码的操作，因此负数的左移右移操作必须首先转化为补码，再进行移动。

```js
/*
-7 >> 1 = [10000111] 原 >> 1
        = [11111001] 补 >> 1 = [11111100] 补
        = [11111011] 反 = [10000100] 原 = -4
*/

8 >> 1 = 4 // 正数忽略余数
9 >> 1 = 4
-8 >> 1 = -4 // 负数忽略余数
-9 >> 1 = -5 // 若存在余数 则结果减去 1
```

### 4.9 关系表达式

#### 4.9.1 相等和不相等运算符

严格相等运算符`===`首先计算其操作数的值，然后比较这两个值，比较过程没有任
何类型转换：

- 如果两个值类型不相同，则它们不相等。
- 如果两个值都是null或者都是undefined，则它们相等。
- 如果两个值都是布尔值true或都是布尔值false，则它们相等。
- 如果其中一个值是NaN，或者两个值都是NaN，则它们不相等。NaN和其他任何值都是不相等的，包括它本身！通过x!==x来判断x是否为NaN，只有在x为NaN的时候，这个表达式的值才为true。
- 如果两个值为数字且数值相等，则它们相等。如果一个值为0,另一个值为-0,则它们同样相等。
- 如果两个值为字符串，且所含的对应位上的16位数（参照3.2节）完全相等，则它们相等。如果它们的长度或内容不同，则它们不等。两个字符串可能含义完全一样且所显示出的字符也一样，但具有不同编码的16位值。JavaScript并不对Unicode进行标准化的转换，因此像这样的字符串通过“===”和“==”运算符的比较结果也不相等。第三部分的String.localeCompare()提供了另外一种比较字符串的方法。
- 如果两个引用值指向同一个对象、数组或函数，则它们是相等的。如果指向不同的对象，则它们是不等的，尽管两个对象具有完全一样的属性。

相等运算符`==`和恒等运算符相似，但相等运算符的比较并不严格。如果两个操作数不是同一类型，那么相等运算符会尝试进行一些类型转换，然后进行比较：

- 如果两个操作数的类型相同，则和上文所述的严格相等的比较规则一样。如果严格相等，那么比较结果为相等。如果它们不严格相等，则比较结果为不相等。
- 如果两个操作数类型不同，“==”相等操作符也可能会认为它们相等。检测相等将会遵守如下规则和类型转换：
  - 如果一个值是null，另一个是undefined,则它们相等。
  - 如果一个值是数字，另一个是字符串，先将字符串转换为数字，然后使用转换后的值进行比较。
  - 如果其中一个值是true,则将其转换为1再进行比较。如果其中一个值是false，则将其转换为0再进行比较。
  - 如果一个值是对象，另一个值是数字或字符串，则使用[3.8.3节](#_3-8-3-对象转换为原始值)所提到的转换规则将对象转换为原始值，然后再进行比较。对象通过toString()方法或者valueOf()方法转换为原始值。JavaScript语言核心的内置类首先尝试使用valueOf()，再尝试使用toString()，日期类除外，日期类只使用toString()转换。那些不是JavaScript语言核心中的对象则通过各自的实现中定义的方法转换为原始值。
  - 其他不同类型之间的比较均不相等。

```js
var o = {
  valueOf: function() { return "1" },
  toString: function() { return 2 }
}
o == 1 // => true
o == true // => true 两者转为数字1再进行比较
```

#### 4.9.2 比较运算符

比较操作符的操作数可能是任意类型。然而，只有数字和字符串才能真正执行比较操作，因此那些不是数字和字符串的操作数都将进行类型转换，类型转换规则如下：

- 如果操作数为对象，那么这个对象将依照[3.8.3节](#_3-8-3-对象转换为原始值)结尾处所描述的转换规则转换为原始值：如果valueOf()返回一个原始值，那么直接使用这个原始值。否则，使用toString()的转换结果进行比较操作。日期类也不例外（使用valueOf方法转换）。
- 在对象转换为原始值之后，如果两个操作数都是字符串，那么将依照字母表的顺序对两个字符串进行比较，这里提到的“字母表顺序”是指组成这个字符串的16位Unicode字符的索引顺序。
- 在对象转换为原始值之后，如果至少有一个操作数不是字符串，那么两个操作数都将转换为数字进行数值比较。0和-0是相等的。Infinity比其他任何数字都大（除了Infinity本身），-Infinity比其他任何数字都小（除了它自身）。如果其中一个操作数是（或转换后是）NaN，那么比较操作符总是返回false。

::: tip
字符串比较是区分大小写的，所有的大写的ASCII字母都“小于”小写的ASCII字母。
:::

```js
var d = new Date
d.valueOf() // => 1581480916223
d.toString() // => "Wed Feb 12 2020 12:15:16 GMT+0800 (China Standard Time)"

d > d.valueOf() // => false
d > d.valueOf() - 1 // => true

d == d.toString() // => true
d > d.toString() // => false
// 假设日期对象使用toString转换 那关系表达式应该会返回true
// 但实际返回false 所以日期是使用valueOf转换的
// 关系表达式等价于1581480916223>NaN的比较
d > "Wed Feb 12 2020 12:15:16 GMT+0800 (China Standard TimE)" // => false
```

::: tip
由上可见，比较运算符（包括`==`运算符）更偏爱数字，只有两边操作数都是字符串时，才会进行字符串的比较。而加法运算符则更偏爱字符串，只要其中一个操作数为字符串，就进行字符串连接操作。

由Unicode定义的字符编码顺序和任何特定语言或者本地语言字符集中的传统字符编码顺序不尽相同，String.localCompare()方法更加健壮可靠，这个方法参照本地语言的字母表定义的字符次序。
:::

最后，需要注意的是“<=”（小于等于）和“>=”（大于等于）运算符在判断相等的时候，并不依赖于相等运算符和严格相等运算符的比较规则。相反，小于等于运算符只是简单的“不大于”，大于等于运算符也只是“不小于”。如果一个操作数是（或者转换后是）NaN的时候，所有4个比较运算符均返回false。

```js
// null转换为0 undefined转换为NaN
null < undefined // => false
null > undefined // => false
// 不依赖于相等运算符的转换规则
null <= undefined // => false
null >= undefined // => false
```

#### 4.9.4 `instanceof`运算符

::: danger 纠正
*Page 78* -> 为了计算表达式`o instanceof f`，JavaScript首先计算f.prototype，然后在o的原型链中查找f.prototype，如果找到，那么o是f（或者f的父类）的一个实例，表达式返回true。如果f.prototype不在o的原型链中的话,那么o就不是f的实例，instanceof返回false。
:::

对象o中存在一个隐藏的成员，这个成员指向其父类的原型，如果父类的原型是另外一个类的实例的话，则这个原型对象中也存在一个隐藏成员指向另外一个类的原型，这种链条将许多对象或类串接起来，既是原型链，原文所讲f.prototype不在o的原型链中也就是说f和o没有派生关系。

### 4.12 表达式计算

#### 4.12.1 eval()

eval()只有一个参数。如果传入的参数不是字符串，它直接返回这个参数。如果参数是字符串，它会把字符串当成JavaScript代码进行编译，如果编译失败则抛出语法错误异常。如果编译成功，则开始执行这段代码，并返回字符串中的最后一个表达式或语句的值。如果执行过程抛出异常，eval方法会将这个异常传递出去。

eval的字符串执行时的上下文环境和调用eval函数的上下文环境是一样的。

```js
var foo = function(a) {
  eval(a);
  console.log(x); // => 1
};
foo('var x = 1');
// console.log(x); // ReferenceError: x is not defined
```

::: danger 纠正
*Page 84* -> 执行eval(a)的上下文是局部的
:::

#### 4.12.2 全局eval()

eval()具有更改局部变量的能力，这对于JavaScript优化器来说是一个很大的问题。JavaScript解释器针对那些调用了eval()的函数所做的优化并不多。

实际上，当通过别名调用时，eval()会将其字符串当成顶层的全局代码来执行。执行的代码可能会定义新的全局变姓和全局函数，或者给全局变量赋值，但却不能使用或修改函数中的局部变量，因此，这不会影响到函数内的代码优化。

直接调用eval()时（此时称eval为“直接eval”），它总是在调用它的上下文作用域内执行。而间接调用eval（称为“全局eval”）则使用全局对象作为其上下文作用域，并且无法读、写、定义局部变量和函数。下面有一段示例代码：

```js
var geval = eval;           // 使用別名调用eval将是全局eval
var x = "global", y = "global";
function f() {
  var x = "local";
  eval("x += 'changed';");
  return x;                 // 返回更改后的局部变量
}
function g() {              // 这个函数内执行了全局eval
  var y = "local";
  geval("y += 'changed';"); // 间接调用改变了全局变量的值
  return y;                 // 返回未更改的局部变量
}
console.log(f(), x); // 更改了局部变量：输出"localchanged global"
console.log(g(), y); // 更改了全局变量：输出"local globalchanged"
```

#### 4.12.3 严格eval()

ES5严格模式对eval()函数的行为施加了更多的限制，甚至对标识符eval的使用也施加了限制。当在严格模式下调用eval()时，或者eval()执行的代码段以`"use strict"`指令开始，此时的eval()是私有上下文环境中的局部eval。也就是说，在严格模式下，eval执行的代码段可以査询或更改局部变量，但不能在局部作用域中定义新的变量或函数。

此外，严格模式将eval列为保留字，这让eval()更像一个运算符。不能用一个别名覆盖eval()函数。并且变量名、函数名、函数参数或者异常捕获的参数都不能取名为eval。

```js
function f() {
  "use strict"
  var x = "local";
  // 可以修改局部变量 但不能创建新的变量
  eval("x += 'changed'; var y = 1;");
  console.log(x); // "localchanged"
  console.log(typeof(y)); // => "undefined"
}
f()

var geval = eval;
geval('"use strict" ;var y = "global";');
console.log(typeof(y)); // => "undefined"
geval('var y = "global";');
console.log(y); // => "global"
```

### 4.13 其他运算符

#### 4.13.2 typeof运算符

typeof运算符的返回值：

|x|typeof x|
|:---:|:---:|
|undefined|"undefined"|
|null|"object"|
|true或false|"boolean"|
|任意数字或NaN|"number"|
|任意字符串|"string"|
|任意函数|"function"|
|任意数组|"object"|
|任意内置对象（非函数）|"object"|
|任意宿主对象|由编译器各自实现的字符串，但不是"undefined"、"boolean"、"number"或"string"|

所有的函数都是可调用的 (callable)，但并非所有可调用的都是函数，即“可调用的对象” (callable object)，它可以像函数一样被调用，但并不是一个真正的函数。

例如，IE Web浏览器（IE8及之前的版本）实现了客户端方法（诸如window.alert()和document.getElementById()），使用了可调用的宿主对象，而不是内置函数对象。它们本质上不是Function对象。但IE9将它们实现为真正的函数，因此这类可调用的对象将越来越罕见。

```js
// IE8及之前的版本
typeof window.alert // => "object"
typeof document.getElementById // => "object"
```

#### 4.13.3 delete运算符

- 如果操作数不是左值，不做任何操作并返回true。
- 在ECMAScript5严格模式下，如果操作数是变量、函数或函数参数，将抛出一个语法错误异常。如果删除的是不可配置属性，将抛出类型错误异常。
- 在非严格模式下，诸如var变量、函数、函数参数以及不可配置属性，delete操作都不会抛出异常，只是简单地返回false，以表明不能执行删除操作。
- 其他操作数的删除操作，返回true。

```js
var x = 1;
delete x; // => false
delete window.x; // => false

// 可以删除eval下的var变量
eval("var y = 2; delete y;"); // => true
```

```js
"use strict"
window.x = 1;
window.y = 2;
delete window.x; // => true
delete y; // 抛出SyntaxError异常
```

## 5 语句

### 5.2 复合语句和空语句

::: danger 纠正
*Page 93* -> 块中的原始语句结尾的分号不是必须的
:::

### 5.3 声明语句

#### 5.3.2 function

函数声明语句和函数定义表达式同样都有函数名，两种方式都创建了新的函数对象。不同的是，通过函数定义表达式只有var声明变量“提前”到了脚本或函数的顶部，变量的初始化代码仍然在原来的位置。而使用函数声明语句的话，函数名称和函数体均提前到了脚本或函数的顶部，函数名称就是指向这个函数对象的变量名，因此它们在整个脚本和函数内都是可调用的，也就是说，可以在一个声明函数语句之前调用这个函数。

```js
console.log(x); // => undefined
console.log(f); // => undefined
{
  console.log(f); // => f函数对象
  var x = 1;
  // f函数体提升到语句块顶部 变量名提升到脚本顶部
  // 并不等价于var f = function() {}
  function f() {}
}
console.log(x); // => 1
console.log(f); // => f函数对象
```

### 5.5 循环

#### 5.5.3 for

与`while(true)`类似，死循环的另外一种写法是`for(;;)`。

#### 5.5.4 for/in

```js
for (variable in object)
  statement
```

在执行for/in语句的过程中，JavaScript解释器首先计算object表达式：

- 如果表达式为null或者undefined，它将会跳过循环并执行后续的代码（ES3的实现可能抛出类型错误异常）。
- 如果表达式等于一个原始值，这个原始值将会转换为与之对应的包装对象。
- 否则，表达式本身就是对象。

然后，JavaScript会依次枚举对象的属性来执行循环。每次循环之前，都会先计算variable表达式的值，并赋值给variable。例如：

```js
var o = { x: 1, y: 2, z: 3 };
var a = [], i = 0;
for (a[i++] in o) /* empty */;
```

其实，for/in循环并不是对所有的对象属性都遍历，只有“可枚举” (enumerable) 的属性才会遍历。代码中自定义的所有属性和方法都是可枚举的（在ECMAScript5中可以通过特殊手段让可枚举属性变为不可枚举）。对象可以继承其他对象的属性，那些继承的自定义属性也是可以枚举的。

for/in中不可枚举的属性有：

- JavaScript核心定义的内置方法，例如toString方法。
- 很多内置对象的属性也是“不可枚举的”。
- 在循环体中删除的未枚举的属性。
- 在循环体中对象新定义的属性（有些实现是可以枚举那些在循环体中增加的继承属性的）。

ECMAScript规范并没有指定for/in循环按照何种顺序来枚举对象属性。但实际上，主流浏览器厂商是按照属性定义的先后顺序来枚举简单对象的属性，先定义的属性先枚举。如果使用对象直接量的形式创建对象，则将按照直接量中属性的出现顺序枚举。而以下情况的枚举顺序取决于浏览器的具体实现：

- 对象继承的可枚举属性；
- 对象具有整数数组索引的属性；
- 使用delete删除了对象已有的属性；
- 使用Object.defineProperty()或者类似的方法改变的对象属性。

```js
var o = {
  "b": 0,
  "0": 1,
  "2": 2,
  "c": 3,
  "1": 4,
  "a": 5
};
for (k in o) {
  delete o.c;
  o.d = 3;
  // Chrome实现的枚举顺序为0->1->2->b->a
  console.log(k);
}
```

除了对象所有非继承的“自有”属性外，还有继承的“自有”属性往往（并非所有实现）都是可枚举的，而且按照它们定义的顺序进行枚举。另外还有一些（也是并非所有实现）实现依照数字顺序来枚举数组属性，但当数组元素的索引是非数字或数组是稀疏数组时却按照指定顺序来枚举。

### 5.6 跳转

#### 5.6.1 标签语句

标签的identifier必须是一个合法的JavaScript标识符，而不能是一个保留字。标签的命名空间和变量或函数的命名空间是不同的，因此可以使用同一个标识符作为语句标签和变量名或函数名。

语句标签只有在引用的语句内（包括子句中）是有定义的。一个语句标签不能和它内部的语句标签重名，但在互不相嵌套的两个代码段是可以出现同名的语句标签的。

```js
var identifier = 1;

identifier:
  console.info('statement');
identifier:
  test:
    // 带有标签的语句还可以带有标签 任何语句可以有很多个标签
    console.info('test');
```

`break`和`continue`是JavaScript中唯一可以使用语句标签的语句。

#### 5.6.2 break语句

当break和标签一块使用时，程序将跳转到这个标签所标识的语句块的结束，或者直接终止这个闭合语句块的执行。当没有任何闭合语句块指定了break所用的标签，这时会产生一个语法错误。

```js
identifier:
  while(true) {
    while(true) {
      break identifier;
    }
    console.info('never run');
  }

a: {
  b: if (true) {
    break a;
  }
  console.info('never run');
}
```

需要注意的是，不管break语句是否带标签，它的控制权都无法越过函数的边界：

```js
identifier: var f = function() {
  while (true) {
    break identifier; // 编译失败
  }
}
```

#### 5.6.3 continue语句

不管continue语句是否带标签，它只能在循环体内使用。否则将会报语法错误。

continue语句在while循环中会直接进入下轮循环的条件判断，而for循环在进入下轮循环之前，首先计算其自增表达式，然后判断循环条件。

```js
// continue语句在使用while循环不可能完美地模拟等价的for循环

identifier:
  for (var i = 0, j = 0; i < 2; i++) {
    console.log(i, j); // j始终为0
    loop: for (j = 0; j < 1; j++) {
      // 带标签跳到其他循环时并不会j++
      // 如果跳到loop才会j++
      continue identifier;
    }
  }

identifier:
  for (var i = 0, j = 0; i < 2; i++) {
    console.log(i, j); // j首先为0 然后为1
    j = 0;
    while (j < 1) {
      j++;
      continue identifier;
    }
  }
```

#### 5.6.5 throw语句

```js
// throw可以显式抛出任意类型异常
throw 404;
throw '异常';
throw undefined;
throw new SyntaxError('语法错误');

var e = new Error();
e.name = '异常类型';
e.message = '异常消息';
throw e;
```

#### 5.6.6 try/catch/finally语句

终止try语句块的方式有：

- 执行完语句块的最后一条语句之后正常终止
- 通过break、continue或return语句终止
- 抛出一个异常

如果try语句块使用return、continue或break语句使程序发生跳转，那么都会先执行finally块（如果存在的话）中的逻辑。

如果finally块使用return、continue、break或者throw语句使程序发生跳转，或者通过调用一个抛出异常的方法使其跳转，不管这个跳转使程序挂起 (pending) 还是执行这个跳转，解释器都会抛弃之前的跳转。例如，如果finally抛出一个异常，这个异常将替代正在抛出的异常。如果finally执行到return语句，尽管已经抛出了异常且这个抛出的异常还没有处理，这个方法依然会正常返回。

```js
while(true) {
  try {
    throw 404; // 解释器会将其忽略
  } finally {
    break;
  }
}

function f() {
  try {
    // 这个跳转将被抛弃 抛出异常也是一样
    return 0;
  } finally {
    return 1;
  }
}
console.log(f()); // => 1
```

---

我们无法完全精确地使用while循环来模拟for循环，因为continue语句在两个循环中的行为表现不一致。如果使用try/finally语句，就能使用while循环来正确模拟包含continue（不带标签）的for循环：

```js
for (var i = 0; i < 2; i++) {
  console.log(i);
}

var i = 0;
while(i < 2) {
  try {
    console.log(i);
  } finally {
    i++;
  }
}
```

然而，如果continue带标签，则无法完美地模拟：[(5.6.3节)](#_5-6-3-continue语句)

```js
identifier:
  for (var i = 0, j = 0; i < 2; i++) {
    console.log(i, j); // j首先为0 然后为1
    j = 0;
    while (j < 1) {
      try {
        continue identifier;
      } finally {
        j++;
      }
    }
  }
```

当循环体中包含break语句时，while循环和for循环便有了更微妙的区別：在for循环中不会执行自增运算，而while循环则会多执行一次额外的自增运算。因此即便使用了finally从句，使用while来完全模拟for循环依然是不可能的。

### 5.7 其他语句类型

#### 5.7.1 with语句

::: warning
在严格模式中是禁止使用with语句的，并且在非严格模式里也是不推荐使用with语句的。那些使用with语句的JavaScript代码非常难于优化，并且与没有使用with语句的代码相比，它运行得更慢。
:::

`with(o) x = 1;`

如果对象o有一个属性x，那么这行代码给这个属性赋值为1。但如果o中没有定义属性x，这段代码与不使用with语句的x=1是完全一样的。只有在査找标识符时才会用到作用域链，而创建新的变量时不会使用它，而是会给一个局部变量或者全局变量赋值，或者创建全局对象的一个新属性。with语句提供了一种读取属性的快捷方式，但它并不能创建新属性。

```js
var x = 1;
var o = { x: 2 };
var f = function() {
  var x = 3;

  with(o) {
    y = 4;
    console.log(x); // 2
  };
  console.log(x); // 3
  console.log(window.y); // 4
};
f();
```

#### 5.7.3 "use strict"指令

```js
// 指令为字符串直接量 只能出现在脚本或函数体开始
// 如果在常规语句之后出现字符串直接量表达式语句 则当做普通语句对待

var o = {};
// 不是一条指令
"use strict"
// 如果在严格模式下with语句会报SyntaxError
// 这里不报SyntaxError 表明不在严格模式下
with(o) /* empty */;

function directive() {
  "其他指令"
  "use strict"
  // 抛出SyntaxError异常
  with(o) /* empty */;
}
```

ECMAScript 5中的严格模式是该语言中一个受限制的子集，它修正了语言的重要缺陷，并提供健壮的査错功能和增强的安全机制。严格模式和非严格模式之间的区别如下（前三条尤为重要）：

- 在严格模式中，禁止使用with语句。[(5.7.1节)](#_5-7-1-with语句)
- 在严格模式中，所有变量必须先声明，否则将会抛出一个引用错误异常。（在非严格模式中，会隐式声明为一个全局变量，即给全局对象添加一个新属性）。
- 在严格模式中，调用函数（不是方法）中的this值为undefined。（在非严格模式中，调用函数中的this值为全局对象）。可以利用这种特性来判断JavaScript实现是否支持严格模式：
  ```js
  var hasStrictMode = (function() {
    "use strict";
    return this === undefined
  }());
  ```
- 在严格模式中，当通过call()或apply()来调用函数时，其中this值就是通过call()或apply()传入的第一个参数。（在非严格模式或ECMAScript 3中，参数null和undefined会替换成全局对象作为this值，而原始值会转成对应的包装对象）。
- 在严格模式中，赋值给只读属性和给不可扩展的对象创建新成员都将抛出一个类型错误异常。（在非严格模式中，只是简单地操作失败，并不会报错）。
- 在严格模式中，传入eval()的代码段不能在调用eval的上下文作用域中声明变量或定义函数（在非严格模式中是可以这样做的）。这些变量和函数的定义是在eval()创建的新作用域中，当eval()返回时，这个作用域就会被抛弃。[(4.12.3节)](#_4-12-3-严格eval)
  ```js
  "use strict"
  eval("var x = 1;");
  console.log(typeof x); // => undefined
  ```
- 在严格模式中，函数里的arguments对象保存了一份函数实参的静态副本。（在非严格模式中，arguments对象拥有“魔术般”的行为，arguments类数组对象的元素与函数参数都引用同一个值）。
  ```js
  function f(x) {
    "use strict"
    console.log(arguments[0]); // => 0
    x = 1;
    console.log(arguments[0]); // => 0
  }
  function g(x) {
    console.log(arguments[0]); // => 0
    x = 1;
    console.log(arguments[0]); // => 1
  }
  f(0);
  g(0);
  ```
- 在严格模式中，当delete运算符的操作数是诸如变量、函数或函数参数这些标识符时，将会抛出一个语法错误异常。（在非严格模式中，这些delete表达式不做任何操作，并返回false）。
- 在严格模式中，试图删除一个不可配置属性将抛出一个类型错误异常。（在非严格模式中，delete表达式操作失败，并返回false）。[(4.13.3节)](#_4-13-3-delete运算符)
- 在严格模式中，在对象直接量中定义两个或多个同名属性将产生一个语法错误。（在非严格模式中不会报错）。
- 在严格模式中，在函数声明中存在两个或多个同名参数将产生一个语法错误。（在非严格模式中不会报错）。
- 在严格模式中，不允许使用八进制的整数直接量（以0为前缀，而不是0x）。（在非严格模式中，某些实现是允许八进制直接量的）。
- 在严格模式中，标识符eval和arguments会当成关键字，它们的值是不允许更改的。不能给这些标识符赋值，也不能将它们声明为变量以及作为函数名、函数参数或catch块的标识符来使用。
- 在严格模式中，调用栈的检查能力被限制使用。使用arguments.caller（某些实现已废弃该属性）和arguments.callee方法将抛出一个类型错误异常。当读取函数的caller和arguments属性时也将抛出类型错误异常。（某些实现在非严格模式中定义了这些非标准的属性）。
  ```js
  "use strict"
  function f() {
    console.log(arguments);
    f.arguments // 抛出TypeError
  }
  f()
  ```
