import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(process.cwd(), "data.json");

// Parse JSON request bodies
app.use(express.json());

// Helper to read data from data.json
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Seed default categories, products, banners, orders, and admins
      const initialData = {
        categories: [
          { id: "cat-1", name: "Smart Watches", slug: "smart-watches", imageUrl: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=150&q=80" },
          { id: "cat-2", name: "Wireless Earbuds", slug: "wireless-earbuds", imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=150&q=80" },
          { id: "cat-3", name: "Mobile Accessories", slug: "mobile-accessories", imageUrl: "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=150&q=80" },
          { id: "cat-4", name: "Men's Fashion", slug: "mens-fashion", imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=150&q=80" },
          { id: "cat-5", name: "Home & Living", slug: "home-and-living", imageUrl: "https://images.unsplash.com/photo-1578857987181-63e8b39a72e5?auto=format&fit=crop&w=150&q=80" }
        ],
        products: [
          {
            id: "prod-1",
            categoryId: "cat-1",
            title: "Smart Watch Ultra 9",
            sku: "SW-ULT9",
            regularPrice: 4500,
            salePrice: 2899,
            stockCount: 45,
            description: "A high-fidelity premium smart watch with 2.0-inch AMOLED display, heart rate and blood oxygen monitoring, multi-sport tracking, smart bluetooth calling, wireless charger, and elegant alloy frame.",
            sizes: "49mm,45mm",
            colors: "Orange,Black,Silver",
            isFlashSale: true,
            flashSaleProgress: 60,
            imageUrl: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80",
            gallery: [
              "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
            ],
            rating: 4.8,
            brand: "Siemens",
            subCategory: "AC"
          },
          {
            id: "prod-2",
            categoryId: "cat-2",
            title: "M10 TWS Wireless Earbuds",
            sku: "EAR-M10",
            regularPrice: 2500,
            salePrice: 1249,
            stockCount: 18,
            description: "Bluetooth 5.1 Stereo earbuds equipped with a massive 2000mAh charging case that can also charge your phone! Features dual digital LED battery indicators, IPX7 waterproof rating, touch control, and high bass acoustics.",
            sizes: "Standard",
            colors: "Black",
            isFlashSale: true,
            flashSaleProgress: 88,
            imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
            gallery: [],
            rating: 4.5,
            brand: "Schneider",
            subCategory: "DC"
          },
          {
            id: "prod-3",
            categoryId: "cat-3",
            title: "GaN 65W Multi-Port Fast Charger",
            sku: "CHG-65W",
            regularPrice: 2000,
            salePrice: 1399,
            stockCount: 75,
            description: "Advanced Gallium Nitride (GaN) technology provides powerful 65W high speed output for notebooks, iPhones, iPads, and Android devices. Built-in safeguards protect your devices against excessive current, overheating, and overcharging.",
            sizes: "Standard US",
            colors: "Black,White",
            isFlashSale: false,
            flashSaleProgress: 0,
            imageUrl: "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80",
            gallery: [],
            rating: 4.7,
            brand: "ABB",
            subCategory: "AC"
          },
          {
            id: "prod-4",
            categoryId: "cat-4",
            title: "Premium Slim-Fit Cotton Polo",
            sku: "FSH-POLO",
            regularPrice: 1999,
            salePrice: 1450,
            stockCount: 110,
            description: "Crafted from highly breathable combed cotton pique. This Alladin style regular slim-fit polo features classic rib knit collar, double button placket, short sleeves, and standard athletic stitching.",
            sizes: "S,M,L,XL",
            colors: "Emerald Green,Navy Blue,Charcoal Gray",
            isFlashSale: false,
            flashSaleProgress: 0,
            imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80",
            gallery: [],
            rating: 4.6,
            brand: "Terasaki",
            subCategory: "DC"
          },
          {
            id: "prod-5",
            categoryId: "cat-5",
            title: "Rechargeable Portable Smoothie Blender",
            sku: "HL-BLND",
            regularPrice: 3800,
            salePrice: 2499,
            stockCount: 24,
            description: "A compact personal juice extractor with 6 ultra-sharp stainless steel blades, high rotation speed, built-in 4000mAh rechargeable lithium battery, security safety lock, and food-grade BPA-free plastic construction.",
            sizes: "400ml",
            colors: "Pink,Mint Green,Sky Blue",
            isFlashSale: false,
            flashSaleProgress: 0,
            imageUrl: "https://images.unsplash.com/photo-1578857987181-63e8b39a72e5?auto=format&fit=crop&w=600&q=80",
            gallery: [],
            rating: 4.4,
            brand: "Hager",
            subCategory: "AC"
          }
        ],
        orders: [
          {
            id: "ORD-94812",
            customerName: "Zain Ali",
            customerEmail: "zain.ali@example.com",
            customerPhone: "03123456789",
            customerAddress: "Flat 4B, Mehran Heights, Block 5, Gulshan-e-Iqbal",
            customerCity: "Karachi",
            paymentMethod: "COD",
            totalAmount: 4148,
            status: "Pending",
            orderDate: "2026-07-03T18:42:00Z",
            items: [
              { productId: "prod-1", productTitle: "Smart Watch Ultra 9", sku: "SW-ULT9", quantity: 1, price: 2899 },
              { productId: "prod-2", productTitle: "M10 TWS Wireless Earbuds", sku: "EAR-M10", quantity: 1, price: 1249 }
            ]
          }
        ],
        banners: {
          heroSliders: [
            {
              image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
              title: "AL-LADIN GRAND FESTIVAL",
              subtitle: "Unbelievable Discounts on Trending Smart Gadgets & Lifestyle Products"
            },
            {
              image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
              title: "UP TO 60% OFF FLASH SALES",
              subtitle: "Hottest Mobile Accessories and Gadgets are Now Within Your Budget"
            },
            {
              image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
              title: "ELEGANT MEN'S FASHION",
              subtitle: "Discover Premium Quality Shirts, Trousers & Smart Apparel"
            },
            {
              image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
              title: "MODERN HOME & LIVING",
              subtitle: "Upgrade Your Space with Cozy Lights, Organizers & Smart Kitchenware"
            },
            {
              image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80",
              title: "PREMIUM SOUND EXPERIENCE",
              subtitle: "Immerse Yourself in High-Fidelity Wireless Audio with Active Noise Cancellation"
            }
          ],
          sideBanners: [
            {
              image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&h=800&q=80",
              link: "#"
            },
            {
              image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&h=800&q=80",
              link: "#"
            }
          ],
          contactInfo: {
            phone: "+92 300 1234567",
            email: "support@alladin.pk",
            address: "Building 45-C, Lane 5, Bukhari Commercial, Phase 6, DHA, Karachi, Pakistan"
          },
          flashSaleEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        },
        admins: [
          { username: "admin", password: "admin", email: "admin@alladin.pk", fullName: "Store Administrator" }
        ]
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(data);
    let changed = false;
    if (!parsed.posTransactions) {
      parsed.posTransactions = [];
      changed = true;
    }
    if (!parsed.posCustomers) {
      parsed.posCustomers = [];
      changed = true;
    }
    if (!parsed.posExpenses) {
      parsed.posExpenses = [];
      changed = true;
    }
    if (!parsed.admins) {
      parsed.admins = [];
      changed = true;
    }
    if (!parsed.admins.some((a: any) => a.username.toLowerCase() === "pos")) {
      parsed.admins.push({ username: "pos", password: "pos", email: "pos@alladin.pk", fullName: "POS Operator" });
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), "utf8");
    }
    return parsed;
  } catch (error) {
    console.error("Error reading data.json", error);
    return { categories: [], products: [], orders: [], banners: {}, admins: [] };
  }
}

// Helper to write data to data.json
function writeData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing data.json", error);
    return false;
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Get All Data
app.get("/api/data", (req, res) => {
  const storeData = readData();
  res.json({
    categories: storeData.categories,
    products: storeData.products,
    banners: storeData.banners,
    // Filter orders so they don't contain admin lists, etc.
    orders: storeData.orders,
  });
});

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const storeData = readData();
  
  const admin = storeData.admins.find(
    (a: any) => a.username.toLowerCase() === username.toLowerCase() && a.password === password
  );

  if (admin) {
    res.json({
      success: true,
      token: "admin-session-token-secure-alladin",
      admin: {
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName
      }
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid Admin username or password." });
  }
});

// Category Endpoints
app.post("/api/categories", (req, res) => {
  const { id, name, slug, imageUrl } = req.body;
  const storeData = readData();
  
  if (id) {
    // Edit Category
    const index = storeData.categories.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      storeData.categories[index] = { ...storeData.categories[index], name, slug, imageUrl };
      writeData(storeData);
      res.json({ success: true, category: storeData.categories[index] });
    } else {
      res.status(404).json({ success: false, message: "Category not found." });
    }
  } else {
    // Add Category
    const newId = "cat-" + Math.floor(Math.random() * 1000000);
    const newCategory = { id: newId, name, slug, imageUrl };
    storeData.categories.push(newCategory);
    writeData(storeData);
    res.json({ success: true, category: newCategory });
  }
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const storeData = readData();
  
  const filtered = storeData.categories.filter((c: any) => c.id !== id);
  storeData.categories = filtered;
  
  writeData(storeData);
  res.json({ success: true });
});

// Product Endpoints
app.post("/api/products", (req, res) => {
  const product = req.body;
  const storeData = readData();
  
  if (product.id) {
    // Edit Product
    const index = storeData.products.findIndex((p: any) => p.id === product.id);
    if (index !== -1) {
      // Keep existing rating if not supplied
      const original = storeData.products[index];
      storeData.products[index] = { 
        ...original, 
        ...product,
        regularPrice: Number(product.regularPrice),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        stockCount: Number(product.stockCount),
        flashSaleProgress: Number(product.flashSaleProgress || 0),
        rating: original.rating || 4.5
      };
      writeData(storeData);
      res.json({ success: true, product: storeData.products[index] });
    } else {
      res.status(404).json({ success: false, message: "Product not found." });
    }
  } else {
    // Add Product
    const newId = "prod-" + Math.floor(Math.random() * 1000000);
    const newProduct = {
      ...product,
      id: newId,
      regularPrice: Number(product.regularPrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      stockCount: Number(product.stockCount),
      flashSaleProgress: Number(product.flashSaleProgress || 0),
      rating: 4.5,
      gallery: product.gallery || []
    };
    storeData.products.push(newProduct);
    writeData(storeData);
    res.json({ success: true, product: newProduct });
  }
});

app.post("/api/products/bulk", (req, res) => {
  const productsArray = req.body.products;
  if (!Array.isArray(productsArray)) {
    return res.status(400).json({ success: false, message: "Products must be an array" });
  }
  const storeData = readData();
  const importedProducts = [];

  for (const item of productsArray) {
    const newId = "prod-" + Math.floor(Math.random() * 1000000);
    
    // Match category by name or slug
    let categoryId = item.categoryId || "cat-1";
    if (item.category) {
      const normInput = String(item.category).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedCat = storeData.categories.find((c: any) => {
        const normName = c.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        const normSlug = c.slug.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        return normName === normInput || normSlug === normInput;
      });
      if (matchedCat) {
        categoryId = matchedCat.id;
      } else {
        // Fallback loose matching
        const looseCat = storeData.categories.find((c: any) => {
          const normName = c.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
          return normName.includes(normInput) || normInput.includes(normName);
        });
        if (looseCat) {
          categoryId = looseCat.id;
        }
      }
    }

    const newProduct = {
      id: newId,
      categoryId: categoryId,
      title: item.title || "Untitled Product",
      sku: item.sku || ("SKU-" + Math.floor(100000 + Math.random() * 900000)),
      regularPrice: Number(item.regularPrice) || 0,
      salePrice: item.salePrice ? Number(item.salePrice) : null,
      stockCount: Number(item.stockCount) || 0,
      description: item.description || "",
      sizes: item.sizes || "Standard",
      colors: item.colors || "Standard",
      isFlashSale: !!item.isFlashSale,
      flashSaleProgress: Number(item.flashSaleProgress || 0),
      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80",
      gallery: Array.isArray(item.gallery) ? item.gallery : (item.gallery ? String(item.gallery).split(",").map((g: any) => g.trim()) : []),
      rating: Number(item.rating) || 4.5,
      brand: item.brand || "",
      subCategory: item.subCategory || "",
      isDraft: item.isDraft !== undefined ? !!item.isDraft : true
    };
    storeData.products.push(newProduct);
    importedProducts.push(newProduct);
  }

  writeData(storeData);
  res.json({ success: true, count: importedProducts.length, products: importedProducts });
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const storeData = readData();
  
  const filtered = storeData.products.filter((p: any) => p.id !== id);
  storeData.products = filtered;
  
  writeData(storeData);
  res.json({ success: true });
});

// Checkout Order Placement (Cash On Delivery)
app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, customerPhone, customerAddress, customerCity, items, totalAmount } = req.body;
  const storeData = readData();
  
  // Create order
  const orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);
  const newOrder = {
    id: orderId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    customerCity,
    paymentMethod: "COD",
    totalAmount: Number(totalAmount),
    status: "Pending",
    orderDate: new Date().toISOString(),
    items: items.map((it: any) => ({
      productId: it.productId,
      productTitle: it.productTitle,
      sku: it.sku,
      quantity: Number(it.quantity),
      price: Number(it.price)
    }))
  };

  // Adjust stock count for each ordered product
  items.forEach((item: any) => {
    const productIndex = storeData.products.findIndex((p: any) => p.id === item.productId);
    if (productIndex !== -1) {
      const p = storeData.products[productIndex];
      p.stockCount = Math.max(0, p.stockCount - Number(item.quantity));
    }
  });

  storeData.orders.unshift(newOrder);
  writeData(storeData);
  
  res.json({ success: true, orderId, order: newOrder });
});

// Update Order Status
app.put("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber, trackingCompany } = req.body; // Pending, Processed, Shipped, Delivered, Cancelled
  const storeData = readData();
  
  const orderIndex = storeData.orders.findIndex((o: any) => o.id === id);
  if (orderIndex !== -1) {
    const order = storeData.orders[orderIndex];
    const previousStatus = order.status;
    
    if (status !== undefined) {
      order.status = status;
    }
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }
    if (trackingCompany !== undefined) {
      order.trackingCompany = trackingCompany;
    }

    // If order gets CANCELLED, return stock to product inventory
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      order.items.forEach((item: any) => {
        const prodIndex = storeData.products.findIndex((p: any) => p.id === item.productId);
        if (prodIndex !== -1) {
          storeData.products[prodIndex].stockCount += item.quantity;
        }
      });
    }
    // If order was cancelled and now RESTORED (e.g. back to Pending/Processed), deduct stock again
    else if (previousStatus === "Cancelled" && status !== "Cancelled" && status !== undefined) {
      order.items.forEach((item: any) => {
        const prodIndex = storeData.products.findIndex((p: any) => p.id === item.productId);
        if (prodIndex !== -1) {
          const p = storeData.products[prodIndex];
          p.stockCount = Math.max(0, p.stockCount - item.quantity);
        }
      });
    }

    writeData(storeData);
    res.json({ success: true, order });
  } else {
    res.status(404).json({ success: false, message: "Order not found." });
  }
});

// Update Settings and Banners
app.post("/api/banners", (req, res) => {
  const { heroSliders, sideBanners, contactInfo, promoPopup, announcementText, announcementSpeed, announcementDirection, flashSaleEndTime } = req.body;
  const storeData = readData();
  
  storeData.banners = { 
    heroSliders, 
    sideBanners, 
    contactInfo,
    promoPopup: promoPopup || storeData.banners.promoPopup,
    announcementText: announcementText !== undefined ? announcementText : storeData.banners.announcementText,
    announcementSpeed: announcementSpeed !== undefined ? announcementSpeed : storeData.banners.announcementSpeed,
    announcementDirection: announcementDirection !== undefined ? announcementDirection : storeData.banners.announcementDirection,
    flashSaleEndTime: flashSaleEndTime !== undefined ? flashSaleEndTime : storeData.banners.flashSaleEndTime
  };
  writeData(storeData);
  
  res.json({ success: true, banners: storeData.banners });
});

// ==========================================
// POS API ENDPOINTS
// ==========================================

// Get All POS Data
app.get("/api/pos/data", (req, res) => {
  const storeData = readData();
  res.json({
    success: true,
    transactions: storeData.posTransactions || [],
    customers: storeData.posCustomers || [],
    expenses: storeData.posExpenses || []
  });
});

// Create POS Transaction
app.post("/api/pos/transactions", (req, res) => {
  const { items, totalAmount, discount, paymentMethod, customerId, customerName, cashReceived, changeGiven } = req.body;
  const storeData = readData();

  const transactionId = "TXN-" + Math.floor(100000 + Math.random() * 900000);
  const newTransaction = {
    id: transactionId,
    items: items.map((it: any) => ({
      productId: it.productId,
      productTitle: it.productTitle,
      sku: it.sku,
      quantity: Number(it.quantity),
      price: Number(it.price)
    })),
    totalAmount: Number(totalAmount),
    discount: Number(discount || 0),
    paymentMethod, // "Cash" | "Credit" | "Card"
    customerId: customerId || null,
    customerName: customerName || "Walk-in Customer",
    cashReceived: cashReceived ? Number(cashReceived) : null,
    changeGiven: changeGiven ? Number(changeGiven) : null,
    date: new Date().toISOString()
  };

  // 1. Deduct Product Stock Counts
  items.forEach((item: any) => {
    const productIndex = storeData.products.findIndex((p: any) => p.id === item.productId);
    if (productIndex !== -1) {
      const p = storeData.products[productIndex];
      p.stockCount = Math.max(0, p.stockCount - Number(item.quantity));
    }
  });

  // 2. If Payment Method is "Credit" (Udhaari), add outstanding credit to Customer
  if (paymentMethod === "Credit" && customerId) {
    const customerIndex = storeData.posCustomers.findIndex((c: any) => c.id === customerId);
    if (customerIndex !== -1) {
      const customer = storeData.posCustomers[customerIndex];
      customer.totalCredit = Number(customer.totalCredit || 0) + Number(totalAmount);
      
      if (!customer.history) customer.history = [];
      customer.history.push({
        id: "CR-" + Math.floor(10000 + Math.random() * 90000),
        type: "credit_added",
        amount: Number(totalAmount),
        description: `Purchased invoice ${transactionId}`,
        date: new Date().toISOString()
      });
    }
  }

  if (!storeData.posTransactions) storeData.posTransactions = [];
  storeData.posTransactions.unshift(newTransaction);
  writeData(storeData);

  res.json({ success: true, transaction: newTransaction });
});

// Create/Update POS Customer (Udhaari Ledger accounts)
app.post("/api/pos/customers", (req, res) => {
  const { id, name, phone } = req.body;
  const storeData = readData();

  if (id) {
    const index = storeData.posCustomers.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      storeData.posCustomers[index].name = name;
      storeData.posCustomers[index].phone = phone;
      writeData(storeData);
      res.json({ success: true, customer: storeData.posCustomers[index] });
    } else {
      res.status(404).json({ success: false, message: "Customer not found." });
    }
  } else {
    const newId = "CUST-" + Math.floor(10000 + Math.random() * 90000);
    const newCustomer = {
      id: newId,
      name,
      phone,
      totalCredit: 0,
      history: []
    };
    storeData.posCustomers.push(newCustomer);
    writeData(storeData);
    res.json({ success: true, customer: newCustomer });
  }
});

// Pay Credit / Add Payment from Customer
app.post("/api/pos/customers/:id/payment", (req, res) => {
  const { id } = req.params;
  const { amount, description } = req.body;
  const storeData = readData();

  const index = storeData.posCustomers.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    const customer = storeData.posCustomers[index];
    const payAmount = Number(amount);
    customer.totalCredit = Math.max(0, Number(customer.totalCredit || 0) - payAmount);
    
    if (!customer.history) customer.history = [];
    customer.history.push({
      id: "PMT-" + Math.floor(10000 + Math.random() * 90000),
      type: "payment_made",
      amount: payAmount,
      description: description || "Received cash payment",
      date: new Date().toISOString()
    });

    writeData(storeData);
    res.json({ success: true, customer });
  } else {
    res.status(404).json({ success: false, message: "Customer not found." });
  }
});

// Manage Salaries / Expenses / Accounts
app.post("/api/pos/expenses", (req, res) => {
  const { id, title, amount, category, date } = req.body; // category e.g. "Salary", "Rent", "Utility", "Stock purchase", "Other"
  const storeData = readData();

  if (id) {
    const index = storeData.posExpenses.findIndex((e: any) => e.id === id);
    if (index !== -1) {
      storeData.posExpenses[index] = {
        ...storeData.posExpenses[index],
        title,
        amount: Number(amount),
        category,
        date: date || new Date().toISOString()
      };
      writeData(storeData);
      res.json({ success: true, expense: storeData.posExpenses[index] });
    } else {
      res.status(404).json({ success: false, message: "Expense not found." });
    }
  } else {
    const newId = "EXP-" + Math.floor(10000 + Math.random() * 90000);
    const newExpense = {
      id: newId,
      title,
      amount: Number(amount),
      category,
      date: date || new Date().toISOString()
    };
    if (!storeData.posExpenses) storeData.posExpenses = [];
    storeData.posExpenses.unshift(newExpense);
    writeData(storeData);
    res.json({ success: true, expense: newExpense });
  }
});

app.delete("/api/pos/expenses/:id", (req, res) => {
  const { id } = req.params;
  const storeData = readData();

  storeData.posExpenses = (storeData.posExpenses || []).filter((e: any) => e.id !== id);
  writeData(storeData);
  res.json({ success: true });
});

// ==========================================
// VITE MIDDLEWARE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Alladin Server] Backend API running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
