---
layout: post
title: "Mastering JavaScript Operators: A Complete Guide with Examples"
description: "A complete breakdown of all JavaScript operators including arithmetic, logical, assignment, comparison, bitwise, and special operators with syntax and real-world examples."
shortinfo: "Transform, compare, assign—write cleaner code."
excerpt: "Learn every JavaScript operator with clear syntax, use cases, and examples—from arithmetic to optional chaining, bitwise, and beyond."
date: 2025-09-05
category: [JavaScript]
tags: [javascript, operators, syntax, tutorial, programming, webdev, es6+, frontend, cheatsheet]
slug: mastering-js-operators
image:
  path: /assets/img/posts/javascript/mastering-js-operators/cover.png
  width: 1200
  height: 800
  alt: |
    Illustration with gradient background showing JavaScript operators in a code-like style, representing arithmetic, logical, assignment, comparison,
    and modern operators for mastering JavaScript.
changelog:
  - date: 2025-09-05
    change: "Initial publication"
---

## Introduction

JavaScript offers a wide range of operators that help you write clean, expressive, and efficient code.

Whether you're comparing values, assigning variables, performing calculations, or safely accessing deeply nested properties—**operators are essential to mastering JavaScript.**

In this post, we'll break down **all JavaScript operators** grouped by category, with **clear syntax and real-world examples** for each.

## What You'll Learn

- The full set of JavaScript operators, grouped by category
- Practical code examples with common use cases
- Modern syntax like `??`, `?.`, `|>`, and more
- Best practices and tips for writing clean, readable code

## Arithmetic Operators

Arithmetic operators perform basic mathematical calculations such as addition, subtraction, multiplication, division, remainder, and
exponentiation. They work on numbers and always return a numeric result.

### `+` Addition

The `+` operator adds two numbers or concatenates two strings. When a number and a string are combined, it performs string concatenation.

It can also be used as a **unary operator** to convert a numeric string into a number, though this is less common. Generally, using `Number()` is clearer.

{% codeblock %}
{% highlight js linenos %}
console.log(5 + 3); // 8
console.log("Hello " + "World"); // "Hello World"

console.log(5 + "3"); // '53'

// As a unary operator
console.log(+'5'); // 5 (number)
console.log(+'hello'); // NaN
console.log(+true); // 1 (number)
{% endhighlight %}
{% endcodeblock %}

### `-` Subtraction

The `-` operator subtracts the right operand from the left.

It can also be used as a unary operator to indicate a negative number. For example, `-5` doesn’t perform subtraction—it simply represents the value negative five.

{% codeblock %}
{% highlight js linenos %}
console.log(10 - 4); // 6

// As a unary operator
const negNum = -5;
console.log(5 + negNum); // 0 (number)
console.log(-"5"); // -5 (number)
console.log(-false); // -0 (number)
{% endhighlight %}
{% endcodeblock %}

### `*` Multiplication

The `*` operator performs multiplication between two numbers.

{% codeblock %}
{% highlight js linenos %}
console.log(6 * 7); // 42
{% endhighlight %}
{% endcodeblock %}

### `/` Division

The `/` operator divides the left operand by the right and returns a numeric result.

{% codeblock %}
{% highlight js linenos %}
console.log(10 / 2); // 5
console.log(5 / 4); // 1.25
{% endhighlight %}
{% endcodeblock %}

### `%` Remainder (Modulo)

The `%` operator, also called the **modulo operator**, returns the remainder after dividing the left operand by the right.

It belongs to the same mathematical family as addition (`+`) and multiplication (`*`) and is commonly used in tasks like
checking even/odd numbers or cycling through array indices.

{% codeblock %}
{% highlight js linenos %}
console.log(10 % 3); // 1
console.log(8 % 4); // 0
{% endhighlight %}
{% endcodeblock %}

### `**` Exponentiation

The `**` operator raises the left operand to the power of the right operand.

{% codeblock %}
{% highlight js linenos %}
let x = 2;

console.log(x ** 2); // 4
console.log(x ** 3); // 8
{% endhighlight %}
{% endcodeblock %}

**Compatibility: ES2016+**

## Logical Operators

Logical operators are used to combine or invert boolean values. They help control program flow by evaluating multiple conditions with
**AND** (`&&`), **OR** (`||`), and **NOT** (`!`). They always return a boolean result or the actual value in short-circuit evaluation.

### `&&` Logical AND

The `&&` operator is commonly used to check if all supplied values are truthy.

It also acts as a **control-flow operator**: it returns the first falsy value it encounters. If all values are truthy, it returns the last value.

{% codeblock %}
{% highlight js linenos %}
// As a logical operator:
if (someCondition && someOtherCondition) {
  // Code here is only run if both variables are true, or truthy.
}

// As a control flow operator:
console.log(0 && 4);         // 0, since it's the first falsy value
console.log(2 && 4);         // 4, since neither value is falsy
console.log(1 && 2 && 3);    // 3, since all values are truthy
console.log('a' && '' && 0); // '', the first falsy value
{% endhighlight %}
{% endcodeblock %}

### `||` Logical OR

The `||` operator is commonly used to check if any supplied value is truthy.

As a **control-flow operator**, it returns the first truthy value. If none are truthy, it returns the last value.

{% codeblock %}
{% highlight js linenos %}
// As a logical operator:
if (someCondition || someOtherCondition) {
  // Code here is only run if at least one of
  // the two variables hold truthy values.
}

// As a control flow operator:
console.log(0 || 4);      // 4, since it's the first truthy value
console.log(2 || 4);      // 2, since it's the first truthy value
console.log('' || 0);     // 0, since no values are truthy
console.log(1 || 2 || 3); // 1, since it found a truthy value right away!
{% endhighlight %}
{% endcodeblock %}

### `!` Logical NOT

The `!` operator, often called **bang**, negates a boolean value:

- `false` becomes `true`
- `true` becomes `false`

It also works on non-boolean values: any falsy value evaluates to `true`, and any truthy value evaluates to `false`.

It can be repeated to convert any value to a strict boolean.

{% codeblock %}
{% highlight js linenos %}
console.log(!true); // false
console.log(!false); // true

console.log(!0); // true
console.log(!10); // false

console.log(!!0); // false
console.log(!!10); // true
{% endhighlight %}
{% endcodeblock %}

**Note:** In TypeScript, placing `!` after a variable acts as the **Non-null Assertion Operator**.

### `!!` Double NOT

The `!!` operator converts any value to a strict boolean (`true` or `false`).

{% codeblock %}
{% highlight js linenos %}
!!"text"; // true
!!0;     // false
{% endhighlight %}
{% endcodeblock %}

## Bitwise Operators

Bitwise operators work directly on the **binary representation of numbers**. They perform operations like AND, OR, XOR, NOT, and bit
shifting. These are commonly used in low-level programming, optimizations, or when working with binary data, masks, or flags.

> **Note:** Bitwise operators operate on 32-bit integer representations of numbers. They coerce values to
> 32-bit signed integers, so they are not suitable for very large integers.

### `&` Bitwise AND

The `&` operator performs a bitwise AND operation on each bit of two integers

{% codeblock %}
{% highlight js linenos %}
console.log(5 & 3); // 1  (0101 & 0011 = 0001)
{% endhighlight %}
{% endcodeblock %}

> Not to be confused with the Logical AND operator (`&&`)

### `|` Bitwise OR

The `|` operator performs a bitwise OR operation on each bit of two integers.

{% codeblock %}
{% highlight js linenos %}
console.log(5 | 3); // 7 (0101 | 0011 = 0111)
{% endhighlight %}
{% endcodeblock %}

> Not to be confused with the Logical OR operator (`||`)

### `^` Bitwise XOR

The `^` operator performs a bitwise exclusive OR on each bit of two integers.

{% codeblock %}
{% highlight js linenos %}
console.log(5 ^ 3); // 6 (0101 ^ 0011 = 0110)
{% endhighlight %}
{% endcodeblock %}

### `~` Bitwise NOT

The `~` operator inverts all the bits of the value (two's complement).

{% codeblock %}
{% highlight js linenos %}
console.log(~5); // -6
// ~00000000000000000000000000000101
// = 11111111111111111111111111111010 (-6)
{% endhighlight %}
{% endcodeblock %}

### `<<` Left Shift

The `<<` operator shifts bits to the left, filling zeros on the right.

{% codeblock %}
{% highlight js linenos %}
console.log(5 << 1); // 10 (0101 << 0001 = 1010)
{% endhighlight %}
{% endcodeblock %}

### `>>` Right Shift

The `>>` operator shifts bits to the right, **preserving sign bit**.

{% codeblock %}
{% highlight js linenos %}
console.log(5 >> 1); // 2 (0101 >> 0001 = 0010)
{% endhighlight %}
{% endcodeblock %}

### `>>>` Unsigned Right Shift

The `>>>` operator shifts bits to the right, filling with zeros and **ignoring the sign**.

{% codeblock %}
{% highlight js linenos %}
console.log(-5 >>> 1); // -5 >>> 1 = 2147483645
{% endhighlight %}
{% endcodeblock %}

## Assignment Operators

Assignment operators are used to assign values to variables. Along with simple assignment (`=`), they provide shorthand forms for
performing arithmetic or logical operations while updating the variable (e.g., `+=`, `-=`, `||=`, `??=`).

### Arithmetic Assignment Operators

#### `=` Assignment

The `=` operator assigns a value to the variable.

{% codeblock %}
{% highlight js linenos %}
let x = 10;

console.log(x); // 10
{% endhighlight %}
{% endcodeblock %}

#### `+=` Addition Assignment

The `+=` operator adds a value to the variable, and overwrites that variable's value with the result.

{% codeblock %}
{% highlight js linenos %}
let x = 10;
x += 2;

console.log(x); // 12 (10 + 2)
{% endhighlight %}
{% endcodeblock %}

#### `-=` Subtraction Assignment

The `-=` operator subtracts a value from the variable, and overwrites that variable's value with the result.

{% codeblock %}
{% highlight js linenos %}
let x = 10;
x -= 2;

console.log(x); // 8 (10 - 2)
{% endhighlight %}
{% endcodeblock %}

#### `*=` Multiplication Assignment

The `*=` operator multiplies a variable by a value, and overwrites that variable's value with the result.

{% codeblock %}
{% highlight js linenos %}
let x = 10;
x *= 2;

console.log(x); // 20 (10 * 2)
{% endhighlight %}
{% endcodeblock %}

#### `/=` Division Assignment

The `/=` operator divides a variable by a value, and overwrites that variable's value with the result.

{% codeblock %}
{% highlight js linenos %}
let x = 10;
x /= 2;

console.log(x); // 5 (10 / 2)
{% endhighlight %}
{% endcodeblock %}

#### `%=` Remainder Assignment

The `%=` operator assigns the remainder after division, and overwrites that variable's value with the result.

{% codeblock %}
{% highlight js linenos %}
let x = 10;
x %= 2;

console.log(x); // 0 (10 %= 2)
{% endhighlight %}
{% endcodeblock %}

#### `**=` Exponentiation Assignment

The `**=` operator applies an exponentiation (bringing the value to the power of X), an assigns the result to the affected variable.

{% codeblock %}
{% highlight js linenos %}
let x = 10;
x **= 2;

console.log(x); // 100 (10 ** 2)
{% endhighlight %}
{% endcodeblock %}

### Logical Assignment Operators

#### `&&=` Logical AND Assignment

The `&&=` operator assigns a value to a variable, but only if that variable already holds a `truthy` value.

{% codeblock %}
{% highlight js linenos %}
let x = 0;
let y = 1;

x &&= 2; // No effect, since 0 is falsy
y &&= 2; // Assigns 2, since 1 is truthy

console.log(x, y); // 0, 2
{% endhighlight %}
{% endcodeblock %}

**Compatibility: ES2021+**

#### `||=` Logical OR Assignment

The `||=` operator assigns a value to a variable, but only if that variable already holds a `falsy` value.

{% codeblock %}
{% highlight js linenos %}
let x = 0;
let y = 1;

x ||= 2; // Assigns 2, since 0 is falsy
y ||= 2; // Has no effect, since 'y' held a truthy value

console.log(x, y); // 2, 1
{% endhighlight %}
{% endcodeblock %}

**Compatibility: ES2021+**

#### `??=` Logical Nullish Assignment

The `??=` operator updates a variable with a new value, but only if that variable currently holds a "nullish" value (either `null` or `undefined`).
This operator is also known as _**Nullish Coalescing Assignment**_.

{% codeblock %}
{% highlight js linenos %}
let x = 0;
let y = null;
let z;

x ??= 2; // Has no effect, since 'x' already holds a value
y ??= 2; // Updates 'y' to hold this new value
z ??= 2; // Updates 'z' to hold this new value (by not assigning 'z' a value initially, it was considered undefined).

console.log(x, y, z); // 0, 2, 2
{% endhighlight %}
{% endcodeblock %}

**Compatibility: ES2021+**

### Bitwise Assignment Operators

#### `&=` Bitwise AND Assignment

The `&=` operator performs a bitwise AND operation to a variable, and overwrites the result into the same variable.

{% codeblock %}
{% highlight js linenos %}
let x = 5;
x &= 3

console.log(x); // 1
{% endhighlight %}
{% endcodeblock %}

#### `|=` Bitwise OR Assignment

The `|=` operator performs a bitwise OR operation on a variable, and assigns the result to that same variable.

{% codeblock %}
{% highlight js linenos %}
let x = 5;
x |= 3

console.log(x); // 7
{% endhighlight %}
{% endcodeblock %}

#### `^=` Bitwise XOR Assignment

The `^=` operator performs a bitwise XOR operation on a variable, and assigns the result to that same variable.

{% codeblock %}
{% highlight js linenos %}
let x = 5;
x ^= 3

console.log(x); // 6
{% endhighlight %}
{% endcodeblock %}

#### `<<=` Left Shift Assignment

The `<<=` operator performs a bitwise left shift operation on a variable, and overwrites the variable with this new value.

{% codeblock %}
{% highlight js linenos %}
let x = 5;
x <<= 1

console.log(x); // 10
{% endhighlight %}
{% endcodeblock %}

#### `>>=` Right Shift Assignment

The `>>=` operator performs a bitwise right shift operation on a variable, and overwrites the variable with this new value (sign-preserving).

{% codeblock %}
{% highlight js linenos %}
let x = 5;
x >>= 1

console.log(x); // 2
{% endhighlight %}
{% endcodeblock %}

#### `>>>=` Unsigned Right Shift Assignment

The `>>>=` operator performs a unsigned bitwise right shift (unsigned) operation on a variable, and overwrites the variable with this new value .

{% codeblock %}
{% highlight js linenos %}
let x = -5;
x >>>= 1

console.log(x); // 2147483645
{% endhighlight %}
{% endcodeblock %}

## Comparison Operators

Comparison operators are used to compare two values and return a boolean (`true` or `false`). They allow you to check
equality, inequality, and relative ordering (`<`, `>`, `<=`, `>=`). Strict operators (`===`, `!==`) also check type, while loose ones (`==`, `!=`) allow type coercion.

> Note: Comparison involving `NaN` is always `false` (except `Object.is`), and `NaN !== NaN`

### `==` Equality

The `==` operator checks to see if two values are equivalent.

Unlike the _strict equality operator_ (`===`), this operator ignores the type and focuses exclusively on the value.
For example, the number `10` is considered equivalent to the string "10".

{% codeblock %}
{% highlight js linenos %}
// The numbers are different so they're not equal.
console.log(10 == 11); // false

// The numbers are the same, so they're equal!
console.log(10 == 10); // true

// The value matches, regardless of type.
console.log(10 == "10"); // true
{% endhighlight %}
{% endcodeblock %}

### `===` Strict Equality

The `===` operator checks to see if two values are equivalent.

Unlike the _equality operator_ (`==`), this operator checks the type as well as the value.
For example, the number `10` is not considered equivalent to the string "10".

{% codeblock %}
{% highlight js linenos %}
// The numbers are different so they're not equal.
console.log(10 === 11); // false

// The numbers are the same, so they're equal!
console.log(10 === 10); // true

// The values are the same, but the type is different.
console.log(10 === "10"); // false
{% endhighlight %}
{% endcodeblock %}

### `!=` Inequality

The `!=` operator checks to see if two values are not equal (type coercion allowed).

Unlike the _strict inequality operator_ (`!==`), the value's type isn't considered. For example, the number `2` is considered
equivalent to the string "2", so the expression `2 != '2'` returns `false`. This is generally a bad thing, and it's recommended
to use the **strict inequality operator** instead.

{% codeblock %}
{% highlight js linenos %}
// The numbers are different, so they are inequal.
console.log(10 != 11); // true

// The numbers are the same, they are not inequal.
console.log(10 != 10); // false

// Even though the types are different, the values are the same, so they're considered equal.
console.log(10 != "10"); // false
{% endhighlight %}
{% endcodeblock %}

### `!==` Strict Inequality

The `!==` operator checks to see if two values are not equivalent.

Unlike the _inequality operator_ (`!=`), this operator considers the type as well as the value. For example, the number `2`
is not considered equivalent to the string "2".

{% codeblock %}
{% highlight js linenos %}
// The numbers are different, so they are inequal.
console.log(10 !== 11); // true

// The numbers are the same, so they're not inequal.
console.log(10 !== 10); // false

// The values are the same, but the type is different, so they are still considered inequal.
console.log(10 !== "10"); // true
{% endhighlight %}
{% endcodeblock %}

### `>` Greater Than

The `>` operator checks to see if the value on the left is larger than the value on the right.

For numbers, this works as you'd probably expect. For strings, things can be surprising; each character is converted to its
appropriate character code. This means that casing matters, as shown in the examples below.

{% codeblock %}
{% highlight js linenos %}
console.log(10 > 15); // false
console.log(-20 > 15); // false
console.log(0.5 > 1); // false
console.log(1 > 1); // false
console.log('b' > 'a'); // true
console.log('B' > 'a'); // false
{% endhighlight %}
{% endcodeblock %}

### `<` Less Than

The `<` operator checks to see if the value on the left is smaller than the value on the right.

For numbers, this works as you'd probably expect. For strings, things can be surprising; each character is converted to its
appropriate character code. This means that casing matters, as shown in the examples below.

{% codeblock %}
{% highlight js linenos %}
console.log(10 < 15); // true
console.log(-20 < 15); // true
console.log(0.5 < 1); // true
console.log(1 < 1); // false
console.log('b' < 'a'); // false
console.log('B' < 'a'); // true
{% endhighlight %}
{% endcodeblock %}

### `>=` Greater Than or Equal To

The `>=` operator checks to see if the value on the left is larger than, or the same as, the value on the right.

For numbers, this works as you'd probably expect. For strings, things can be surprising; each character is converted to its
appropriate character code. This means that casing matters, as shown in the examples below.

{% codeblock %}
{% highlight js linenos %}
console.log(10 >= 15); // false
console.log(-20 >= 15); // false
console.log(0.5 >= 1); // false
console.log(1 >= 1); // true
console.log('b' >= 'a'); // true
console.log('B' >= 'a'); // false
{% endhighlight %}
{% endcodeblock %}

### `<=` Less Than or Equal To

The `<=` operator checks to see if the value on the left is smaller than, or the same as, the value on the right.

For numbers, this works as you'd probably expect. For strings, things can be surprising; each character is converted to its
appropriate character code. This means that casing matters, as shown in the examples below.

{% codeblock %}
{% highlight js linenos %}
console.log(10 <= 15); // true
console.log(-20 <= 15); // true
console.log(0.5 <= 1); // true
console.log(1 <= 1); // true
console.log('b' <= 'a'); // false
console.log('B' <= 'a'); // true
{% endhighlight %}
{% endcodeblock %}

### `instanceof`

The `instanceof` operator tests whether an object has the prototype property of a given constructor in its prototype chain.
It returns `true` if the left operand is an instance of the right operand, otherwise `false`.

This is useful for type checking, especially when working with custom classes.

{% codeblock %}
{% highlight js linenos %}
class Animal {}
class Dog extends Animal {}

const myDog = new Dog();

console.log(myDog instanceof Dog);     // true  -> myDog's prototype chain includes Dog.prototype
console.log(myDog instanceof Animal);  // true  -> myDog inherits from Animal
console.log(myDog instanceof Object);  // true  -> All objects inherit from Object
console.log(myDog instanceof Array);   // false -> Array not in myDog's prototype chain
{% endhighlight %}
{% endcodeblock %}

## Unary Operators

Unary operators work on a single operand. They include increment/decrement (`++`, `--`), unary plus (`+`) and minus (`-`), logical NOT (`!`), `typeof` (to check type), `delete` (to remove a property), and `void` (to discard a value).

### `++` Increment

The `++` operator is meant to be used on variables that hold numbers. When used, it increases that variable's value by 1.

It can be used as a prefix (`++x`) or postfix (`x++`) operator, affecting when the increment occurs relative to the expression's evaluation.

This is commonly used in conjunction with `while` loops, or anywhere that requires a counter.

It's functionally equivalent to `x = x + 1`;

{% codeblock %}
{% highlight js linenos %}
let x = 5;
console.log(++x); // 6 (x is now 6)

let y = 5;
console.log(y++); // 5 (y is now 6)
{% endhighlight %}
{% endcodeblock %}

### `--` Decrement

The `--` operator is meant to be used on variables that hold numbers. When used, it decreases that variable's value by 1.

Similar to increment, it can be prefix or postfix.

This is commonly used in conjunction with `while` loops, or anywhere that requires a counter.

It's functionally equivalent to `x = x - 1`;

{% codeblock %}
{% highlight js linenos %}
let x = 10;
console.log(--x); // 9 (x is now 9)

let y = 10;
console.log(y--); // 10 (y is now 9)
{% endhighlight %}
{% endcodeblock %}

### `typeof`

The `typeof` operator is used to determine the data type of its operand. It returns a string indicating the type of the evaluated operand.

{% codeblock %}
{% highlight js linenos %}
console.log(typeof "hello"); // "string"
console.log(typeof 123); // "number"
console.log(typeof undefined); // "undefined"
console.log(typeof true); // "boolean"
console.log(typeof Symbol()); // "symbol"
console.log(typeof {}); // "object" (object literal)
console.log(typeof []); // "object" (array)
console.log(typeof function() {}); // "function" (function)
{% endhighlight %}
{% endcodeblock %}

**Purpose and Use Cases:**

This operator is useful for:

- **Type checking**: Verifying the data type of a variable or value, especially when dealing with dynamic or unknown data.
- **Conditional logic**: Performing different actions based on the type of a variable.
- **Debugging**: Identifying unexpected data types during development.

### `delete`

The `delete` operator is used to remove a property from an object or an element from an array.

{% codeblock %}
{% highlight js linenos %}
const person = {
  name: "John Doe",
  age: 30
};

delete person.age; // Removes the 'age' property from the person object.
console.log(person); // Output: { name: "John Doe" }
{% endhighlight %}
{% endcodeblock %}

**Important Considerations:**

- The `delete` operator is designed for object properties and has no effect on variables or functions declared directly in the global
  scope or within a function scope.
- Avoid using `delete` on properties of predefined JavaScript objects (e.g., `Array`, `Boolean`, `Date`, `Function`, `Math`, `Number`, `RegExp`, `String`)
  as this can lead to unexpected behavior or application crashes.
- In performance-critical applications, frequent use of delete can potentially lead to de-optimization by JavaScript engines.
- The `delete` operator can not be used to delete elements from the DOM. This is typically achieved by manipulating the DOM using methods like
  `removeChild()` or using the newer `remove()`.

### `void`

The `void` operator evaluates an expression and returns `undefined`.

The primary function of `void` is to ensure that the result of an expression is `undefined`. This is useful when
you want to execute code but explicitly discard any return value.

{% codeblock %}
{% highlight js linenos %}
let x = 1, y = 2;

console.log(void(x + y)); // undefined
{% endhighlight %}
{% endcodeblock %}

## Special Operators

Special operators provide unique or advanced functionality in JavaScript.

### `? :` Ternary

The `? :` operator is also known as the conditional operator, provides a concise way to write conditional expressions. It is a shorthand for
a simple `if...else` statement and is the only JavaScript operator that takes three operands.

{% codeblock %}
{% highlight js linenos %}
let age = 20;
let canVote = age >= 18 ? "Yes" : "No";

console.log(canVote); // "Yes"
{% endhighlight %}
{% endcodeblock %}

### `,` Comma

The `,` operator evaluates each of its operands from left to right and returns the value of the rightmost operand. It is distinct
from commas used as separators in array literals, object literals, or function parameters/arguments.

{% codeblock %}
{% highlight js linenos %}
let x = (10, 20, 30);

console.log(x) // 30

let a = 1;
let b = (a++, a + 5);

console.log(a) // 2
console.log(b) // 7 (2 + 5)
{% endhighlight %}
{% endcodeblock %}

### `?.` Optional Chaining

The `?.` operator is similar to the _Property Accessor operator_ (`.`); used to access a property of an object with a difference that it's safe to chain;
if at any point, a nullish value (`null` or `undefined`) is encountered, the chain short-circuits and returns `undefined`.

{% codeblock %}
{% highlight js linenos %}
const user = {
  profile: {
    name: "Harshal",
    age: 21
  }
};
console.log(user.address.street); // Uncaught TypeError: Cannot read properties of undefined (reading 'street')
console.log(user?.address?.street); // undefined
console.log(user?.profile?.age); // 21

/* When the property name is stored in a variable: */
const outerKey = "profile";
const relevantKey = "age";

console.log(user?.[outerKey]?.[relevantKey]);
{% endhighlight %}
{% endcodeblock %}

**Compatibility: ES2020+**

### `??` Nullish Coalescing

This relatively-new addition to the language is similar to the Logical OR operator (`||`), except instead of relying on truthy/falsy values,
it relies on "nullish" values (`null` and `undefined`).

{% codeblock %}
{% highlight js linenos %}
console.log(4 ?? 5); // 4, since neither value is nullish
console.log(null ?? 10); // 10, since 'null' is nullish
console.log(undefined ?? 0); // 0, since 'undefined' is nullish

// Here's a case where it differs from Logical OR (||):
console.log(0 ?? 5); // 0
console.log(0 || 5); // 5
{% endhighlight %}
{% endcodeblock %}

**Compatibility: ES2020+, it was introduced in Chrome 80 / Firefox 72 / Safari 13.1. It has no IE support.**

### `...` Rest/Spread

It's technically not an operator, it's special syntax we can use and it serves two mirror purposes:

- **Rest:** This syntax is used in function definitions to collect additional function arguments. It's useful when you don't know how many
parameters a function needs. It collects them into an array.

- **Spread:** This syntax performs the opposite of "rest", and can be used to populate a function from an array. It can also be used to
clone or merge arrays and objects.

{% codeblock %}
{% highlight js linenos %}
/* Rest */
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

console.log(sum(1, 2, 3)); // 6

/* Spread */
const threeNums = [1, 2, 3]; // 6

console.log(sum(...threeNums));

/* Cloning an array */
const data = [1, 2, 3];
const dataCopy = [...data, 4];

console.log(dataCopy); // [1, 2, 3, 4]

/* Merging an object */
const obj = { a: 1, b: 1 };
const newObj = {...obj, b: 2};

console.log(newObj); // { a: 1, b: 2 };
{% endhighlight %}
{% endcodeblock %}

### `.` Property Accessor

The `.` operator is used to pluck out a property from an object. This only works if you know the key of the property.

{% codeblock %}
{% highlight js linenos %}
const person = {
  name: "Harshal",
  address: {
    city: "Mumbai",
    province: "Maharashtra",
    country: "India"
  }
}

console.log(person.name); // "Harshal"
console.log(person.address.city); // "Mumbai"
{% endhighlight %}
{% endcodeblock %}

If the property name is held in a variable, you'll need to use bracket notation instead:

{% codeblock %}
{% highlight js linenos %}
const relevantKey = "city";

console.log(person.address.relevantKey); // undefined
console.log(person.address[relevantKey]); // "Mumbai"
{% endhighlight %}
{% endcodeblock %}

### `|>` Pipeline

It functions as a sort of "inverted" function call; instead of calling a function with an argument, you "pipe" an argument into a function.

It reads left-to-right like a chain of transformations (similar to Unix pipes or functional languages).

{% codeblock %}
{% highlight js linenos %}
/* Traditional function call */
function multiply(x) {
  return x * 2;
}
let result = multiply(5);

console.log(result); // 10

/* Proposed piped alternative */
let result = 5 |> (x => x * 2);

console.log(result); // 10
{% endhighlight %}
{% endcodeblock %}

**Compatibility: The pipeline operator is a TC39 stage-2 proposal, not standard yet.**

### `=>` Arrow

The `=>` operator provides a concise syntax for writing function expressions.

**Concise Syntax:** Arrow functions offer a shorter way to define functions, particularly for simple, single-line functions or callbacks.

{% codeblock %}
{% highlight js linenos %}
/* Traditional function */
function add(a, b) {
  return a + b;
}

/* Using arrow operator */
const add = (a, b) => a + b;
{% endhighlight %}
{% endcodeblock %}

**Implicit Return:** For single-expression arrow functions, the `return` keyword and curly braces `{}` can be omitted, and the
expression's result is implicitly returned.

{% codeblock %}
{% highlight js linenos %}
const multiply = (x, y) => x * y;

// Arrow functions are convenient when used as callbacks for array methods:
const nums = [-2, -1, 0, 1, 2];
const positiveNums = nums.filter(num => num >= 0);

console.log(positiveNums); // [0, 1, 2]
{% endhighlight %}
{% endcodeblock %}

> Note: Arrow functions are somewhat limited: they don't have their own context (so `this` cannot be used), nor can they be used as constructors.

### `in` Existance

The `in` operator checks if a property exists in an object (including properties up the prototype chain).

{% codeblock %}
{% highlight js linenos %}
let car = { brand: "Tesla", year: 2024 };

console.log("brand" in car); // true
console.log("color" in car); // false

// Also checks prototype chain
console.log("toString" in car); // true (inherited from Object.prototype)
{% endhighlight %}
{% endcodeblock %}

**Compatibility: Supported in all modern and legacy JavaScript engines.**

### `()` Grouping

Parentheses are used to control **precedence** in expressions. By default, multiplication/division have higher precedence than
addition/subtraction, but grouping lets you override the order of evaluation.

{% codeblock %}
{% highlight js linenos %}
let num1 = 5 + 3 * 2; // 11 (multiplication first)
let num2 = (5 + 3) * 2; // 16 (addition grouped first)

console.log(num1, num2); // 11 16
{% endhighlight %}
{% endcodeblock %}

### `new`

The `new` operator creates an instance of an object from a constructor function or class. It sets up the prototype chain and initializes the object.

{% codeblock %}
{% highlight js linenos %}
/* Constructor function */
function User(name) {
  this.name = name;
}
let u = new User("Harshal");
console.log(u.name); // "Harshal"

/* ES6 Class */
class Car {
  constructor(brand) {
    this.brand = brand;
  }
}
let c = new Car("Tesla");
console.log(c.brand); // "Tesla"
{% endhighlight %}
{% endcodeblock %}

**Compatibility: Supported since ES1. Works with constructor functions and ES6+ class syntax.**

### `yield` and `yield*` Generators

The `yield` keyword is used inside **generator functions** (declared with `function*`) to pause execution and return a value.
Execution can later be resumed with `.next()`.
The `yield*` keyword delegates control to another generator or iterable.

{% codeblock %}
{% highlight js linenos %}
function* gen() {
  yield 1;
  yield 2;
  yield* [3, 4]; // Delegates to array iterator
  yield 5;
}

for (let v of gen()) {
  console.log(v);
}
// 1, 2, 3, 4, 5

// Manual iteration
let g = gen();
console.log(g.next().value); // 1
console.log(g.next().value); // 2
{% endhighlight %}
{% endcodeblock %}

**Compatibility: Generators (`function*`, `yield`, `yield*`) were introduced in ES2015 (ES6). Supported in all modern browsers and Node.js (not available in IE).**

## Quick Tips & Best Practices

1. **Equality** — Prefer `===` and `!==` over `==` and `!=` to avoid unexpected type coercion.
2. **Default values** — Use `??` when you only want to handle `null` or `undefined`. Use `||` if you also want to treat `0`, `""`, or `false` as fallbacks.
3. **Optional chaining** — Use `?.` when accessing deeply nested properties to prevent `TypeError`.
4. **Booleans** — `!!value` is a concise way to convert any value to a strict boolean (`true` or `false`).
5. **Numbers** — Prefer `Number()` or `parseInt` over the unary `+` for readability and clarity.
6. **Bitwise operators** — Be cautious: they coerce values to **32-bit signed integers** and can behave unexpectedly, especially with negatives.
7. **Logical assignment** — Use `&&=`, `||=`, and `??=` for concise conditional assignments without repeating variables.
8. **Precedence** — Know operator precedence, or use parentheses `( )` to make expressions explicit and more readable.

## Conclusion

JavaScript operators are the building blocks of logic and computation. They let you transform, compare, and assign values in concise ways—from basic arithmetic and comparisons to modern features like optional chaining, nullish coalescing, and logical assignment.

Mastering operators improves both clarity and efficiency, while helping you avoid pitfalls such as type coercion, operator precedence confusion, and surprising bitwise behavior. With new operators (like pipeline) being added to the language, staying up to date ensures your code remains both modern and readable.

When in doubt, favor explicitness and readability over clever tricks—operators are most powerful when they make your intent crystal clear.
