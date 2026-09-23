import request from 'supertest';
import app from '../app';

describe('WishWise API Integration Tests', () => {
  let customerToken: string;
  let adminToken: string;
  let sampleProductId: string;
  let sampleWishlistId: string;

  beforeAll(async () => {
    // Login Customer
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@wishwise.com', password: 'customer123' });
    customerToken = customerLogin.body.data.tokens.accessToken;

    // Login Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@wishwise.com', password: 'admin123' });
    adminToken = adminLogin.body.data.tokens.accessToken;
  });

  test('GET /api/health should return OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('GET /api/products should return product catalogue', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    sampleProductId = res.body.data[0].id;
  });

  test('GET /api/auth/me with Bearer token returns profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('customer@wishwise.com');
  });

  test('GET /api/wishlists returns user wishlists with Health Score', async () => {
    const res = await request(app)
      .get('/api/wishlists')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].healthScore).toBeDefined();
    sampleWishlistId = res.body.data[0].id;
  });

  test('POST /api/products/compare compares products', async () => {
    const res = await request(app)
      .post('/api/products/compare')
      .send({ productIds: [sampleProductId] });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('POST /api/assistant/chat processes AI chat query', async () => {
    const res = await request(app)
      .post('/api/assistant/chat')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ prompt: 'I have ₹50,000 budget, what should I buy first?' });
    expect(res.status).toBe(200);
    expect(res.body.data.replyHeading).toBeDefined();
    expect(res.body.data.detailedExplanation).toBeDefined();
  });

  test('GET /api/admin/dashboard as Admin returns KPIs', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.kpi.totalUsers).toBeGreaterThan(0);
  });

  test('GET /api/admin/dashboard as Customer should be Forbidden (403)', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });
});
