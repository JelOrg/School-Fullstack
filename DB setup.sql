create database management_system;
use management_system;


DELIMITER //
CREATE TRIGGER after_request_insert
AFTER INSERT ON request
FOR EACH ROW
BEGIN
    UPDATE items
    SET remainingAmount = remainingAmount - NEW.requestedAmount
    WHERE itemId = NEW.itemId;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER after_shipment_insert
AFTER INSERT ON shipments
FOR EACH ROW
BEGIN
    UPDATE items
    SET remainingAmount = remainingAmount + 1 --This is based on a shipment where you can scan items
    WHERE itemId = NEW.itemId; -- Added NEW. prefix
END; //

DELIMITER ;

