import { test, expect } from '@playwright/test'

test.describe('Auth deep smoke', () => {
  test('register -> cookie -> me -> logout -> login -> me -> logout -> me', async ({ page }) => {
    await page.goto('/')

    const now = Date.now()
    const username = `e2e_user_${now}`
    const email = `e2e_${now}@example.com`
    const password = 'password123'

    const registerRes = await page.request.post('/api/auth/register', {
      data: { username, email, password },
    })
    expect(registerRes.ok()).toBeTruthy()

    const registerJson = await registerRes.json()
    expect(registerJson.success).toBe(true)
    expect(registerJson.user?.email).toBe(email.toLowerCase())

    const cookiesAfterRegister = await page.context().cookies()
    const authCookieAfterRegister = cookiesAfterRegister.find((c) => c.name === 'auth-token')
    expect(authCookieAfterRegister?.value).toBeTruthy()

    const meRes = await page.request.get('/api/auth/me')
    expect(meRes.status()).toBe(200)
    const meJson = await meRes.json()
    expect(meJson.success).toBe(true)
    expect(meJson.user?.email).toBe(email.toLowerCase())

    const logoutRes = await page.request.post('/api/auth/logout')
    expect(logoutRes.ok()).toBeTruthy()
    const logoutJson = await logoutRes.json()
    expect(logoutJson.success).toBe(true)

    const cookiesAfterLogout = await page.context().cookies()
    const authCookieAfterLogout = cookiesAfterLogout.find((c) => c.name === 'auth-token')
    expect(authCookieAfterLogout?.value || '').toBe('')

    const meAfterLogoutRes = await page.request.get('/api/auth/me')
    expect(meAfterLogoutRes.status()).toBe(401)

    const loginRes = await page.request.post('/api/auth/login', {
      data: { email, password },
    })
    expect(loginRes.ok()).toBeTruthy()
    const loginJson = await loginRes.json()
    expect(loginJson.success).toBe(true)
    expect(loginJson.redirect).toBe('/dashboard')

    const cookiesAfterLogin = await page.context().cookies()
    const authCookieAfterLogin = cookiesAfterLogin.find((c) => c.name === 'auth-token')
    expect(authCookieAfterLogin?.value).toBeTruthy()

    const meAfterLoginRes = await page.request.get('/api/auth/me')
    expect(meAfterLoginRes.status()).toBe(200)
    const meAfterLoginJson = await meAfterLoginRes.json()
    expect(meAfterLoginJson.success).toBe(true)
    expect(meAfterLoginJson.user?.email).toBe(email.toLowerCase())

    const logoutRes2 = await page.request.post('/api/auth/logout')
    expect(logoutRes2.ok()).toBeTruthy()

    const meAfterFinalLogoutRes = await page.request.get('/api/auth/me')
    expect(meAfterFinalLogoutRes.status()).toBe(401)
  })
})
