const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await User.deleteMany();
  await Restaurant.deleteMany();
  await MenuItem.deleteMany();
  console.log('Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@eatzo.com',
    password: 'admin123',
    role: 'admin',
  });

  // Create regular user
  await User.create({
    name: 'John Doe',
    email: 'user@eatzo.com',
    password: 'user123',
    role: 'user',
  });

  console.log('Users created');

  // Create restaurants
  const restaurants = await Restaurant.insertMany([
    {
      name: 'Spice Garden',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      description: 'Authentic North Indian cuisine with rich gravies and tandoor specialties',
      location: 'Connaught Place',
      cuisine: 'North Indian',
      rating: 4.5,
      deliveryTime: '30-40 min',
      minOrder: 200,
      owner: admin._id,
    },
    {
      name: 'Burger Barn',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      description: 'Juicy smash burgers, crispy fries, and thick shakes',
      location: 'Lajpat Nagar',
      cuisine: 'American',
      rating: 4.3,
      deliveryTime: '20-30 min',
      minOrder: 150,
      owner: admin._id,
    },
    {
      name: 'Wok & Roll',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
      description: 'Pan-Asian delights — sushi, noodles, dim sum, and more',
      location: 'Hauz Khas',
      cuisine: 'Chinese & Asian',
      rating: 4.6,
      deliveryTime: '35-45 min',
      minOrder: 250,
      owner: admin._id,
    },
    {
      name: 'Pizza Republic',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
      description: 'Wood-fired pizzas with fresh toppings and handmade dough',
      location: 'Saket',
      cuisine: 'Italian',
      rating: 4.4,
      deliveryTime: '25-35 min',
      minOrder: 199,
      owner: admin._id,
    },
  ]);

  console.log('Restaurants created');

  // Create menu items
  const [spice, burger, wok, pizza] = restaurants;

  await MenuItem.insertMany([
    // Spice Garden
    { name: 'Butter Chicken', price: 320, restaurantId: spice._id, category: 'Main Course', isVeg: false, description: 'Creamy tomato-based chicken curry, slow cooked with aromatic spices', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300' },
    { name: 'Dal Makhani', price: 240, restaurantId: spice._id, category: 'Main Course', isVeg: true, description: 'Slow-cooked black lentils in butter and cream', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300' },
    { name: 'Garlic Naan', price: 60, restaurantId: spice._id, category: 'Breads', isVeg: true, description: 'Soft leavened bread with garlic and butter, baked in tandoor', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300' },
    { name: 'Paneer Tikka', price: 280, restaurantId: spice._id, category: 'Starter', isVeg: true, description: 'Marinated cottage cheese cubes grilled in tandoor', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300' },
    { name: 'Chicken Biryani', price: 350, restaurantId: spice._id, category: 'Rice', isVeg: false, description: 'Fragrant long-grain rice layered with spiced chicken', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300' },
    { name: 'Gulab Jamun', price: 80, restaurantId: spice._id, category: 'Desserts', isVeg: true, description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup', image: 'https://images.unsplash.com/photo-1601303516534-bf4e03f5a9f2?w=300' },

    // Burger Barn
    { name: 'Classic Smash Burger', price: 199, restaurantId: burger._id, category: 'Burgers', isVeg: false, description: 'Double smash patty, American cheese, pickles, special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
    { name: 'Crispy Chicken Burger', price: 219, restaurantId: burger._id, category: 'Burgers', isVeg: false, description: 'Buttermilk-fried chicken thigh, slaw, sriracha mayo', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300' },
    { name: 'Veggie Mushroom Burger', price: 179, restaurantId: burger._id, category: 'Burgers', isVeg: true, description: 'Grilled portobello mushroom, swiss cheese, caramelized onions', image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300' },
    { name: 'Loaded Fries', price: 129, restaurantId: burger._id, category: 'Sides', isVeg: true, description: 'Crispy fries topped with cheese sauce, jalapeños, and sour cream', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300' },
    { name: 'Chocolate Shake', price: 149, restaurantId: burger._id, category: 'Beverages', isVeg: true, description: 'Thick and creamy hand-spun chocolate milkshake', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300' },

    // Wok & Roll
    { name: 'Veg Dim Sum (6 pcs)', price: 220, restaurantId: wok._id, category: 'Starter', isVeg: true, description: 'Steamed veggie dumplings with ginger-soy dipping sauce', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300' },
    { name: 'Chicken Hakka Noodles', price: 260, restaurantId: wok._id, category: 'Main Course', isVeg: false, description: 'Stir-fried noodles with chicken, veggies, and soy sauce', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300' },
    { name: 'Kung Pao Tofu', price: 280, restaurantId: wok._id, category: 'Main Course', isVeg: true, description: 'Crispy tofu in spicy Sichuan sauce with peanuts', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300' },
    { name: 'Spring Rolls (4 pcs)', price: 180, restaurantId: wok._id, category: 'Starter', isVeg: true, description: 'Golden crispy rolls stuffed with glass noodles and vegetables', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300' },
    { name: 'Mango Pudding', price: 140, restaurantId: wok._id, category: 'Desserts', isVeg: true, description: 'Silky smooth Hong Kong-style mango pudding', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300' },

    // Pizza Republic
    { name: 'Margherita Pizza', price: 299, restaurantId: pizza._id, category: 'Pizzas', isVeg: true, description: 'San Marzano tomatoes, buffalo mozzarella, fresh basil', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300' },
    { name: 'BBQ Chicken Pizza', price: 379, restaurantId: pizza._id, category: 'Pizzas', isVeg: false, description: 'Smoky BBQ sauce, grilled chicken, red onion, cheddar', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300' },
    { name: 'Pesto Veggie Pizza', price: 349, restaurantId: pizza._id, category: 'Pizzas', isVeg: true, description: 'Basil pesto base, roasted veggies, goat cheese, arugula', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
    { name: 'Garlic Breadsticks', price: 149, restaurantId: pizza._id, category: 'Sides', isVeg: true, description: 'Freshly baked breadsticks with garlic butter and herbs', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300' },
    { name: 'Tiramisu', price: 179, restaurantId: pizza._id, category: 'Desserts', isVeg: true, description: 'Classic Italian espresso-soaked ladyfingers with mascarpone', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300' },
  ]);

  console.log('Menu items created');
  console.log('\n✅ Seed complete!');
  console.log('👤 Admin: admin@eatzo.com / admin123');
  console.log('👤 User:  user@eatzo.com  / user123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
