import { test, expect } from '@playwright/test';

test('đổi giao diện, lưu sau tải lại, màu canvas và bố cục điện thoại', async ({page}) => {
  await page.goto('/');
  const background = await page.locator('html').evaluate(e=>getComputedStyle(e).backgroundColor);
  const font = await page.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily);
  await page.getByLabel('Giao diện', {exact:true}).selectOption('christmas');
  await expect(page.locator('html')).toHaveAttribute('data-theme','christmas');
  expect(await page.locator('html').evaluate(e=>getComputedStyle(e).backgroundColor)).not.toBe(background);
  expect(await page.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily)).not.toBe(font);
  await page.locator('#names').fill('An');
  expect(await page.locator('#disc').evaluate(e=>Array.from(e.getContext('2d').getImageData(800,600,1,1).data))).toEqual([184,50,67,255]);
  await expect(page.locator('.pointer')).toHaveCSS('border-right-color','rgb(184, 50, 67)');
  await page.reload();
  await expect(page.getByLabel('Giao diện',{exact:true})).toHaveValue('christmas');
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:'test-results/christmas-mobile.png',fullPage:true});
  await page.getByLabel('Giao diện',{exact:true}).selectOption('default');
  await expect(page.locator('.pointer')).toHaveCSS('border-right-color','rgb(244, 185, 66)');
  await page.locator('#names').fill('');
  await expect(page.locator('.pointer')).toHaveCSS('border-right-color','rgb(167, 155, 172)');
});

const themeExpectations = {
  tet: {palette:['rgb(170, 41, 54)','rgb(57, 114, 65)','rgb(154, 98, 28)','rgb(169, 61, 36)'], effect:'apricot'},
  default: {palette:['rgb(244, 185, 66)','rgb(133, 96, 213)','rgb(238, 107, 146)','rgb(55, 180, 197)'], effect:'fireworks'},
  christmas: {palette:['rgb(184, 50, 67)','rgb(36, 118, 90)','rgb(191, 139, 48)','rgb(55, 95, 112)'], effect:'snow'},
  'mid-autumn': {palette:['rgb(168, 57, 60)','rgb(152, 96, 30)','rgb(49, 94, 123)','rgb(117, 77, 136)'], effect:'fireworks'},
};
for (const [theme, expected] of Object.entries(themeExpectations)) {
  test(`kim đổi màu lúc quay, đúng người trúng và hiệu ứng ${theme}`, async ({page}) => {
    await page.goto('/');
    await page.getByLabel('Giao diện',{exact:true}).selectOption(theme);
    await page.locator('#names').fill('An\nBình\nAn\nDuy');
    await page.locator('#wheel').click();
    await expect(page.locator('#theme-select')).toBeDisabled();
    const samples=await page.evaluate(async()=>{
      const disc=document.querySelector('#disc'), pointer=document.querySelector('.pointer');
      const samples=[];
      for(let i=0;i<20;i++){
        await new Promise(resolve=>setTimeout(resolve,60));
        const matrix=new DOMMatrixReadOnly(getComputedStyle(disc).transform);
        const angle=(Math.atan2(matrix.b,matrix.a)*180/Math.PI+360)%360;
        const index=Math.floor(((360-angle)%360)/90);
        samples.push({index,color:getComputedStyle(pointer).borderRightColor});
      }
      return samples;
    });
    const palette=expected.palette;
    expect(new Set(samples.map(s=>s.color)).size).toBeGreaterThan(1);
    samples.forEach(s=>expect(s.color).toBe(palette[s.index]));
    await expect(page.locator('#result')).toBeVisible({timeout:8000});
    await expect(page.locator('#fireworks')).toHaveAttribute('data-effect',expected.effect);
    await expect.poll(()=>page.locator('#fireworks').evaluate(e=>e.getContext('2d').getImageData(0,0,e.width,e.height).data.some((v,i)=>i%4===3&&v>0))).toBeTruthy();
    const rotation=await page.locator('#disc').evaluate(e=>Number(e.style.transform.match(/[\d.]+/)[0]));
    const index=Math.floor(((360-rotation%360)%360)/90);
    await expect(page.locator('.pointer')).toHaveCSS('border-right-color',palette[index]);
    await expect(page.locator('#winner-name')).toHaveText(['An','Bình','An','Duy'][index]);
    await page.screenshot({path:`test-results/${theme}-effect.png`,fullPage:true});
    await page.getByRole('button',{name:'Đóng',exact:true}).click();
    await expect(page.locator('#theme-select')).toBeEnabled();
  });
}
