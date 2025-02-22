let dots = [];
const numDots = 10000; // 点の数を10000に増加
let t = 0;
let rotation = 0;

// ピンクノイズ（背景用）
let pinkNoise;
// グリッチ音用のノイズ（線の表示に合わせて発生）
let glitchNoise, glitchFilter;

function setup() {
  // ブラウザウィンドウいっぱいにキャンバスを作成
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  document.body.style.margin = '0';
  
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  
  // 背景ノイズ：ピンクノイズ
  pinkNoise = new p5.Noise('pink');
  pinkNoise.amp(0.2);    // 平常時の音量 0.2
  pinkNoise.start();
  
  // グリッチ音用ノイズ：今回は白ノイズを使用
  glitchNoise = new p5.Noise('white');
  glitchNoise.disconnect();  // デフォルト出力を切断
  // バンドパスフィルタを使って音色を調整（ここでは比較的広い帯域で）
  glitchFilter = new p5.BandPass();
  glitchFilter.freq(1000);
  glitchNoise.connect(glitchFilter);
  glitchNoise.amp(0);
  glitchNoise.start();
  
  // ウロボロスの基本パラメータ
  let baseR = min(width, height) * 0.45;
  let amp = baseR * 0.1;
  let freq = 3;
  
  // 円上に点を配置（各点に点滅と変動用位相を保持）
  for (let i = 0; i < numDots; i++) {
    let angle = random(0, TWO_PI);
    let blinkPhase = random(0, TWO_PI);
    let rPhase = random(0, TWO_PI);
    dots.push({ angle, blinkPhase, rPhase, freq, baseR, amp });
  }
}

function draw() {
  // グラデーション背景描画
  drawGradientBackground();
  
  // キャンバス中心に移動し、ゆっくり回転
  translate(width / 2, height / 2);
  rotation -= 0.0002;
  rotate(rotation);
  
  // 点描の描画（各点に個別のhalo付き）
  for (let dot of dots) {
    let r = dot.baseR + dot.amp * sin(dot.freq * dot.angle + dot.rPhase);
    let x = r * cos(dot.angle);
    let y = r * sin(dot.angle);
    
    let bri = map(sin(t + dot.blinkPhase), -1, 1, 30, 100);
    
    // 各点のhalo（前バージョンの個別halo）
    fill(0, 0, bri, 20);
    ellipse(x, y, 10, 10);
    
    // メインのドット
    fill(0, 0, bri);
    ellipse(x, y, 4, 4);
  }
  
  t += 0.02;
  
  // グリッチ効果の描画（線を複数生成、滲ませる）
  updateGlitchVisual();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
 * マウス押下時、ピンクノイズの音量を上げる
 */
function mousePressed() {
  pinkNoise.amp(0.3, 0.5);
}

/**
 * マウス解放時、ピンクノイズの音量を戻す
 */
function mouseReleased() {
  pinkNoise.amp(0.2, 0.5);
}

/**
 * 毎フレーム、複数の白いグリッチ線をランダムに生成し、
 * 線の表示に合わせてグリッチノイズ音をトリガーする
 */
function updateGlitchVisual() {
  // 20%の確率でグリッチ効果発生
  if (random() < 0.2) {
    // 同時に描画する線の本数をランダムに（例：3～7本）
    let count = floor(random(3, 8));
    for (let i = 0; i < count; i++) {
      push();
      // 線を滲ませるためにblurフィルターを適用
      drawingContext.filter = 'blur(3px)';
      
      // ランダムな位置・長さ・太さ
      let glitchY = random(-height/2, height/2);
      let x1 = random(-width/2, width/2);
      let x2 = x1 + random(20, 100);
      let thickness = random(1, 5);
      
      // 線の色は白（HSBでは、彩度0・明度100）
      stroke(0, 0, 100, random(30, 70));
      strokeWeight(thickness);
      line(x1, glitchY, x2, glitchY);
      pop();
      
      // 線の描画に合わせてノイズ音を発生
      triggerGlitchSound();
    }
  }
}

/**
 * グリッチ線の描画に合わせて、短いノイズ音をトリガーする
 */
function triggerGlitchSound() {
  // ノイズのバースト音量をランダムに設定（例：0.05～0.1）
  let burstAmp = random(0.05, 0.1);
  glitchNoise.amp(burstAmp, 0.01);
  glitchNoise.amp(0, 0.2);
}

/**
 * キャンバス中心から外側にかけて明るさが徐々に落ちるグラデーション背景を描画
 */
function drawGradientBackground() {
  background(0);
  push();
  translate(width / 2, height / 2);
  noStroke();
  
  let steps = 150;
  let maxRadius = dist(0, 0, width / 2, height / 2);
  for (let i = steps; i > 0; i--) {
    let inter = i / steps;
    let brightness = map(inter, 0, 1, 10, 0);
    let c = color(0, 0, brightness);
    fill(c);
    ellipse(0, 0, inter * maxRadius * 2, inter * maxRadius * 2);
  }
  pop();
}
