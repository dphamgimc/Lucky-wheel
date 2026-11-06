import { test, expect } from '@playwright/test';

test('Trung Thu lưu lựa chọn, lồng đèn bay khi chờ và dừng khi quay/công bố', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Giao diện',{exact:true}).selectOption('mid-autumn');
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('#lanterns')).toBeVisible();
  const motion=await page.locator('.lantern').first().evaluate(async e=>{
    const before=getComputedStyle(e).transform;
    await new Promise(resolve=>setTimeout(resolve,150));
    return {before,after:getComputedStyle(e).transform};
  });
  expect(motion.after).not.toBe(motion.before);
  await page.reload();
  await expect(page.locator('#theme-select')).toHaveValue('mid-autumn');
  await expect(page.locator('#lanterns')).toBeVisible();
  for(const width of [1440,390,360,320]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:`test-results/mid-autumn-${width}.png`,fullPage:true});
  }
  await page.locator('#names').fill('Nguyễn Thị Hồng\nNguyễn Thị Hồng');
  await page.locator('#wheel').click();
  await expect(page.locator('#lanterns')).toBeHidden();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await expect(page.locator('#lanterns')).toBeHidden();
  await expect(page.locator('#fireworks')).toHaveAttribute('data-effect','fireworks');
  await expect(page.locator('.result-art')).toHaveText('✦ 🏆 ✦');
  await page.getByRole('button',{name:'Xoá tên khỏi danh sách'}).click();
  await expect(page.locator('#names')).toHaveValue('Nguyễn Thị Hồng');
  await expect(page.locator('#lanterns')).toBeVisible();
  await page.getByLabel('Giao diện',{exact:true}).selectOption('default');
  await expect(page.locator('#lanterns')).toBeHidden();
  await page.getByLabel('Giao diện',{exact:true}).selectOption('christmas');
  await expect(page.locator('#lanterns')).toBeHidden();
  await page.getByLabel('Giao diện',{exact:true}).selectOption('mid-autumn');
  await page.locator('#wheel').click();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await page.getByRole('button',{name:'Đóng',exact:true}).click();
  await expect(page.locator('#lanterns')).toBeVisible();
});

test('Trung Thu giảm chuyển động và vẫn quay tiếp khi thiếu Popover API', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByLabel('Giao diện',{exact:true}).selectOption('mid-autumn');
  await expect(page.locator('.lantern').first()).toHaveCSS('animation-name','none');
  await page.evaluate(()=>{HTMLElement.prototype.showPopover=undefined;HTMLElement.prototype.hidePopover=undefined;});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.locator('#wheel').click();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await page.getByRole('button',{name:'Đóng',exact:true}).click();
  await expect(page.locator('#names')).toBeEnabled();
  await expect(page.locator('#wheel')).toBeEnabled();
  expect(errors).toEqual([]);
});
