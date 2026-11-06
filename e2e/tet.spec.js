import {test,expect} from '@playwright/test';

test('Tết có hai loại bánh bay khi chờ, hoa mai lúc công bố và lưu giao diện',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.getByLabel('Giao diện',{exact:true}).selectOption('tet');
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('#tet-cakes')).toBeVisible();
  await expect(page.locator('.banh-tet')).toHaveCount(4);
  await expect(page.locator('.banh-chung')).toHaveCount(4);
  const motion=await page.locator('.tet-cake').first().evaluate(async e=>{
    const before=getComputedStyle(e).transform;
    await new Promise(resolve=>setTimeout(resolve,150));
    return before!==getComputedStyle(e).transform;
  });
  expect(motion).toBeTruthy();
  await page.reload();
  await expect(page.locator('#theme-select')).toHaveValue('tet');
  for(const width of [1440,390,360,320]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:`test-results/tet-${width}.png`,fullPage:true});
  }
  await page.locator('#names').fill('Nguyễn Thị Hồng\nNguyễn Thị Hồng');
  await page.locator('#wheel').click();
  await expect(page.locator('#tet-cakes')).toBeHidden();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await expect(page.locator('#tet-cakes')).toBeHidden();
  await expect(page.locator('#fireworks')).toHaveAttribute('data-effect','apricot');
  await expect.poll(()=>page.locator('#fireworks').evaluate(e=>e.getContext('2d').getImageData(0,0,e.width,e.height).data.some((v,i)=>i%4===3&&v>0))).toBeTruthy();
  expect(await page.evaluate(()=>{
    const canvas=document.querySelector('#fireworks'), rect=document.querySelector('#winner-name').getBoundingClientRect();
    const x=Math.max(0,Math.floor(rect.left)),y=Math.max(0,Math.floor(rect.top));
    return canvas.getContext('2d').getImageData(x,y,Math.min(canvas.width-x,Math.floor(rect.width)),Math.min(canvas.height-y,Math.floor(rect.height))).data.every((v,i)=>i%4!==3||v===0);
  })).toBeTruthy();
  await page.evaluate(()=>document.fonts.ready);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  const {root}=await cdp.send('DOM.getDocument');
  const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'#winner-name'});
  const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
  expect(fonts.length).toBeGreaterThan(0);
  fonts.forEach(font=>{expect(font.familyName).toMatch(/^Noto Serif(?: |$)/);expect(font.isCustomFont).toBeTruthy();});
  await page.screenshot({path:'test-results/tet-winner.png',fullPage:true});
  await page.getByRole('button',{name:'Xoá tên khỏi danh sách'}).click();
  await expect(page.locator('#names')).toHaveValue('Nguyễn Thị Hồng');
  await expect(page.locator('#tet-cakes')).toBeVisible();
  await page.locator('#wheel').click();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await page.getByRole('button',{name:'Đóng',exact:true}).click();
  await expect(page.locator('#tet-cakes')).toBeVisible();
  await page.getByLabel('Giao diện',{exact:true}).selectOption('mid-autumn');
  await expect(page.locator('#tet-cakes')).toBeHidden();
  await expect(page.locator('#lanterns')).toBeVisible();
  await page.getByLabel('Giao diện',{exact:true}).selectOption('default');
  await expect(page.locator('#tet-cakes')).toBeHidden();
  expect(errors).toEqual([]);
});

test('giảm chuyển động tắt bánh bay và giữ hoa mai tĩnh',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await page.locator('#theme-select').selectOption('tet');
  await expect(page.locator('.tet-cake').first()).toHaveCSS('animation-name','none');
  await page.locator('#wheel').click();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await expect(page.locator('#fireworks')).toHaveAttribute('data-effect','apricot');
  await page.getByRole('button',{name:'Đóng',exact:true}).click();
  await expect(page.locator('#wheel')).toBeEnabled();
});
