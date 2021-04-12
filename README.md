# ESLint bug repro for `CodePath`s and instance fields

This repository contains a minimal example that demonstrates
unexpected behavior of ESLint control flow analysis in the
presence of classes with instance fields.

## Example 01

This code snippet:

```
  var marker_01 = '';
  class C {
    p = (marker_02 = '') ? (marker_03 = '') : (marker_04 = '');
    constructor() {
      marker_05 = '';
    }
  }
  var marker_07 = '';
```

produces the following events when analyzed with ESLint 7.24.0 (indentation depends on nodes):

```
PATH_START s1
SEGMENT_START s1_1                         // <-- s1_1 start at top-level
NODE_START Program 
 NODE_START VariableDeclaration 
  NODE_START VariableDeclarator 
   NODE_START Identifier marker_01
   NODE_END   Identifier marker_01
   NODE_START Literal 
   NODE_END   Literal 
  NODE_END   VariableDeclarator 
 NODE_END   VariableDeclaration 
 NODE_START ClassDeclaration               // <-- Start of class declaration
  NODE_START Identifier C
  NODE_END   Identifier C
  NODE_START ClassBody                     // <-- Start of class body
   NODE_START ClassProperty                // <-- Start of instance property
    NODE_START Identifier p
    NODE_END   Identifier p
    NODE_START ConditionalExpression 
     NODE_START AssignmentExpression 
      NODE_START Identifier marker_02
      NODE_END   Identifier marker_02
      NODE_START Literal 
      NODE_END   Literal 
     NODE_END   AssignmentExpression 
     SEGMENT_END   s1_1                    // <-- s1_1 ends here
     SEGMENT_START s1_2
     NODE_START AssignmentExpression 
      NODE_START Identifier marker_03
      NODE_END   Identifier marker_03
      NODE_START Literal 
      NODE_END   Literal 
     NODE_END   AssignmentExpression 
     SEGMENT_END   s1_2
     SEGMENT_START s1_3
     NODE_START AssignmentExpression 
      NODE_START Identifier marker_04
      NODE_END   Identifier marker_04
      NODE_START Literal 
      NODE_END   Literal 
     NODE_END   AssignmentExpression 
     SEGMENT_END   s1_3
     SEGMENT_START s1_4
    NODE_END   ConditionalExpression 
   NODE_END   ClassProperty 
   NODE_START MethodDefinition 
    NODE_START Identifier constructor
    NODE_END   Identifier constructor
    PATH_START s2
    SEGMENT_START s2_1
    NODE_START FunctionExpression 
     NODE_START BlockStatement 
      NODE_START ExpressionStatement 
       NODE_START AssignmentExpression 
        NODE_START Identifier marker_05
        NODE_END   Identifier marker_05
        NODE_START Literal 
        NODE_END   Literal 
       NODE_END   AssignmentExpression 
      NODE_END   ExpressionStatement 
     NODE_END   BlockStatement 
    NODE_END   FunctionExpression 
    SEGMENT_END   s2_1
    PATH_END   s2
   NODE_END   MethodDefinition 
  NODE_END   ClassBody 
 NODE_END   ClassDeclaration 
 NODE_START VariableDeclaration 
  NODE_START VariableDeclarator 
   NODE_START Identifier marker_07
   NODE_END   Identifier marker_07
   NODE_START Literal 
   NODE_END   Literal 
  NODE_END   VariableDeclarator 
 NODE_END   VariableDeclaration 
NODE_END   Program 
SEGMENT_END   s1_4
PATH_END   s1
```
It demonstrates that the code path segment `s1_1` starts at the top level, right
at the beginning of the program, but then unexpectedly ends in the middle of a
class instance property initializer.

## Example 02

A similar example with `extends` and `super`:

```
  var marker_01 = '';
  class A {}
  class B extends A {
    p = (marker_02 = '') ? (marker_03 = '') : (marker_04 = '');
    constructor() {
      marker_05 = '';
      super();
      marker_06 = '';
    }
  }
  var marker_07 = '';

```

produces the following events:

```
PATH_START s1
SEGMENT_START s1_1                               // start segment s1_1
NODE_START Program 
 NODE_START VariableDeclaration 
  NODE_START VariableDeclarator 
   NODE_START Identifier marker_01
   NODE_END   Identifier marker_01
   NODE_START Literal 
   NODE_END   Literal 
  NODE_END   VariableDeclarator 
 NODE_END   VariableDeclaration 
 NODE_START ClassDeclaration 
  NODE_START Identifier A
  NODE_END   Identifier A
  NODE_START ClassBody 
  NODE_END   ClassBody 
 NODE_END   ClassDeclaration 
 NODE_START ClassDeclaration 
  NODE_START Identifier B
  NODE_END   Identifier B
  NODE_START ClassBody                          // start body of class B
   NODE_START ClassProperty 
    NODE_START Identifier p
    NODE_END   Identifier p
    NODE_START ConditionalExpression 
     NODE_START AssignmentExpression 
      NODE_START Identifier marker_02
      NODE_END   Identifier marker_02
      NODE_START Literal 
      NODE_END   Literal 
     NODE_END   AssignmentExpression 
     SEGMENT_END   s1_1                        // unexpected end of s1_1
     SEGMENT_START s1_2
     NODE_START AssignmentExpression 
      NODE_START Identifier marker_03
      NODE_END   Identifier marker_03
      NODE_START Literal 
      NODE_END   Literal 
     NODE_END   AssignmentExpression 
     SEGMENT_END   s1_2
     SEGMENT_START s1_3
     NODE_START AssignmentExpression 
      NODE_START Identifier marker_04
      NODE_END   Identifier marker_04
      NODE_START Literal 
      NODE_END   Literal 
     NODE_END   AssignmentExpression 
     SEGMENT_END   s1_3
     SEGMENT_START s1_4
    NODE_END   ConditionalExpression 
   NODE_END   ClassProperty 
   NODE_START MethodDefinition 
    NODE_START Identifier constructor
    NODE_END   Identifier constructor
    PATH_START s2                             // start of constructor segment
    SEGMENT_START s2_1
    NODE_START FunctionExpression 
     NODE_START BlockStatement 
      NODE_START ExpressionStatement 
       NODE_START AssignmentExpression 
        NODE_START Identifier marker_05
        NODE_END   Identifier marker_05
        NODE_START Literal 
        NODE_END   Literal 
       NODE_END   AssignmentExpression 
      NODE_END   ExpressionStatement 
      NODE_START ExpressionStatement 
       NODE_START CallExpression 
        NODE_START Super                     // super call
        NODE_END   Super 
       NODE_END   CallExpression 
      NODE_END   ExpressionStatement 
      NODE_START ExpressionStatement         // expected position of instance field initializers
       NODE_START AssignmentExpression 
        NODE_START Identifier marker_06
        NODE_END   Identifier marker_06
        NODE_START Literal 
        NODE_END   Literal 
       NODE_END   AssignmentExpression 
      NODE_END   ExpressionStatement 
     NODE_END   BlockStatement 
    NODE_END   FunctionExpression 
    SEGMENT_END   s2_1
    PATH_END   s2
   NODE_END   MethodDefinition 
  NODE_END   ClassBody 
  NODE_START Identifier A
  NODE_END   Identifier A
 NODE_END   ClassDeclaration 
 NODE_START VariableDeclaration 
  NODE_START VariableDeclarator 
   NODE_START Identifier marker_07
   NODE_END   Identifier marker_07
   NODE_START Literal 
   NODE_END   Literal 
  NODE_END   VariableDeclarator 
 NODE_END   VariableDeclaration 
NODE_END   Program 
SEGMENT_END   s1_4
PATH_END   s1
```

Here also, the initializer stops the unrelated segment `s1_1`
instead of being processed inside of the constructor after the `super` invocation.

