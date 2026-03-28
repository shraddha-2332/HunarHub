const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    const ids = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: ids } });
    if (!products.length) {
      return res.status(400).json({ message: 'No valid products selected' });
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const entrepreneurId = String(products[0].seller);

    const normalizedItems = items.map((item) => {
      const product = productMap.get(String(item.product));
      if (!product) {
        throw new Error('Invalid product in order');
      }
      if (String(product.seller) !== entrepreneurId) {
        throw new Error('Please place separate orders for different entrepreneurs');
      }
      return {
        product: product._id,
        quantity: Number(item.quantity) || 1,
        price: product.price
      };
    });

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      buyer: req.user._id,
      entrepreneur: entrepreneurId,
      items: normalizedItems,
      totalAmount,
      shippingAddress,
      paymentMethod
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name')
      .populate('entrepreneur', 'name skillType')
      .populate('items.product', 'name');

    res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : req.user.role === 'entrepreneur'
          ? { entrepreneur: req.user._id }
          : { buyer: req.user._id };

    const orders = await Order.find(filter)
      .populate('buyer', 'name')
      .populate('entrepreneur', 'name skillType')
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const canUpdate =
      req.user.role === 'admin' ||
      String(order.entrepreneur) === String(req.user._id) ||
      String(order.buyer) === String(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = req.body.status || order.status;
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
