### 什么是Athena?
Amazon Athena 是一种交互式查询服务，让您能够轻松使用标准SQL.有了一些操作，在AWS Management Console，您可以将 Athena 指向 Amazon S3 中存储的数据，并开始使用标准 SQL 运行临时查询，然后在几秒钟内获得结果。
Athena 没有服务器，因此您无需设置或管理任何基础设施, Athena 可自动扩展（并行运行查询），因此，即使在数据集很大、查询很复杂的情况下也能很快获得结果。
使用：
- Athena 可帮助您分析 Amazon S3 中存储的非结构化、半结构化和结构化数据。您可以使用 ANSI SQL 通过 Athena 运行临时查询，而无需将数据聚合或加载到 Athena 中。
- Athena 与 Amazon QuickSight 集成，轻松实现数据可视化。
- Athena 与AWS Glue Data Catalog，它为 Amazon S3 中的数据提供了持久元数据存储。
### 基本概念
在 Athena 中，表和数据库是为底层源数据定义架构的元数据定义的容器。
1. 创建数据库
CREATE DATABASE `myDataBase`
2. 创建表

注：
1. Athena 中的表名称和表列名称必须为小写，不支持特殊字符，下划线 (_) 除外。
2. 创建表时，可以使用反引号将以下划线开头的表、视图或列名称括起来。
3. 运行时SELECT、CTAS，或者VIEW查询，用引号将以数字开头的表、视图或列名称等标识符括起来
4. 必须对 Athena 中的某些预留字进行转义。要对 DDL 语句中的保留关键字进行转义，请使用反引号 (`) 将其括起来。要对 SQL SELECT 语句以及视图的查询中的保留关键字进行转义，请使用双引号 ('') 将其括起来。

