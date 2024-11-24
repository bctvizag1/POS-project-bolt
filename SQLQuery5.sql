CREATE TRIGGER trg_UpdateStock
ON sale_items
AFTER INSERT, DELETE, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Update stock when inserting new sale items
    UPDATE p
    SET p.stock = p.stock - i.quantity
    FROM products p
    INNER JOIN inserted i ON p.id = i.product_id;

    -- Update stock when deleting sale items
    UPDATE p
    SET p.stock = p.stock + d.quantity
    FROM products p
    INNER JOIN deleted d ON p.id = d.product_id;

    -- Update stock when updating sale items
    UPDATE p
    SET p.stock = p.stock - i.quantity + d.quantity
    FROM products p
    INNER JOIN inserted i ON p.id = i.product_id
    INNER JOIN deleted d ON p.id = d.product_id;
END
GO