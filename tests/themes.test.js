import { test } from 'node:test';
import assert from 'node:assert/strict';
import { themes, resolveTheme, pointedIndex, pointerColor } from '../src/themes.js';

test('Tết có hoa mai và màu kim theo từng ô, kể cả danh sách rỗng', () => {
  assert.equal(resolveTheme('tet'), 'tet');
  assert.equal(themes.tet.effect, 'apricot');
  assert.notEqual(themes.tet.effect,themes.default.effect);
  for(const count of [1,4,13]) for(let i=0;i<count;i++) {
    assert.equal(pointerColor(360-(i+.5)*360/count,count,themes.tet.colors),themes.tet.colors[i%themes.tet.colors.length]);
  }
  assert.equal(pointerColor(0,0,themes.tet.colors),'#a79bac');
});

test('giao diện lưu không hợp lệ trở về mặc định', () => {
  for (const value of [null, 'unknown', '__proto__', 'constructor']) assert.equal(resolveTheme(value), 'default');
  assert.equal(resolveTheme('christmas'), 'christmas');
});
test('hai giao diện có màu, phông chữ và hiệu ứng riêng', () => {
  assert.notDeepEqual(themes.default.colors, themes.christmas.colors);
  assert.notEqual(themes.default.font, themes.christmas.font);
  assert.notEqual(themes.default.effect, themes.christmas.effect);
});
test('Trung Thu đăng ký đúng và giữ hiệu ứng công bố Mặc định', () => {
  assert.equal(resolveTheme('mid-autumn'), 'mid-autumn');
  assert.equal(themes['mid-autumn'].effect, themes.default.effect);
  assert.equal(themes['mid-autumn'].art, themes.default.art);
  const palette = themes['mid-autumn'].colors;
  for (const count of [1, 4, 13]) {
    for (let index=0; index<count; index++) {
      assert.equal(pointerColor(360-(index+.5)*360/count,count,palette),palette[index%palette.length]);
    }
  }
  assert.equal(pointerColor(0,0,palette),'#a79bac');
});
test('kim theo đúng ô khi quay nhiều vòng, quay ngược và tại biên', () => {
  assert.equal(pointedIndex(0, 4), 0);
  assert.equal(pointedIndex(45, 4), 3);
  assert.equal(pointedIndex(90, 4), 3);
  assert.equal(pointedIndex(135 + 360*6, 4), 2);
  assert.equal(pointedIndex(-135, 4), 1);
  assert.equal(pointedIndex(360, 4), 0);
});
test('màu kim theo ô của từng lượt, lặp bảng màu và xử lý danh sách rỗng', () => {
  const palette = themes.christmas.colors;
  assert.equal(pointedIndex(30, 0), -1);
  assert.equal(pointerColor(30, 0, palette), '#a79bac');
  assert.equal(pointerColor(2000, 1, palette), palette[0]);
  for (let i=0; i<15; i++) {
    assert.equal(pointerColor(360-(i+.5)*360/15,15,palette), palette[i%palette.length]);
  }
});
