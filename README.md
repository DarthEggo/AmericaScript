<h1 align="center"><a href="https://www.reddit.com/r/GenUsa/">AmericaScript</a></h1>

![](https://raw.githubusercontent.com/DarthEggo/AmericaScript/main/images/america.png)

<h4 align="center">AmericaScript, an ironic programming language made with unironic patriotism</h4>

<h2 align="center">Usage</h2>
<h4>Create a new file with the extenstion - <code>.murica</code></h4>
<h4>Run the Compiler with <code>node america.js main</code>(or whatever you name your file)</h4>
<h4>If you want to know the compile time, you can run <code>node america.js main time</code></h4>

<h2 align="center">Documentation</h2>
<h4 align="center">Independences</h4>
<h5 align="left">Independences, or as they are known in silly normal languages, 'variables', can be created with the 'declare' keyword. </h5>

```js
declare ind = 0;
declare indYear = 1776;
declare indGood = true;
```
<h4 align="center">Printing to Console</h4>
<h5 align="left">Instead of using <code>print()</code> or <code>console.log</code>, AmericaScript uses <code>eagle()</code> </h5>

```js
declare year = 1776;
eagle(year);
```
<h4 align="center">Comments</h4>
<h5 align="left">Comments can be made with the '@' Symbol </h5>

<h4 align="center">Conditionals</h4>
<h5 align="left">Conditionals are similar to normal languages</h5>

```js
declare year = 1776;
if(year == 1776) {
   eagle("Based Year");
}
else {
   eagle("Normal Year");
}
@Output = "Based Year"
```

<h4 align="center">Burgers</h4>
<h5 align="left">Burgers, or 'functions', can be declared with the burger keyword. The return value is the last line in the function</h5>

```js
declare sum = burger(x,y) {
   x + y
};
eagle(sum(2,2))
@Output = 4
```

<h4 align="center">Loops</h4>
<h5 align="left">Currently only while loops are available, with the keyword 'stars'. You can easily turn a while loop into a for loop though</h5>

```js
declare i = 0;
stars(i < 5) {
  eagle(i);
  i += 1;
}
@Output = 1 2 3 4 5
```


<h4 align="center">Operators </h4>

```js
   eagle(1 + 1)  @Output = 2
   eagle(1 - 1)  @Output = 0
   eagle(2 * 2)  @Output = 4
   eagle(1 / 2)  @Output = 0.5
   eagle(4 % 2)  @Output = 0
   if(true && false) {}  @False
   if(true || false) {}  @True
   if(1 < 2) {} @True
   if(1 > 2) {} @False
   if(1 <= 1) {}  @True
   if(1 >= 0) {}  @False
   if(1 == 1) {}  @True
   if(1 != 1) {}  @False
   @declare i = 10;
   i += 1 @i = 11;
   i -= 1 @i = 9;
   i *= 2 @i = 20;
   i /= 2 @i = 5;
```






