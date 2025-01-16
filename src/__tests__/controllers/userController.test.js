const request = require('supertest');
const app = require('../../app');

test('Get /users returns 404 NF', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(404);
});

test('Get /users/new returns 200 OK', async () => {
    const response = await request(app).get('/users/new');
    expect(response.status).toBe(200);
});

test('Get /users/contact returns 200 OK', async () => {
    const response = await request(app).get('/users/contact');
    expect(response.status).toBe(200);
});

test('Get /users/login returns 200 OK', async () => {
    const response = await request(app).get('/users/login');
    expect(response.status).toBe(200);
});

test('POST /users/login returns 302 redirect on Successful Login', async () => {
    const response = await request(app).post('/users/login')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send('email=connor@gmail.com&password=12345678');
    expect(response.status).toBe(302);
});

test('POST /users/login returns 400 client redirect on Unsuccessful Login', async () => {
    const response = await request(app).post('/users/login').send({ email: "wrong@wrong.com", password: "123121asd"});
    expect(response.status).toBe(400);
});

test('GET /users/dashboard with LoggedIn User gives 200 OK on dashboard page', async () => {
    const first = await request(app).post('/users/login')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send('email=connor@gmail.com&password=12345678');
    
    const cookie = first.headers['set-cookie'];

    const response = await request(app).get('/users/dashboard').set('Cookie', cookie);

    expect(response.status).toBe(200);
});

test('GET /users/dashboard with a Guest User gives 302 redirect to login page', async () => {
    const first = await request(app).post('/users/login')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send('email=wrong@wrong.com&password=123fdasf8');
    
    const cookie = first.headers['set-cookie'];

    const response = await request(app).get('/users/dashboard').set('Cookie', cookie);

    expect(response.status).toBe(302);
});

test('GET /users/application/:id with an invalid property id gives a 404 error', async () => {
    const first = await request(app).post('/users/login')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send('email=connor@gmail.com&password=12345678');
    
    const cookie = first.headers['set-cookie'];

    const response = await request(app).get('/users/applications/673a20f6da5bc40dc5ac5347').set('Cookie', cookie);

    expect(response.status).toBe(404);
});

test('GET /users/application/:id with a valid property id, but on a Non-Management user gives a 403 error', async () => {
    const first = await request(app).post('/users/login')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send('email=connor@gmail.com&password=12345678');
    
    const cookie = first.headers['set-cookie'];

    const response = await request(app).get('/users/applications/673a20f6da5bc40dc5ac5347').set('Cookie', cookie);

    expect(response.status).toBe(404);
});