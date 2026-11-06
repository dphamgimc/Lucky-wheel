import { test, expect } from '@playwright/test';

test('phông Giáng sinh hiển thị tiếng Việt đồng nhất và vẽ lại canvas sau khi tải phông', async ({page}) => {
  // Chặn dịch vụ phông ngoài và làm chậm phông cục bộ để kiểm tra lần tải đầu.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
  await page.route(/noto-serif.*\.woff2/, async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    window.loadedWheelFonts = [];
    CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
      if (this.canvas.id === 'disc' && this.font.includes('Noto Serif') && document.fonts.check(this.font, text)) {
        window.loadedWheelFonts.push(text);
      }
      return original.call(this, text, ...args);
    };
  });
  await page.goto('/');
  await page.getByLabel('Giao diện', {exact:true}).selectOption('christmas');
  const sample = 'Nguyễn Thị Hồng';
  await page.locator('#names').fill(sample);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(text => window.loadedWheelFonts.includes(text), sample)).toBeTruthy();

  // Kiểm tra phông thực sự được dùng cho glyph, không chỉ tên font trong CSS.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  async function expectVietnameseFont(selector) {
    const {root} = await cdp.send('DOM.getDocument');
    const {nodeId} = await cdp.send('DOM.querySelector', {nodeId:root.nodeId, selector});
    const {fonts} = await cdp.send('CSS.getPlatformFontsForNode', {nodeId});
    expect(fonts.length).toBeGreaterThan(0);
    for (const font of fonts) {
      expect(font.familyName).toMatch(/^Noto Serif(?: |$)/);
      expect(font.isCustomFont).toBe(true);
    }
  }
  await expectVietnameseFont('h1');
  await expectVietnameseFont('.panel-heading h2');
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    await page.screenshot({path:`test-results/christmas-font-${width}.png`,fullPage:true});
  }
  await page.locator('#wheel').click();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#winner-name')).toHaveText(sample);
  await expectVietnameseFont('#winner-name');
  await page.screenshot({path:'test-results/christmas-font-winner.png',fullPage:true});
  await page.getByRole('button',{name:'Đóng',exact:true}).click();
  await page.getByLabel('Giao diện',{exact:true}).selectOption('default');
  await expect(page.locator('h1')).not.toHaveCSS('font-family', /Noto Serif/);
});
