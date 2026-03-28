const ServiceRequest = require('../models/ServiceRequest');
const Service = require('../models/Service');

exports.createServiceRequest = async (req, res) => {
  try {
    const { serviceId, description, preferredDate, location, budget } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const request = await ServiceRequest.create({
      customer: req.user._id,
      entrepreneur: service.entrepreneur,
      service: service._id,
      category: service.category,
      description,
      preferredDate,
      location,
      budget
    });

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate('customer', 'name')
      .populate('entrepreneur', 'name skillType')
      .populate('service', 'title price');

    res.status(201).json({ message: 'Service request created successfully', request: populatedRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceRequests = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : req.user.role === 'entrepreneur'
          ? { entrepreneur: req.user._id }
          : { customer: req.user._id };

    const requests = await ServiceRequest.find(filter)
      .populate('customer', 'name')
      .populate('entrepreneur', 'name skillType')
      .populate('service', 'title price category')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    const canUpdate =
      req.user.role === 'admin' ||
      String(request.entrepreneur) === String(req.user._id) ||
      String(request.customer) === String(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    request.status = req.body.status || request.status;
    await request.save();

    res.json({ message: 'Service request updated successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
