# IDBUtils
对IndexedDB进行封装
# 使用方法

```ts
import { IDBUtils } from '../IDBUtils';
const db = new IDBUtils("myDB", 1);
db.createObjectStore("myStore", { keyPath: "id", autoIncrement: true });
db.put("myStore", { name: "John" });
```

# API

## 连接数据库

`constructor(dbName,version,onupgradeneeded) `

参数二三可选。（当想要改变对象仓库的配置，比如新建，删除，更改配置项，version务必比已有的版本更高）

## 创建对象仓库

`createObjectStore(storeName,keyConfig,indexConfig)`

创建一个对象仓库，参数二是主键的配置项，参数三是可以附带的索引项。参数二三可选

## 新增数据

`put(storeName, data) `

新增一个数据，如果该数据已存在则更新该数据（是否已存在的依据是，主键值是否与已有的数据重复）

`getAll(storeName)`

获取此对象仓库的所有数据

`cursor(storeName, fn)`

对此仓库的每个数据进行执行fn(value)，

`getByIndex(storeName, indexName, indexValue)`

根据索引的值来获取对象（只获取第一个）

## 删除数据

`delete(storeName, key)`

根据主键的值来删除数据

## 删除对象仓库

`deleteObjectStore(storeName)`

删除一个对象仓库

## 关闭与数据库的连接

`closeDB()`

如果要使用这个方法，最好是在promise的回调中执行

## 删除数据库

`deleteDB(dbName)`这是一个静态方法，

直接`IDBUtils.deleteDB("myDB")`,但是请先关闭与数据库的连接
