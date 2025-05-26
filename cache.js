// cache.ts
let bookedShipmentCount = 0;
let userCount = 0;
const updateBookedShipmentCount = (newCount) => {
  bookedShipmentCount = newCount;
  console.log(`Booked shipment count updated to: ${bookedShipmentCount}`);
};
const updateUserCount = (newCount) => {
  userCount = newCount;
  console.log(`User count updated to: ${userCount}`);
};
const getBookedShipmentCount = () => bookedShipmentCount;
const getUserCount = () => userCount;

module.exports = {
  getUserCount,
  updateUserCount,
  updateBookedShipmentCount,
  getBookedShipmentCount,
};
