import { test, expect } from '@playwright/test';

test('giao diện mới giữ các điều khiển trên máy tính, tablet và điện thoại', async ({page}) => {
  await page.goto('/');
  for (const width of [1440,1024,820,768,390,360,320]) {
    await page.setViewportSize({width,height:width>1000?900:1024});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await expect(page.getByRole('button',{name:'Quay ngay',exact:true})).toBeVisible();
    await expect(page.locator('#theme-select')).toBeVisible();
    await expect(page.locator('#sound')).toBeVisible();
  }
  await page.locator('#names').fill('');
  await expect(page.locator('#spin-button')).toBeDisabled();
  await page.locator('#names').fill('Dì Hương');
  await page.getByRole('button',{name:'Quay ngay',exact:true}).click();
  await expect(page.locator('#spin-button')).toBeDisabled();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await expect(page.locator('#winner-name')).toHaveText('Dì Hương');
  await page.getByRole('button',{name:'Đóng',exact:true}).click();
  await expect(page.locator('#spin-button')).toBeEnabled();
});

test('tạm dừng trang trí và hoa mai không che tên sau khi đổi kích thước', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.locator('#theme-select').selectOption('tet');
  await page.getByRole('button',{name:'Tạm dừng trang trí',exact:true}).click();
  await expect(page.locator('.tet-cake').first()).toHaveCSS('animation-play-state','paused');
  await page.getByRole('button',{name:'Tiếp tục trang trí',exact:true}).click();
  await expect(page.locator('.tet-cake').first()).toHaveCSS('animation-play-state','running');
  await page.locator('#names').fill('Nguyễn Thị Hồng');
  await page.locator('#spin-button').click();
  await expect(page.locator('#result')).toBeVisible({timeout:8000});
  await page.setViewportSize({width:900,height:650});
  // Lấy mẫu qua nhiều frame để kiểm tra cả sau khi lớp canvas thay đổi tỉ lệ.
  const samples=await page.evaluate(async()=>{
    const values=[];
    for(let i=0;i<8;i++) {
      await new Promise(resolve=>setTimeout(resolve,70));
      const canvas=document.querySelector('#fireworks'), rect=document.querySelector('#winner-name').getBoundingClientRect(), bounds=canvas.getBoundingClientRect();
      const x=Math.max(0,Math.floor((rect.left-bounds.left)*canvas.width/bounds.width));
      const y=Math.max(0,Math.floor((rect.top-bounds.top)*canvas.height/bounds.height));
      const w=Math.min(canvas.width-x,Math.floor(rect.width*canvas.width/bounds.width));
      const h=Math.min(canvas.height-y,Math.floor(rect.height*canvas.height/bounds.height));
      values.push(canvas.getContext('2d').getImageData(x,y,w,h).data.every((v,j)=>j%4!==3||v===0));
    }
    return values;
  });
  expect(samples.every(Boolean)).toBeTruthy();
});
