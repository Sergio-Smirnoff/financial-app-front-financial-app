import { test, expect, type Page } from '@playwright/test'
import { loginAsDemo } from './fixtures/live'

interface View {
  name: string
  path: string
  ready: string
}

const VIEWS: readonly View[] = [
  { name: 'overview', path: '/', ready: 'overview-kpi-cash' },
  { name: 'resumen', path: '/investments?tab=resumen', ready: 'composition-card' },
  { name: 'cartera', path: '/investments?tab=cartera', ready: 'register-holding-trigger' },
  { name: 'mercados', path: '/investments?tab=mercados', ready: 'inv-kpi-market-value' },
  { name: 'operaciones', path: '/investments?tab=operaciones', ready: 'inv-kpi-market-value' },
]

const view = (name: string) => VIEWS.find((v) => v.name === name)!

interface Viewport {
  label: string
  width: number
  height: number
}

const FRAMED: readonly Viewport[] = [
  { label: '2K', width: 2560, height: 1313 },
  { label: 'Full HD', width: 1920, height: 953 },
  { label: 'MacBook Pro 13', width: 1440, height: 796 },
  { label: '1366×768 laptop, compact', width: 1366, height: 641 },
  { label: 'frame threshold, compact', width: 1280, height: 600 },
]

const BELOW_FRAME: readonly Viewport[] = [
  { label: 'one pixel too narrow', width: 1279, height: 900 },
  { label: 'one pixel too short', width: 1600, height: 599 },
]

const CONTENT_WIDTH: Viewport = { label: 'tablet landscape, rail expanded', width: 1100, height: 900 }

const PHONES: readonly Viewport[] = [
  { label: 'iPhone 13', width: 390, height: 844 },
  { label: 'Android', width: 360, height: 800 },
]

const CARTERA_SIZES: readonly Viewport[] = [FRAMED[1], FRAMED[2], FRAMED[3]]

const RAIL_WIDTHS: readonly [number, number][] = [
  [2560, 240],
  [1920, 211],
  [1440, 176],
  [1366, 176],
]

const ALL_COLUMNS = {
  name: true, assetType: true, bank: true, quantity: true, avgCost: true,
  price: true, marketValue: true, share: true, pnl: true, pnlPct: true,
}

interface Box {
  scrollHeight: number
  clientHeight: number
  scrollWidth: number
  clientWidth: number
  overflowY: string
}

async function measure(page: Page) {
  return page.evaluate(() => {
    const box = (el: Element | null): Box | null =>
      el && {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        overflowY: getComputedStyle(el).overflowY,
      }
    const frame = document.querySelector('main[data-page-frame]')
    return {
      frame: box(frame),
      shell: box(frame?.parentElement?.closest('main') ?? null),
      collapsedCards: [...document.querySelectorAll('main[data-page-frame] .elev-sm')].filter((c) => c.clientHeight === 0 && getComputedStyle(c).display !== 'none' && (c as HTMLElement).offsetParent !== null).length,
      documentScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  })
}

async function amountsOnOneLine(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-amount]')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => {
        const style = getComputedStyle(el)
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.25
        return {
          text: el.textContent ?? '',
          oneLine: el.getBoundingClientRect().height <= 1.6 * lineHeight,
          fits: el.scrollWidth <= el.clientWidth,
        }
      }),
  )
}

async function rowsOutside(page: Page, testId: string) {
  return page.getByTestId(testId).evaluate((list) => {
    const box = list.getBoundingClientRect()
    return [...list.children]
      .filter((row) => !(row as HTMLElement).hidden)
      .filter((row) => {
        const r = row.getBoundingClientRect()
        return r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5
      }).length
  })
}

async function railWidth(page: Page) {
  const box = await page.locator('[data-slot="rail"]').boundingBox()
  return Math.round(box!.width)
}

async function storeView(page: Page, grouped: boolean, collapsed: boolean) {
  await page.evaluate(
    ([cartera, rail]) => {
      localStorage.setItem('investments.cartera.view.v1', cartera)
      localStorage.setItem('ui.sidebar.collapsed.v1', rail)
    },
    [
      JSON.stringify({ state: { grouped, columns: ALL_COLUMNS, sort: { key: 'ticker', direction: 'asc' } }, version: 1 }),
      JSON.stringify({ state: { sidebarCollapsed: collapsed }, version: 1 }),
    ],
  )
}

async function openView(page: Page, target: View) {
  await page.goto(target.path)
  await expect(page.getByTestId(target.ready)).toBeVisible()
  await page.waitForLoadState('networkidle')
}

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page)
})

for (const size of FRAMED) {
  for (const target of VIEWS) {
    test(`${target.name} fits ${size.label} (${size.width}×${size.height}) without page scroll`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height })
      await openView(page, target)

      const m = await measure(page)
      expect(m.frame, 'page frame').not.toBeNull()
      expect(m.shell, 'app shell main').not.toBeNull()
      expect(m.frame!.overflowY).toBe('hidden')
      expect(m.frame!.scrollHeight, 'page frame overflows').toBeLessThanOrEqual(m.frame!.clientHeight)
      expect(m.shell!.scrollHeight, 'app shell overflows').toBeLessThanOrEqual(m.shell!.clientHeight)
      expect(m.frame!.scrollWidth, 'page frame scrolls sideways').toBeLessThanOrEqual(m.frame!.clientWidth)
      expect(m.documentScrollWidth, 'page scrolls sideways').toBeLessThanOrEqual(m.innerWidth)
    })
  }
}

for (const size of BELOW_FRAME) {
  test(`scrolls normally below the frame on ${size.label} (${size.width}×${size.height})`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height })
    for (const target of VIEWS) {
      await openView(page, target)
      const m = await measure(page)
      expect(m.frame!.overflowY, target.name).toBe('auto')
      expect(m.collapsedCards, `${target.name}: cards squeezed to 0px`).toBe(0)
      expect(m.documentScrollWidth, `${target.name}: page scrolls sideways`).toBeLessThanOrEqual(m.innerWidth)
    }
  })
}

test(`two KPI columns and nothing sideways on ${CONTENT_WIDTH.label} (${CONTENT_WIDTH.width}×${CONTENT_WIDTH.height})`, async ({ page }) => {
  await page.setViewportSize({ width: CONTENT_WIDTH.width, height: CONTENT_WIDTH.height })
  for (const target of VIEWS) {
    await openView(page, target)
    const m = await measure(page)
    expect(m.frame!.overflowY, target.name).toBe('auto')
    expect(m.frame!.scrollWidth, `${target.name}: page frame scrolls sideways`).toBeLessThanOrEqual(m.frame!.clientWidth)
    expect(m.documentScrollWidth, `${target.name}: page scrolls sideways`).toBeLessThanOrEqual(m.innerWidth)
    const kpi = target.name === 'overview' ? 'overview-kpi-cash' : 'inv-kpi-market-value'
    const columns = await page
      .getByTestId(kpi)
      .evaluate((el) => getComputedStyle(el.closest('.grid')!).gridTemplateColumns.split(' ').length)
    expect(columns, `${target.name}: KPI strip columns`).toBe(2)
  }
})

for (const phone of PHONES) {
  test(`reflows and scrolls on ${phone.label} (${phone.width}×${phone.height})`, async ({ page }) => {
    await page.setViewportSize({ width: phone.width, height: phone.height })
    for (const target of VIEWS) {
      await openView(page, target)
      const m = await measure(page)
      expect(m.frame!.overflowY, target.name).toBe('auto')
      expect(m.frame!.scrollWidth, `${target.name}: page frame scrolls sideways`).toBeLessThanOrEqual(m.frame!.clientWidth)
      expect(m.documentScrollWidth, `${target.name}: page scrolls sideways`).toBeLessThanOrEqual(m.innerWidth)
      expect(m.collapsedCards, `${target.name}: cards squeezed to 0px`).toBe(0)
      for (const amount of await amountsOnOneLine(page)) {
        expect(amount.oneLine, `${target.name}: "${amount.text}" wraps`).toBe(true)
        expect(amount.fits, `${target.name}: "${amount.text}" overflows its box`).toBe(true)
      }
      if (target.name === 'cartera') {
        await expect(page.getByTestId('cartera-table').locator('thead th')).toHaveCount(2)
        const scroller = await page.getByTestId('positions-scroll').evaluate((el) => [el.scrollWidth, el.clientWidth])
        expect(scroller[0], 'Cartera scrolls sideways on a phone').toBeLessThanOrEqual(scroller[1])
      }
    }
  })
}

for (const size of CARTERA_SIZES) {
  test(`Cartera never scrolls sideways with every column on at ${size.width}×${size.height}`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height })
    for (const grouped of [true, false]) {
      for (const collapsed of [false, true]) {
        const combo = `${grouped ? 'grouped' : 'flat'}, rail ${collapsed ? 'collapsed' : 'expanded'}`
        await storeView(page, grouped, collapsed)
        await openView(page, view('cartera'))
        await expect(page.locator('[data-slot="rail"]')).toHaveAttribute('data-collapsed', String(collapsed))
        await expect(page.getByTestId('cartera-table').locator('thead th')).toHaveCount(grouped ? 11 : 12)
        const [scrollWidth, clientWidth] = await page.getByTestId('positions-scroll').evaluate((el) => [el.scrollWidth, el.clientWidth])
        expect(scrollWidth, `${combo}: Cartera scrolls sideways`).toBeLessThanOrEqual(clientWidth)
        const m = await measure(page)
        expect(m.frame!.scrollHeight, `${combo}: page frame overflows`).toBeLessThanOrEqual(m.frame!.clientHeight)
      }
    }
  })
}

test('fit lists render only whole rows on every framed size', async ({ page }) => {
  for (const size of FRAMED) {
    await page.setViewportSize({ width: size.width, height: size.height })
    for (const [name, list] of [['overview', 'latest-list'], ['resumen', 'alerts-list'], ['mercados', 'discovery-list']] as const) {
      await openView(page, view(name))
      const locator = page.getByTestId(list)
      if ((await locator.count()) === 0 || !(await locator.isVisible())) continue
      expect(await rowsOutside(page, list), `${list} at ${size.width}×${size.height}: a row is cut`).toBe(0)
      const [scrollHeight, clientHeight] = await locator.evaluate((el) => [el.scrollHeight, el.clientHeight])
      expect(scrollHeight, `${list} at ${size.width}×${size.height}: scrolls`).toBeLessThanOrEqual(clientHeight)
    }
  }
})

test('sidebar takes its share of the screen and collapses to icons', async ({ page }) => {
  for (const [width, expected] of RAIL_WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    await openView(page, view('overview'))
    await expect.poll(() => railWidth(page), { message: `rail at ${width}px` }).toBe(expected)
    const cut = await page.locator('[data-nav-label]').evaluateAll((labels) =>
      labels.filter((l) => l.scrollWidth > l.clientWidth).map((l) => l.textContent),
    )
    expect(cut, `labels truncated at ${width}px`).toEqual([])
  }

  const toggle = page.getByTestId('rail-toggle')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await toggle.click()
  await expect.poll(() => railWidth(page)).toBe(64)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Inversiones' })).toBeVisible()

  await page.reload()
  await expect.poll(() => railWidth(page), { message: 'collapsed rail after reload' }).toBe(64)
})

test('ticker search results stay inside the frame at 1280×600', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 })
  await openView(page, view('mercados'))

  await page.getByPlaceholder(/GGAL, AL30, AAPL/).fill('G')
  const results = page.getByTestId('ticker-search-results')
  await expect(results).toBeVisible()
  await page.waitForLoadState('networkidle')

  const list = (await results.boundingBox())!
  const frame = (await page.locator('main[data-page-frame]').boundingBox())!
  expect(list.height, 'results list has no height').toBeGreaterThan(0)
  expect(list.y, 'results list starts above the frame').toBeGreaterThanOrEqual(frame.y)
  expect(list.y + list.height, 'results list cut off by the frame').toBeLessThanOrEqual(frame.y + frame.height)
  expect(list.x, 'results list starts left of the frame').toBeGreaterThanOrEqual(frame.x)
  expect(list.x + list.width, 'results list runs past the frame').toBeLessThanOrEqual(frame.x + frame.width)
})
