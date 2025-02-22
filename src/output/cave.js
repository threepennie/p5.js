let ridges = [];
const numRidges = 300;         // 渓谷を構成する線の本数（縦リッジ）
const pointsPerRidge = 100;    // 1本あたりの点数
let t = 0;

// 背景用ノイズ：ピンクノイズ
let pinkNoise;
// グリッチ音用ノイズ（白ノイズをバンドパスフィルタ経由）
let glitchNoise, glitchFilter;

function setup() {
  // ブラウザウィンドウ全体にキャンバスを作成
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  document.body.style.margin = '0';
  
  colorMode(HSB, 360, 100, 100, 100);
  noFill();
  
  // 渓谷を構成する「リッジ」群を生成（縦方向の線）
  // 各リッジは、固定の x 座標（画面横幅の 10%～90%）に沿って、
  // y 座標は画面上部から下部（10%～90%）まで線形に配置
  for (let i = 0; i < numRidges; i++) {
    let ridge = [];
    let baseX = map(i, 0, numRidges - 1, width * 0.1, width * 0.9);
    for (let j = 0; j < pointsPerRidge; j++) {
      let y = map(j, 0, pointsPerRidge - 1, height * 0.1, height * 0.9);
      ridge.push({ baseX: baseX, y: y });
    }
    ridges.push(ridge);
  }
  
  // 背景ノイズ：ピンクノイズ（平常時音量 0.2）
  pinkNoise = new p5.Noise('pink');
  pinkNoise.amp(0.2);
  pinkNoise.start();
  
  // グリッチ音用ノイズ：白ノイズをバンドパスフィルタ経由で使用
  glitchNoise = new p5.Noise('white');
  glitchNoise.disconnect();  // デフォルト出力を切断
  glitchFilter = new p5.BandPass();
  glitchFilter.freq(1000);
  glitchNoise.connect(glitchFilter);
  glitchNoise.amp(0);
  glitchNoise.start();
}

function draw() {
  // 背景グラデーション描画
  drawGradientBackground();
  
  // --- グリッチ効果（控えめな縦線） ---
  // 背景直後に、極めて控えめなグリッチ線を描画してコンセプチュアルな印象に
  updateGlitchVisual();
  
  // 渓谷（canyon）の縦リッジを描画
  push();
  // 全体に薄い blur を適用して幻想的に
  drawingContext.filter = 'blur(1px)';
  stroke(0, 0, 100, 70);  // 白（HSB: 彩度0、明度100）、控えめな透明度
  strokeWeight(1);
  
  for (let ridge of ridges) {
    beginShape();
    for (let pt of ridge) {
      let flicker = map(noise(pt.baseX * 0.005, t), 0, 1, -5, 5);
      vertex(pt.baseX + flicker, pt.y);
    }
    endShape();
  }
  pop();
  
  t += 0.01;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
 * グラデーション背景を描画
 * 上部は明るめ（オレンジ寄り）、下部は暗めに
 */
function drawGradientBackground() {
  push();
  noStroke();
  for (let i = 0; i < height; i++) {
    let inter = i / height;
    let b = map(inter, 0, 1, 20, 0);
    fill(30, 50, b); // オレンジ寄りの色味
    rect(0, i, width, 1);
  }
  pop();
}

/**
 * 控えめでミニマルなグリッチ効果（縦線）を描画し、
 * そのタイミングに合わせてノイズ音を発生させる
 */
function updateGlitchVisual() {
  // 10%の確率でグリッチ効果を発生
  if (random() < 0.1) {
    push();
    // 描画コンテキストにごくわずかな blur を適用
    drawingContext.filter = 'blur(1px)';
    // 線の色は白、透明度は非常に低く
    stroke(0, 0, 100, 10);
    strokeWeight(random(0.5, 1)); // 非常に細い線
    // 縦方向の線：画面の左右の内側にランダムな位置
    let x = random(width * 0.1, width * 0.9);
    line(x, 0, x, height);
    pop();
    
    triggerGlitchSound();
  }
}

/**
 * グリッチ線の描画に合わせ、短いノイズ音をトリガーする
 */
function triggerGlitchSound() {
  let burstAmp = random(0.05, 0.1);
  glitchNoise.amp(burstAmp, 0.01);
  glitchNoise.amp(0, 0.2);
}

/**
 * マウスが押された時、ピンクノイズの音量を上げる
 */
function mousePressed() {
  pinkNoise.amp(0.3, 0.5);
}

/**
 * マウスが離された時、ピンクノイズの音量を戻す
 */
function mouseReleased() {
  pinkNoise.amp(0.2, 0.5);
}
