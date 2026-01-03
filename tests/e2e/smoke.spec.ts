import { test, expect } from '@playwright/test'

const routes = [
  '/',
  '/stats',
  '/news',
  '/heatmap',
  '/forum',
  '/shop',
  '/casino',
  '/classes',
  '/features',
]

test.describe('Eldrun DEMO_MODE smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  for (const route of routes) {
    test(`should render ${route}`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(new RegExp(route === '/' ? '/$' : `${route}`))
      await expect(page.locator('body')).toBeVisible()
    })
  }

  test('faction widget responds', async ({ page }) => {
    await page.goto('/')
    const seraphar = page.getByText('Seraphar', { exact: false }).first()
    await seraphar.click({ force: true })
    await expect(seraphar).toBeVisible()
  })

  test('codex drawer opens', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Mehr/i }).click()
    const codexBtn = page.getByText('Codex', { exact: true }).first()
    await codexBtn.click()
    await expect(page).toHaveURL(/\/codex/)
    await expect(page.getByText(/^Eldrun Codex$/)).toBeVisible()
  })
})
