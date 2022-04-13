### 安装TypeScript
1. 有两种主要的方式来获取TypeScript工具：
- 通过npm（Node.js包管理器）
- 安装Visual Studio的TypeScript插件
针对使用npm的用户：
`npm install -g typescript`

2. 编译代码
在命令行上，运行TypeScript编译器：
`tsc xxx.ts`
输出结果为一个xxx.js文件，它包含了和输入文件中相同的JavsScript代码


### 基础类型
TypeScript支持与JavaScript几乎相同的数据类型，数字，字符串，结构体，布尔值等 

#### 布尔值 
> 最基本的数据类型就是简单的true/false值，在JavaScript和TypeScript里叫做boolean 
`let isDone: boolean = true`

#### 数字
> 和JavaScript一样，TypeScript里的所有数字都是浮点数。 这些浮点数的类型是 number。 
`let decLiteral: number = 6`

#### 字符串
> JavaScript程序的另一项基本操作是处理网页或服务器端的文本数据。 像其它语言里一样，我们使用 string表示文本数据类型。 和JavaScript一样，可以使用双引号（ "）或单引号（'）表示字符串。你还可以使用模版字符串，它可以定义多行文本和内嵌表达式。 这种字符串是被反引号包围（ `），并且以${ expr }这种形式嵌入表达式.
`let name: string = "bob"`
`Hello my name is ${name}`

#### 数组
> 有两种方式可以定义数组。 第一种，可以在元素类型后面接上 []，第二种方式是使用数组泛型，Array<元素类型> 
`let list: number[] = [1, 2, 3]`
`let list: Array<number> = [1, 2, 3]`

#### 元组
> 元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。 
`let x: [number,string] = [1,'abc']`

#### 枚举
> enum类型是对JavaScript标准数据类型的一个补充  
`enum Color {Red, Green, Blue}`
`let c: Color = Color.Red`
默认情况下，从0开始为元素编号。 你也可以手动的指定成员的数值。
`enum Color {Red=1, Green, Blue}`

#### Any
> 有时候，我们会想要为那些在编程阶段还不清楚类型的变量指定一个类型。我们可以使用 any类型来标记. 
`let noteSure: any = 4`
`let list: any[] = [1, true, 'abc']`

#### Void
> void类型像是与any类型相反，它表示没有任何类型。 当一个函数没有返回值时，你通常会见到其返回值类型是 void 
```
function warnUser(): void {
    console.log("This is my warning message");
}
```
声明一个void类型的变量没有什么大用，因为你只能为它赋予undefined和null
`let unusable: void = undefined;`

#### Null 和 Undefined
> TypeScript里，undefined和null两者各自有自己的类型分别叫做undefined和null。 和 void相似，它们的本身的类型用处不是很大.
`let u: null = null`
`let u: undefined = undefined`
默认情况下null和undefined是所有类型的子类型。 就是说你可以把 null和undefined赋值给number类型的变量。当你指定了--strictNullChecks标记，null和undefined只能赋值给void和它们各自。 这能避免 很多常见的问题。

#### Never
> never类型表示的是那些永不存在的值的类型。 例如， never类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型； 变量也可能是 never类型，当它们被永不为真的类型保护所约束时。
never类型是任何类型的子类型，也可以赋值给任何类型；然而，没有类型是never的子类型或可以赋值给never类型（除了never本身之外）。 即使 any也不可以赋值给never。
```
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
    throw new Error(message);
}

// 推断的返回值类型为never
function fail() {
    return error("Something failed");
}

// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
    while (true) {
    }
}
```

#### Object
> object表示非原始类型，也就是除number，string，boolean，symbol，null或undefined之外的类型。
```
declare function create(o: object | null): void;

create({ prop: 0 }); // OK
create(null); // OK

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error

```

#### 类型判断
> 通常这会发生在你清楚地知道一个实体具有比它现有类型更确切的类型。 通过类型断言这种方式可以告诉编译器，“相信我，我知道自己在干什么”。

```
// 类型断言有两种形式。 其一是“尖括号”语法：
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;
// 另一个为as语法：
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;
```
注： 至于使用哪个大多数情况下是凭个人喜好；然而，当你在TypeScript里使用JSX时，只有 as语法断言是被允许的。