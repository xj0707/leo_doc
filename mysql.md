# mysql

数据的所有存储、检索、管理和处理实际上是由数据库软件-DBMS(数据库管理系统)完成的。mysql是一种DBMS，即它是一种数据库软件。
选择数据库使用：USE
显示数据库/表/列/用户等信息用：SHOW

SELECT CONCAT(firstName,'-',lastName) as name FROM AIOV_V1_DRIVER;

mysql 日期存入遵循 yyyy-mm-dd

HAVING 过滤分组

SELECT accountid,COUNT(*) FROM AIOV_V1_DRIVER GROUP BY accountid WITH ROLLUP; // 注意 加WITH ROLLUP 和不加的区别
SELECT accountid,COUNT(*) FROM AIOV_V1_DRIVER GROUP BY accountid HAVING count(*) >10;

查询所有用户的订单数量
SELECT cus_name,(select count(*) from orders where orders.id=customers.id) as order_count where customers order by cus_name;

要使用全文本搜索功能 ，引擎要选用MYISAM
如：CREATE TABLE prouctnotes(
    note_id int not null auto_increment,
    prod_id char(10) not null,
    note_date datetime not null,
    note_text text null,
    PRIMARY KEY(note_id),
    FULLTEXT(note_text)
) ENGINE=MyISAM;
使用函数Match()和Against()执行全文本搜索
如： SELECT note_id,note_text FROM prouctnotes WHERE Match(note_text) Against('abdccc');

update 更新多条语句，如果其中某行出错，也希望继续更新，则可以加IGNORE
如： UPDATE IGNORE xxx

创建存储过程
DELIMITER //
CREATE PROCEDURE productpricing()
BEGIN
    SELECT AVG(prod_price) AS price_avg
    FROM products;
END //
DELIMITER ;
使用存储过程
CALL productpricing();
删除存储过程
DROP PROCEDURE productpricing; // 注意这里没有()

// 创建带参数的存储过程

CREATE PROCEDURE productpricing(
    OUT p1 DECIMAL(8,2),      // OUT 存储过程中需要传出的值
    OUT p2 DECIMAL(8,2),
    OUT p3 DECIMAL(8,2),
)
BEGIN
    SELECT Min(prod_price) INTO p1 FROM products;  // INTO关键字 保存结果到相应的变量中
    SELECT Max(prod_price) INTO p2 FROM products;
    SELECT Avg(prod_price) INTO p3 FROM products;
END

调用 CALL productpricing(@p1,@p2,@p3);  // mysql变量以@开始
select @p1,@p2,@p3;  // 拿到结果

// 创建带入参数的存储过程
CREATE PROCEDURE ordertotal(
    IN num_id INT,      // IN 存储过程中需要传入的值
    OUT total DECIMAL(8,2),
)
BEGIN
    SELECT Sum(prod_price*quantity) FROM order WHERE order_id=num_id INTO total;  // INTO关键字 保存结果到相应的变量中
END

调用： CALL ordertotal(100,@total);
select @total;

下面是一个更复杂的存储过程 (-- 是注释的意思)
-- Name: ordertotal
-- Parameters:  onnumber= order number
--              taxable= 0 if not taxable, 1 if taxable
--              ototal= order total variable
CREATE PROCEDURE ordertotal(
    IN onnumber INT,
    IN taxable BOOLEAN,
    OUT ototal DECIMAL(8,2)
) COMMENT 'order total'
BEGIN
    -- DECLARE 定义局部变量
    DECLARE total DECIMAL(8,2)
    DECLARE taxrate INT DEFAULT 6
    SELECT Sum(item_price*quantity)
    FROM orderitems
    WHERE order_num=onumber
    INTO total;
    IF taxable THEN
    SELECT total+(total/100*taxrate) INTO total
    END IF;
    SELECT total INTO ototal;
END;
调用 CALL ordertotal(1000,0,@total);
输出 SELECT @total;

MYSQL游标 只能用于 存储过程 和 函数。
示例:
CREATE PROCEDURE processorders()
BEGIN
    -- DECLARE 定义局部变量
    DECLARE done BOOLEAN DEFAULT 0
    DECLARE o INT
    DECLARE t DECIMAL(8,2)
    -- 定义游标
    DECLARE ordernumbers CURSOR FOR
    SELECT order_num FROM orders;
    -- 定义继续的条件
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done=1;
    -- 创建表存储结构
    CREATE TABLE IF NOT EXISTS ordertotals(
        order_num INT,
        toatl DECIMAL(8,2)
    )
    -- 打开游标
    OPEN ordernumbers
    -- 循环每一行
    REPEAT
        FETCH ordernubers INTO 0;
        CALL ordertotal(o,1,t);    // 这是是上一个示例的存储过程
        INSERT INTO ordertotals(order_num,total) VALUES(o,t);
    -- 结束循环条件
    UNTIL done END REPEAT;
    -- 关闭游标
    CLOSE ordernumbers;
END;
调用 CALL processorders();
输出 SELECT * FROM ordertotals;

触发器
CREATE TRIGGER XXXX AFTER INSERT ON XXXX FOR EACH ROW SLECET 'added';
删除触发器
DROP TRIGGER XXXX
注： INSETRT触发器内可以引用一个NEW的虚拟表，访问被插入的行,DELETE触发器可以访问OLD的虚拟表
CREATE TRIGGER XXXX AFTER INSERT ON XXXX FOR EACH ROW SLECET NEW.order_num;

管理用户
USE mysql;
查看用户
SELECT * FORM user;
创建有用户
CREATE USER XXX;
重新命名用户
RENAME USER XXX TO new_XXX;
删除用户
DROP  USER XXX;
查看用户账户的权限
SHOW GRANTS FOR xxx;
设置权限
GRANT 权限，xxxx ON 库表 TO XXX;
示例：GRANT SELECT ON aiov_db.* TO zhansan; // 授予zhansan访问aiov_db的所有表的只读权限；
注： ALL 所有权限 ALTER 修改表的权限 CREATE 创建表的权限等，查看mysql权限表
给用户设置密码
SET PASSWORD FOR xxx = Password('密码')
注：不指定用户名，则更新当前用户的密码。
