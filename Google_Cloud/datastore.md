### Datastore
> Datastore 是一个 NoSQL 文档数据库，能够自动扩缩、具备出色的性能，并且易于进行应用开发。
Datastore 特性包括:
- 原子化事务
- 读取和写入的高可用性
- 高性能的大规模可扩缩性
- 灵活的数据存储和查询
- 在高度一致性与最终一致性之间取得平衡
- 静态加密
- 完全托管，无计划内停机时间

### 实体/属性/键
在 Datastore 模式 Firestore 中的数据对象称为实体。实体具有一个或多个命名的属性，且每个属性可具有一个或多个值。
Datastore 模式支持多种属性值数据类型，其中包括：整数、浮点数、字符串、日期、二进制数据
Datastore 模式的数据库中的每个实体都有一个明确标识它的键。键由以下部分组成：
- 实体的命名空间
- 实体所属的种类
- 具体实体的标识符

### 处理实体
> 应用可以使用 Datastore 模式 Firestore API 来创建、检索、更新和删除实体
#### 可使用 upsert 或 insert 将实体保存到数据库
> 前者将覆盖 Datastore 模式中已经存在的实体，后者要求实体键尚不存在。
```
# 使用 upsert 插入实体的方式如下
const taskKey = datastore.key('Task');
const task = {
  category: 'Personal',
  done: false,
  priority: 4,
  description: 'Learn Cloud Datastore',
};

const entity = {
  key: taskKey,
  data: task,
};

await datastore.upsert(entity);
// Task inserted successfully.

```
```
# 使用 insert 插入实体的方式如下
const taskKey = datastore.key('Task');
const task = {
  category: 'Personal',
  done: false,
  priority: 4,
  description: 'Learn Cloud Datastore',
};

const entity = {
  key: taskKey,
  data: task,
};

datastore.insert(entity).then(() => {
  // Task inserted successfully.
});
```
#### 检索实体
```
const taskKey = datastore.key('Task');
const [entity] = await datastore.get(taskKey);
// entity = {
//   category: 'Personal',
//   done: false,
//   priority: 4,
//   description: 'Learn Cloud Datastore',
//   [Symbol(KEY)]:
//    Key {
//      namespace: undefined,
//      id: '...',
//      kind: 'Task',
//      path: [Getter]
//    }
//   }
// };
console.log(entity);
```
#### 更新实体
```
const taskKey = datastore.key('Task');
const task = {
  category: 'Personal',
  done: false,
  priority: 4,
  description: 'Learn Cloud Datastore',
};

const entity = {
  key: taskKey,
  data: task,
};

await datastore.update(entity);
// Task updated successfully.
```
#### 删除实体
```
const taskKey = datastore.key('Task');
await datastore.delete(taskKey);
// Task deleted successfully.
```
#### 批量操作
```
// 使用 upsert 插入/更新多个实体
const taskKey1 = this.datastore.key(['Task', 1]);
const taskKey2 = this.datastore.key(['Task', 2]);

const task1 = {
  category: 'Personal',
  done: false,
  priority: 4,
  description: 'Learn Cloud Datastore',
};

const task2 = {
  category: 'Work',
  done: false,
  priority: 8,
  description: 'Integrate Cloud Datastore',
};

const entities = [
  {
    key: taskKey1,
    data: task1,
  },
  {
    key: taskKey2,
    data: task2,
  },
];

await datastore.upsert(entities);
// Tasks inserted successfully.

// 查询多个实体
const taskKey1 = this.datastore.key(['Task', 1]);
const taskKey2 = this.datastore.key(['Task', 2]);

const keys = [taskKey1, taskKey2];

const [tasks] = await datastore.get(keys);
// Tasks retrieved successfully.
console.log(tasks);

// 删除多个实体
const taskKey1 = this.datastore.key(['Task', 1]);
const taskKey2 = this.datastore.key(['Task', 2]);

const keys = [taskKey1, taskKey2];

await datastore.delete(keys);
// Tasks deleted successfully.

```
### 种类和标识符
> 每个实体都属于某个种类，种类用于对实体进行分类以执行查询;除了种类，每个实体还在创建时分配了标识符。标识符是实体键的一部分，因此与实体永久关联且不可更改。