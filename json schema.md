# 前言

JSON Schema是一个基于JSON格式的规范，用于定义JSON数据的结构。
有如下几点好处:

- 描述现有的数据格式。
- 清晰的、人类和机器可读的文档。
- 完整的结构验证，对于自动测试和验证客户端提交的数据非常有用。

`type`关键字是JSON模式的基础。它指定模式的数据类型。

## JSON Schema 基本类型

### `string`

> 该string类型用于文本字符串。它可能包含 Unicode 字符。

1. 可以使用`minLength`和 `maxLength`关键字来限制字符串的长度,这两个关键字，该值必须是非负数。
2. 可使用`pattern`关键字用于将字符串限制为特定的正则表达式。
3. 可使用`format`关键字允许对常用的某些类型的字符串值进行基本语义验证。(常用的有：时间、邮件、主机名、ip等)

ex:

```js
# 字符串长度大于6小于12
{
    "type":"string",
    "minLength": 6,
    "maxLength": 12
}
```

```js
# 字符串符合以下正则
{
    "type":"string",
    "pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
}
```

### `number` & `integer`

> JSON Schema 中有两种数字类型：integer和number。它们共享相同的验证关键字。
> 该 number类型用于任何数字类型，整数或浮点数。
> 该integer类型用于整数。JSON 没有针对整数和浮点值的不同类型。因此，有无小数点并不足以区分整数和非整数。例如，1和1.0是在 JSON 中表示相同值的两种方式。无论使用哪种表示形式，JSON 模式都将该值视为整数。

1. 可以使用`multipleOf`关键字将数字限制为给定数字的倍数 。它可以设置为任何正数。
2. 使用`minimum`和`maximum`关键字的组合指定数字范围(或使用`exclusiveMinimum`和 `exclusiveMaximum`排除本身)  

ex:

```js
# 数字类型大于等于0小于100
{
  "type": "number",
  "minimum": 0,
  "exclusiveMaximum": 100
}
```

```js
# 数字要求是10的倍数
{
    "type": "number",
    "multipleOf" : 10
}
```

#### `object`

> 对象 objext 是 JSON 中的映射类型。他们将“键”映射到“值”。在 JSON 中，“键”必须始终是字符串。

1. 对象的属性（键值对）是使用`properties`关键字定义的 。的值properties是一个对象，其中每个键是属性的名称，每个值是用于验证该属性的模式。
2. 有时您想给定一种特定类型的属性名称，该值应该与特定模式相匹配。这就需要使用`patternProperties`的地方.
3. 有时需要控制有哪些属性，会使用到`additionalProperties` 设置为`false`意味着不允许其他属性(默认情况下，允许任何其他属性),也可以其他属性的值是是什么类型
4. 使用`required` 关键字提供所需属性的列表
5. 可以使用`minProperties`和`maxProperties`关键字来限制对象上的属性数量 。这些中的每一个都必须是非负整数.

ex:

```js
# 常见定义
{
  "type": "object",
  "properties": {
    "number": { "type": "number" },
    "street_name": { "type": "string" },
    "street_type": { "enum": ["Street", "Avenue", "Boulevard"] }
  }
}
```

```js
# 以特定属性开头
{
  "type": "object",
  "patternProperties": {
    "^S_": { "type": "string" },
    "^I_": { "type": "integer" }
  }
}
```

```js
# 不允许有额外属性
{
  "type": "object",
  "properties": {
    "number": { "type": "number" },
    "street_name": { "type": "string" },
    "street_type": { "enum": ["Street", "Avenue", "Boulevard"] }
  },
  "additionalProperties": false
}
```

```js
# 允许有额外属性，但是它们必须是一个字符串
{
  "type": "object",
  "properties": {
    "number": { "type": "number" },
    "street_name": { "type": "string" },
    "street_type": { "enum": ["Street", "Avenue", "Boulevard"] }
  },
  "additionalProperties": { "type": "string" }
}
```

```js
# 必须包含指定的属性
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string" },
    "address": { "type": "string" },
    "telephone": { "type": "string" }
  },
  "required": ["name", "email"]
}
```

```js
# 指定属性最少2个，最多3个
{
  "type": "object",
  "minProperties": 2,
  "maxProperties": 3
}
```

#### `array`

> 在 JSON 中，数组中的每个元素可能是不同的类型。

1. 如果元素都是相同类型，可以使用关键字`items`来验证
2. 如果元素不同类型，则需要定义每个不同的模式那么`itmes`是一个数组
3. 同样有需要禁止数组中出现其他元素可以使用`additionalItems` 设置 `false`
4. `itmes`是要求数组的每一项都必须遵守，而`contains`要求数组的元素，有一个类型符合就可以。
5. 可以使用`minItems`和 `maxItems`关键字指定数组的长度。每个关键字的值必须是非负数。
6. 要求数组中的每个项目都是唯一的。只需将`uniqueItems`关键字设置为`true`.

ex:

```js
# 要求数组每一项都必须是数字
{
  "type": "array",
  "items": {
    "type": "number"
  }
}
```

```js
# 只能是这四个元素
{
  "type": "array",
  "items": [
    { "type": "number" },
    { "type": "string" },
    { "enum": ["Street", "Avenue", "Boulevard"] },
    { "enum": ["NW", "NE", "SW", "SE"] }
  ],
  "additionalItems": false
}
```

```js
# 可以是额外的属性但必须是字符串
{
  "type": "array",
  "items": [
    { "type": "number" },
    { "type": "string" },
    { "enum": ["Street", "Avenue", "Boulevard"] },
    { "enum": ["NW", "NE", "SW", "SE"] }
  ],
  "additionalItems": { "type": "string" }
}
```

```js
# 满足一个是数字就可以了。
{
   "type": "array",
   "contains": {
     "type": "number"
   }
}
```

```js
# 数组长度必须是2-3
{
  "type": "array",
  "minItems": 2,
  "maxItems": 3
}
```

```js
# 每个元素都是唯一的
{
  "type": "array",
  "uniqueItems": true
}
```

#### `boolean`

> boolean 类型只匹配两个特殊值：true和 false。

ex:

```js
{ "type": "boolean" }
```

#### `null`

> 当type时`null`，它只有一个可接受的值：`null`

ex:

```js
{ "type": "null" }
```

### 其他属性值

1. 该`enum`关键字用于将值限制为一组固定的值。它必须是一个至少包含一个元素的数组，其中每个元素都是唯一的. `"enum": ["red", "amber", "green"]`
2. 该`dependencies`关键字基于某些属性的存在有条件地将附加约束应用于模式。我们使用dependencies关键字表示一个属性对另一个属性的这种依赖性.
3. `const`关键字被用于限制值，以一个单一的值。
4. 用于描述模式的一部分,如`title`和`description`关键字必须是字符串。“标题”最好是简短的，而“描述”将提供关于模式描述的数据目的的更冗长的解释。
5. 最新有出现`if`，`then`和`else`关键字.如果if有效，then也必须有效（并被else忽略）。如果 if无效，else也必须有效（并被then忽略）。

```js
# 提供了credit_card 就必须提供 billing_address 注：依赖是单向的
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "number" },
    "billing_address": { "type": "string" }
  },
  "required": ["name"],
  "dependencies": {
    "credit_card": ["billing_address"]
  }
}
  ```

### 组合关键字

> 以使用这些关键字来表达无法用标准 JSON Schema 关键字表达的复杂约束。

用于组合模式的关键字是：

- allOf : (AND) 必须对所有子模式有效.

- anyOf : (OR) 必须对任何子模式有效.

- oneOf : (XOR) 必须对恰好一个子模式有效.

所有这些关键字都必须设置为一个数组，其中每个项目都是一个模式。

参考文档：<https://json-schema.org/understanding-json-schema/index.html>
