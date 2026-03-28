const appState = {
  entrepreneurs: [],
  products: [],
  services: [],
  orders: [],
  serviceRequests: []
};

function navigateTo(sectionId) {
  document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
  document.getElementById(sectionId)?.classList.add('active');

  if (sectionId === 'requests') {
    loadTransactionalData();
  }

  if (sectionId === 'dashboard') {
    loadDashboard();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showNotification(message) {
  const notice = document.createElement('div');
  notice.className = 'notification';
  notice.textContent = message;
  document.body.appendChild(notice);
  setTimeout(() => notice.remove(), 2800);
}

function showEmptyState(message) {
  return `<div class="empty-state">${message}</div>`;
}

function titleCase(value = '') {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modalBody').innerHTML = '';
}

function openModal(html) {
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}

function requireLogin(nextSection = 'auth') {
  if (!authState.isLoggedIn) {
    showNotification('Please login to continue');
    navigateTo(nextSection);
    return false;
  }
  return true;
}

async function refreshAppData() {
  await Promise.all([loadHome(), loadEntrepreneurs(), loadProducts(), loadServices()]);
  if (authState.isLoggedIn) {
    await Promise.all([loadTransactionalData(), loadDashboard()]);
  } else {
    renderOrders([]);
    renderServiceRequests([]);
    renderDashboardSummary(null);
  }
}

async function loadHome() {
  const entrepreneurs = await API.getEntrepreneurs({});
  const products = await API.getProducts({});
  const services = await API.getServices({});
  appState.entrepreneurs = entrepreneurs;
  appState.products = products;
  appState.services = services;

  const featured = entrepreneurs.slice(0, 3);
  document.getElementById('featuredEntrepreneurs').innerHTML = featured.length
    ? featured.map(renderEntrepreneurCard).join('')
    : showEmptyState('No entrepreneurs available yet.');

  const featuredServices = services.slice(0, 4);
  document.getElementById('featuredServices').innerHTML = featuredServices.length
    ? featuredServices.map((service) => `
      <div class="list-card">
        <div class="badge-row">
          <span class="badge">${titleCase(service.category)}</span>
          ${service.entrepreneur?.isVerified ? '<span class="badge success">Verified</span>' : ''}
        </div>
        <h5>${service.title}</h5>
        <p class="list-meta">${service.entrepreneur?.name || 'Unknown'} | ${service.location || 'Local area'}</p>
        <p class="list-meta">Rs ${service.price} ${service.priceUnit || ''}</p>
        <button class="ghost-btn" onclick="requestService('${service._id}')">Request</button>
      </div>
    `).join('')
    : showEmptyState('Services will appear here as entrepreneurs create listings.');

  const featuredProducts = products.slice(0, 4);
  document.getElementById('featuredProducts').innerHTML = featuredProducts.length
    ? featuredProducts.map((product) => `
      <div class="list-card">
        <div class="badge-row">
          <span class="badge">${titleCase(product.category)}</span>
          ${product.seller?.isVerified ? '<span class="badge success">Verified</span>' : ''}
        </div>
        <h5>${product.name}</h5>
        <p class="list-meta">${product.seller?.name || 'Unknown'} | Rs ${product.price}</p>
        <button class="ghost-btn" onclick="orderProduct('${product._id}')">Buy</button>
      </div>
    `).join('')
    : showEmptyState('Products will appear here as entrepreneurs add handmade items.');

  const categories = [
    {
      title: 'Cobbler',
      key: 'cobbler',
      description: 'Footwear repair, stitching, polishing, and custom leather work.',
      value: entrepreneurs.filter((item) => item.skillType === 'cobbler').length
    },
    {
      title: 'Potter',
      key: 'potter',
      description: 'Clay products, decorative pottery, and traditional handcrafted items.',
      value: entrepreneurs.filter((item) => item.skillType === 'potter').length
    },
    {
      title: 'Tailor',
      key: 'tailor',
      description: 'Alterations, custom stitching, fitting, and fabric-based services.',
      value: entrepreneurs.filter((item) => item.skillType === 'tailor').length
    },
    {
      title: 'Artisan',
      key: 'artisan',
      description: 'Handmade crafts, local art, decor, and custom design work.',
      value: entrepreneurs.filter((item) => item.skillType === 'artisan').length
    },
    {
      title: 'Small Vendor',
      key: 'small_vendor',
      description: 'Hyperlocal sellers with daily-use goods and community commerce services.',
      value: entrepreneurs.filter((item) => item.skillType === 'small_vendor').length
    }
  ];

  document.getElementById('categoryHighlights').innerHTML = categories
    .map((category) => `
      <div class="category-card">
        <span class="badge">${category.value} listed</span>
        <strong>${category.title}</strong>
        <p class="card-meta">${category.description}</p>
        <button class="ghost-btn" onclick="quickCategoryFilter('${category.key}')">Explore</button>
      </div>
    `).join('');

  const metrics = [
    { label: 'Entrepreneurs', value: entrepreneurs.length },
    { label: 'Services', value: services.length },
    { label: 'Products', value: products.length },
    { label: 'Verified', value: entrepreneurs.filter((item) => item.isVerified).length },
    { label: 'Categories', value: new Set(entrepreneurs.map((item) => item.skillType)).size }
  ];

  document.getElementById('heroMetrics').innerHTML = metrics
    .map((item) => `<div class="metric-card"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join('');
}

function applyHeroSearch() {
  document.getElementById('entrepreneurSearch').value = document.getElementById('heroSearch').value.trim();
  document.getElementById('entrepreneurCategory').value = document.getElementById('heroCategory').value;
  document.getElementById('entrepreneurLocation').value = document.getElementById('heroLocation').value.trim();
  navigateTo('entrepreneurs');
  loadEntrepreneurs();
}

function quickCategoryFilter(category) {
  document.getElementById('entrepreneurCategory').value = category;
  navigateTo('entrepreneurs');
  loadEntrepreneurs();
}

function getEntrepreneurFilters() {
  return {
    search: document.getElementById('entrepreneurSearch').value.trim(),
    category: document.getElementById('entrepreneurCategory').value,
    location: document.getElementById('entrepreneurLocation').value.trim(),
    minPrice: document.getElementById('entrepreneurMinPrice').value,
    maxPrice: document.getElementById('entrepreneurMaxPrice').value
  };
}

async function loadEntrepreneurs() {
  const entrepreneurs = await API.getEntrepreneurs(getEntrepreneurFilters());
  appState.entrepreneurs = entrepreneurs;
  document.getElementById('entrepreneursGrid').innerHTML = entrepreneurs.length
    ? entrepreneurs.map(renderEntrepreneurCard).join('')
    : showEmptyState('No entrepreneurs matched those filters.');
}

function renderEntrepreneurCard(entrepreneur) {
  return `
    <article class="card">
      <div class="badge-row">
        <span class="badge">${titleCase(entrepreneur.skillType)}</span>
        ${entrepreneur.isVerified ? '<span class="badge success">Verified</span>' : '<span class="badge warning">Pending verification</span>'}
      </div>
      <h4>${entrepreneur.name}</h4>
      <p class="card-meta">${entrepreneur.location || 'Location not added'} | ${entrepreneur.experienceYears} years experience</p>
      <p>${entrepreneur.bio || 'Traditional skill professional building a digital presence.'}</p>
      <div class="badge-row">
        ${(entrepreneur.skills || []).slice(0, 3).map((skill) => `<span class="badge">${skill}</span>`).join('')}
      </div>
      <p class="card-meta">Starting from Rs ${entrepreneur.lowestPrice || 0} | Rating ${entrepreneur.averageRating || 0} (${entrepreneur.reviewCount} reviews)</p>
      <p class="card-meta">${entrepreneur.servicesCount} services | ${entrepreneur.productsCount} products</p>
      <button class="primary-btn" onclick="showEntrepreneurDetails('${entrepreneur.id}')">View Profile</button>
    </article>
  `;
}

async function showEntrepreneurDetails(id) {
  try {
    const data = await API.getEntrepreneur(id);
    openModal(`
      <div class="stack-list">
        <div class="badge-row">
          <span class="badge">${titleCase(data.profile.skillType)}</span>
          ${data.profile.isVerified ? '<span class="badge success">Verified</span>' : ''}
        </div>
        <h3>${data.profile.name}</h3>
        <p>${data.profile.bio || 'No bio added yet.'}</p>
        <p class="card-meta">${data.profile.location || 'Location not added'} | Availability: ${data.profile.availability || 'On request'}</p>
        <h4>Services</h4>
        <div class="stack-list">
          ${data.services.length ? data.services.map((service) => `
            <div class="list-card">
              <h5>${service.title}</h5>
              <p>${service.description || 'No description provided.'}</p>
              <p class="list-meta">Rs ${service.price} ${service.priceUnit || ''}</p>
              <button class="primary-btn" onclick="requestService('${service._id}')">Request Service</button>
            </div>
          `).join('') : showEmptyState('No services listed.')}
        </div>
        <h4>Products</h4>
        <div class="stack-list">
          ${data.products.length ? data.products.map((product) => `
            <div class="list-card">
              <h5>${product.name}</h5>
              <p>${product.description || 'No description provided.'}</p>
              <p class="list-meta">Rs ${product.price}</p>
              <button class="secondary-btn" onclick="orderProduct('${product._id}')">Buy Product</button>
            </div>
          `).join('') : showEmptyState('No products listed.')}
        </div>
      </div>
    `);
  } catch (error) {
    alert(error.message);
  }
}

function getProductFilters() {
  return {
    search: document.getElementById('productSearch').value.trim(),
    category: document.getElementById('productCategory').value,
    location: document.getElementById('productLocation').value.trim(),
    minPrice: document.getElementById('productMinPrice').value,
    maxPrice: document.getElementById('productMaxPrice').value
  };
}

async function loadProducts() {
  const products = await API.getProducts(getProductFilters());
  appState.products = products;
  document.getElementById('productsGrid').innerHTML = products.length
    ? products.map((product) => `
      <article class="card">
        <div class="badge-row">
          <span class="badge">${titleCase(product.category)}</span>
          ${product.seller?.isVerified ? '<span class="badge success">Verified entrepreneur</span>' : ''}
        </div>
        <h4>${product.name}</h4>
        <p>${product.description || 'No description provided.'}</p>
        <p class="card-meta">By ${product.seller?.name || 'Unknown'} in ${product.location || 'Local area'}</p>
        <p class="card-meta">Rs ${product.price} | Stock ${product.stock}</p>
        <button class="primary-btn" onclick="orderProduct('${product._id}')">Buy Now</button>
      </article>
    `).join('')
    : showEmptyState('No products found for the selected filters.');
}

function getServiceFilters() {
  return {
    search: document.getElementById('serviceSearch').value.trim(),
    category: document.getElementById('serviceCategory').value,
    location: document.getElementById('serviceLocation').value.trim(),
    minPrice: document.getElementById('serviceMinPrice').value,
    maxPrice: document.getElementById('serviceMaxPrice').value
  };
}

async function loadServices() {
  const services = await API.getServices(getServiceFilters());
  appState.services = services;
  document.getElementById('servicesGrid').innerHTML = services.length
    ? services.map((service) => `
      <article class="card">
        <div class="badge-row">
          <span class="badge">${titleCase(service.category)}</span>
          ${service.entrepreneur?.isVerified ? '<span class="badge success">Verified entrepreneur</span>' : ''}
        </div>
        <h4>${service.title}</h4>
        <p>${service.description || 'No description provided.'}</p>
        <p class="card-meta">By ${service.entrepreneur?.name || 'Unknown'} in ${service.location || 'Local area'}</p>
        <p class="card-meta">Rs ${service.price} ${service.priceUnit || ''} | ${service.availability || 'On request'}</p>
        <button class="primary-btn" onclick="requestService('${service._id}')">Place Request</button>
      </article>
    `).join('')
    : showEmptyState('No services found for the selected filters.');
}

async function orderProduct(productId) {
  if (!requireLogin()) return;

  const product = appState.products.find((item) => item._id === productId) || await API.getProduct(productId);
  const quantity = Number(prompt(`Enter quantity for ${product.name}`, '1'));
  if (!quantity) return;
  const shippingAddress = prompt('Enter delivery address');
  if (!shippingAddress) return;

  try {
    await API.createOrder({
      items: [{ product: product._id, quantity }],
      shippingAddress,
      paymentMethod: 'cash_on_delivery'
    });
    showNotification('Order placed successfully');
    closeModal();
    await loadTransactionalData();
  } catch (error) {
    alert(error.message);
  }
}

async function requestService(serviceId) {
  if (!requireLogin()) return;

  const service = appState.services.find((item) => item._id === serviceId);
  const description = prompt(`Describe your request for "${service?.title || 'this service'}"`);
  if (!description) return;
  const location = prompt('Enter service location');
  const budget = prompt('Enter budget');
  const preferredDate = prompt('Preferred date (YYYY-MM-DD)');

  try {
    await API.createServiceRequest({
      serviceId,
      description,
      location,
      budget: Number(budget) || 0,
      preferredDate
    });
    showNotification('Service request submitted');
    closeModal();
    await loadTransactionalData();
  } catch (error) {
    alert(error.message);
  }
}

async function loadTransactionalData() {
  if (!authState.isLoggedIn) {
    renderOrders([]);
    renderServiceRequests([]);
    return;
  }

  try {
    const [orders, requests] = await Promise.all([API.getOrders(), API.getServiceRequests()]);
    appState.orders = orders;
    appState.serviceRequests = requests;
    renderOrders(orders);
    renderServiceRequests(requests);
  } catch (error) {
    renderOrders([]);
    renderServiceRequests([]);
  }
}

function renderOrders(orders) {
  document.getElementById('ordersList').innerHTML = orders.length
    ? orders.map((order) => `
      <div class="list-card">
        <h5>Order #${String(order._id).slice(-6)}</h5>
        <p class="list-meta">Buyer: ${order.buyer?.name || '-'} | Entrepreneur: ${order.entrepreneur?.name || '-'}</p>
        <p class="list-meta">Amount: Rs ${order.totalAmount} | Status: ${titleCase(order.status)}</p>
        <div class="badge-row">
          ${(order.items || []).map((item) => `<span class="badge">${item.product?.name || 'Product'} x ${item.quantity}</span>`).join('')}
        </div>
        ${renderStatusActions('order', order)}
      </div>
    `).join('')
    : showEmptyState('No orders yet.');
}

function renderServiceRequests(requests) {
  document.getElementById('serviceRequestsList').innerHTML = requests.length
    ? requests.map((request) => `
      <div class="list-card">
        <h5>${request.service?.title || 'Service request'}</h5>
        <p>${request.description || 'No description provided.'}</p>
        <p class="list-meta">Customer: ${request.customer?.name || '-'} | Entrepreneur: ${request.entrepreneur?.name || '-'}</p>
        <p class="list-meta">Budget: Rs ${request.budget || 0} | Status: ${titleCase(request.status)}</p>
        ${renderStatusActions('request', request)}
      </div>
    `).join('')
    : showEmptyState('No service requests yet.');
}

function renderStatusActions(kind, item) {
  if (!authState.user) return '';

  const isAdmin = authState.user.role === 'admin';
  const isEntrepreneurOwner =
    authState.user.role === 'entrepreneur' &&
    ((kind === 'order' && item.entrepreneur?._id === authState.user.id) ||
      (kind === 'request' && item.entrepreneur?._id === authState.user.id));

  if (!isAdmin && !isEntrepreneurOwner) return '';

  const actions =
    kind === 'order'
      ? [
          ['accepted', 'Accept'],
          ['rejected', 'Reject'],
          ['completed', 'Complete']
        ]
      : [
          ['accepted', 'Accept'],
          ['rejected', 'Reject'],
          ['completed', 'Complete']
        ];

  return `
    <div class="badge-row">
      ${actions.map(([status, label]) => `
        <button class="ghost-btn" onclick="updateStatus('${kind}', '${item._id}', '${status}')">${label}</button>
      `).join('')}
    </div>
  `;
}

async function updateStatus(kind, id, status) {
  try {
    if (kind === 'order') {
      await API.updateOrderStatus(id, status);
    } else {
      await API.updateServiceRequestStatus(id, status);
    }
    showNotification('Status updated');
    await Promise.all([loadTransactionalData(), loadDashboard()]);
  } catch (error) {
    alert(error.message);
  }
}

async function saveProfile() {
  if (!requireLogin()) return;

  try {
    const payload = {
      name: document.getElementById('profileName').value.trim(),
      phone: document.getElementById('profilePhone').value.trim(),
      location: document.getElementById('profileLocation').value.trim(),
      address: document.getElementById('profileAddress').value.trim(),
      skillType: document.getElementById('profileSkillType').value,
      experienceYears: Number(document.getElementById('profileExperience').value) || 0,
      skills: document.getElementById('profileSkills').value.split(',').map((item) => item.trim()).filter(Boolean),
      pricingDetails: document.getElementById('profilePricing').value.trim(),
      availability: document.getElementById('profileAvailability').value.trim(),
      bio: document.getElementById('profileBio').value.trim(),
      gallery: document.getElementById('profileGallery').value.split(',').map((item) => item.trim()).filter(Boolean)
    };

    const result = await API.updateProfile(payload);
    authState.user = result.user;
    localStorage.setItem('user', JSON.stringify(result.user));
    updateAuthUI();
    showNotification('Profile updated');
    await refreshAppData();
  } catch (error) {
    alert(error.message);
  }
}

function populateProfileForm() {
  const user = authState.user;
  document.getElementById('profileName').value = user?.name || '';
  document.getElementById('profilePhone').value = user?.phone || '';
  document.getElementById('profileLocation').value = user?.location || '';
  document.getElementById('profileAddress').value = user?.address || '';
  document.getElementById('profileSkillType').value = user?.skillType || 'other';
  document.getElementById('profileExperience').value = user?.experienceYears || '';
  document.getElementById('profileSkills').value = (user?.skills || []).join(', ');
  document.getElementById('profilePricing').value = user?.pricingDetails || '';
  document.getElementById('profileAvailability').value = user?.availability || '';
  document.getElementById('profileBio').value = user?.bio || '';
  document.getElementById('profileGallery').value = (user?.gallery || []).join(', ');
}

async function createProduct() {
  try {
    await API.createProduct({
      name: document.getElementById('newProductName').value.trim(),
      description: document.getElementById('newProductDescription').value.trim(),
      price: Number(document.getElementById('newProductPrice').value),
      category: document.getElementById('newProductCategory').value,
      stock: Number(document.getElementById('newProductStock').value) || 0
    });
    showNotification('Product added');
    await Promise.all([loadDashboard(), loadProducts(), loadHome()]);
  } catch (error) {
    alert(error.message);
  }
}

async function createService() {
  try {
    await API.createService({
      title: document.getElementById('newServiceTitle').value.trim(),
      description: document.getElementById('newServiceDescription').value.trim(),
      price: Number(document.getElementById('newServicePrice').value),
      priceUnit: document.getElementById('newServiceUnit').value.trim(),
      category: document.getElementById('newServiceCategory').value,
      availability: document.getElementById('newServiceAvailability').value.trim()
    });
    showNotification('Service added');
    await Promise.all([loadDashboard(), loadServices(), loadHome()]);
  } catch (error) {
    alert(error.message);
  }
}

async function loadDashboard() {
  const entrepreneurTools = document.getElementById('entrepreneurTools');
  const adminTools = document.getElementById('adminTools');

  if (!authState.isLoggedIn) {
    entrepreneurTools.classList.add('hidden');
    adminTools.classList.add('hidden');
    renderDashboardSummary(null);
    return;
  }

  try {
    const current = await API.getMe();
    authState.user = current.user;
    localStorage.setItem('user', JSON.stringify(current.user));
    populateProfileForm();

    const dashboard = await API.getDashboard();
    renderDashboardSummary(dashboard.summary);

    if (authState.user.role === 'entrepreneur') {
      entrepreneurTools.classList.remove('hidden');
      adminTools.classList.add('hidden');
      const listings = await API.getMyListings();
      renderMyListings(listings);
    } else {
      entrepreneurTools.classList.add('hidden');
      document.getElementById('myProducts').innerHTML = '';
      document.getElementById('myServices').innerHTML = '';
    }

    if (authState.user.role === 'admin') {
      adminTools.classList.remove('hidden');
      await loadAdminPanel();
    } else {
      adminTools.classList.add('hidden');
    }
  } catch (error) {
    renderDashboardSummary(null);
  }
}

function renderDashboardSummary(summary) {
  const container = document.getElementById('dashboardSummary');
  if (!summary) {
    container.innerHTML = showEmptyState('Login to access your dashboard.');
    return;
  }

  container.innerHTML = Object.entries(summary)
    .map(([key, value]) => `<div class="stat-card"><span>${titleCase(key)}</span><strong>${value}</strong></div>`)
    .join('');
}

function renderMyListings(listings) {
  document.getElementById('myProducts').innerHTML = listings.products.length
    ? listings.products.map((item) => `<div class="list-card"><h5>${item.name}</h5><p class="list-meta">Rs ${item.price} | ${titleCase(item.category)}</p></div>`).join('')
    : showEmptyState('No products added yet.');

  document.getElementById('myServices').innerHTML = listings.services.length
    ? listings.services.map((item) => `<div class="list-card"><h5>${item.title}</h5><p class="list-meta">Rs ${item.price} | ${titleCase(item.category)}</p></div>`).join('')
    : showEmptyState('No services added yet.');
}

async function loadAdminPanel() {
  const [analytics, entrepreneurs, operations] = await Promise.all([
    API.getAdminAnalytics(),
    API.getAdminEntrepreneurs(),
    API.getAdminOperations()
  ]);

  document.getElementById('adminAnalytics').innerHTML = Object.entries(analytics)
    .map(([key, value]) => `<div class="stat-card"><span>${titleCase(key)}</span><strong>${value}</strong></div>`)
    .join('');

  document.getElementById('adminEntrepreneurs').innerHTML = entrepreneurs.length
    ? entrepreneurs.map((item) => `
      <div class="list-card">
        <h5>${item.name}</h5>
        <p class="list-meta">${titleCase(item.skillType)} | ${item.location || 'No location'}</p>
        <div class="badge-row">
          ${item.isVerified ? '<span class="badge success">Verified</span>' : '<span class="badge warning">Pending</span>'}
          <button class="ghost-btn" onclick="toggleVerification('${item._id}', ${!item.isVerified})">${item.isVerified ? 'Unverify' : 'Verify'}</button>
        </div>
      </div>
    `).join('')
    : showEmptyState('No entrepreneurs found.');

  const operationsCards = [
    ...operations.orders.map((order) => `<div class="list-card"><h5>Order ${String(order._id).slice(-6)}</h5><p class="list-meta">${order.buyer?.name || '-'} to ${order.entrepreneur?.name || '-'} | ${titleCase(order.status)}</p></div>`),
    ...operations.serviceRequests.map((request) => `<div class="list-card"><h5>${request.service?.title || 'Service request'}</h5><p class="list-meta">${request.customer?.name || '-'} with ${request.entrepreneur?.name || '-'} | ${titleCase(request.status)}</p></div>`)
  ];

  document.getElementById('adminOperations').innerHTML = operationsCards.length
    ? operationsCards.join('')
    : showEmptyState('No activity to monitor yet.');
}

async function toggleVerification(id, isVerified) {
  try {
    await API.verifyEntrepreneur(id, isVerified);
    showNotification('Verification updated');
    await Promise.all([loadHome(), loadEntrepreneurs(), loadAdminPanel()]);
  } catch (error) {
    alert(error.message);
  }
}

document.getElementById('modal')?.addEventListener('click', (event) => {
  if (event.target.id === 'modal') {
    closeModal();
  }
});

async function init() {
  restoreAuth();
  await refreshAppData();
}

init();
