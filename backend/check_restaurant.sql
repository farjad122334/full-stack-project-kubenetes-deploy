-- Check if Restaurant records exist
SELECT u.Id as UserId, u.Email, u.Role, r.RestaurantId, r.RestaurantName
FROM Users u
LEFT JOIN Restaurants r ON u.Id = r.UserId
WHERE u.Role = 2; -- UserRole.Restaurant = 2
