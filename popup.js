/* Quick Crop & Export – popup.js */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const canvas = $("#canvas");
  const ctx = canvas.getContext("2d");
  const dropzone = $("#dropzone");
  const fileInput = $("#fileInput");
  const ratioSelect = $("#ratioSelect");
  const customFields = $("#customRatioFields");
  const ratioW = $("#ratioW");
  const ratioH = $("#ratioH");
  const applyCustom = $("#applyCustom");
  const formatSel = $("#format");
  const quality = $("#quality");
  const qualityVal = $("#qualityVal");
  const filename = $("#filename");
  const fitBtn = $("#fit");
  const centerBtn = $("#center");
  const dlBtn = $("#download");
  const sizeReadout = $("#sizeReadout");
  const dzText = $("#dzText");

  let img = new Image();
  let imgURL = null;
  img.onload = () => {
    setupCanvas();
    initCrop("initial");
    draw();
    dlBtn.disabled = false;
    dzText.textContent = "Loaded: " + (img.name || "image");
  };

  // Display scale management
  let view = { w: 0, h: 0, scale: 1 };
  // Crop rect in view coordinates
  let crop = { x:0, y:0, w:0, h:0 };
  let aspect = { w: 0, h: 0, mode: "original" };

  function setAspectFromSelect() {
    const v = ratioSelect.value;
    if (v === "custom") {
      customFields.classList.remove("hidden");
      return;
    }
    customFields.classList.add("hidden");
    if (v === "original") {
      aspect = { w: 0, h: 0, mode:"original" };
    } else {
      const [aw, ah] = v.split(":").map(Number);
      aspect = { w: aw, h: ah, mode:"fixed" };
    }
    fitCropToAspect();
    draw();
  }

  function applyCustomRatio() {
    const aw = Math.max(1, parseInt(ratioW.value || "1",10));
    const ah = Math.max(1, parseInt(ratioH.value || "1",10));
    aspect = { w: aw, h: ah, mode: "fixed" };
    ratioSelect.value = "custom";
    fitCropToAspect();
    draw();
  }

  ratioSelect.addEventListener("change", setAspectFromSelect);
  applyCustom.addEventListener("click", applyCustomRatio);

  function setupCanvas() {
    // Fit image into a reasonable viewport width
    const maxW = 740;
    const maxH = 520;
    const sw = img.naturalWidth;
    const sh = img.naturalHeight;
    const scale = Math.min(maxW / sw, maxH / sh, 1);
    view.w = Math.round(sw * scale);
    view.h = Math.round(sh * scale);
    view.scale = scale;
    canvas.width = view.w;
    canvas.height = view.h;
  }

  function initCrop(mode) {
    // default aspect: original
    if (mode === "initial") {
      aspect = aspect.mode ? aspect : { w:0, h:0, mode: "original" };
    }
    // Start with 80% of the shorter dimension
    let cw, ch;
    if (aspect.mode === "fixed") {
      const r = aspect.w / aspect.h;
      const fitW = view.w * 0.86;
      const fitH = view.h * 0.86;
      if (fitW / fitH > r) {
        ch = fitH;
        cw = ch * r;
      } else {
        cw = fitW;
        ch = cw / r;
      }
    } else {
      // original image aspect
      const r = img.naturalWidth / img.naturalHeight;
      const fitW = view.w * 0.86;
      const fitH = view.h * 0.86;
      if (fitW / fitH > r) {
        ch = fitH;
        cw = ch * r;
      } else {
        cw = fitW;
        ch = cw / r;
      }
    }
    crop.w = Math.round(cw);
    crop.h = Math.round(ch);
    crop.x = Math.round((view.w - crop.w) / 2);
    crop.y = Math.round((view.h - crop.h) / 2);
    updateSizeReadout();
  }

  function fitCropToAspect() {
    const cx = crop.x + crop.w/2;
    const cy = crop.y + crop.h/2;
    let cw, ch;
    if (aspect.mode === "fixed") {
      const r = aspect.w / aspect.h;
      // keep current area but adjust shape within bounds
      const maxW = view.w * 0.98;
      const maxH = view.h * 0.98;
      // start from current height
      ch = Math.min(crop.h, maxH);
      cw = ch * r;
      if (cw > maxW) {
        cw = maxW;
        ch = cw / r;
      }
    } else {
      // original image aspect
      const r = img.naturalWidth / img.naturalHeight;
      const maxW = view.w * 0.98;
      const maxH = view.h * 0.98;
      ch = Math.min(crop.h, maxH);
      cw = ch * r;
      if (cw > maxW) {
        cw = maxW;
        ch = cw / r;
      }
    }
    crop.w = Math.round(cw);
    crop.h = Math.round(ch);
    crop.x = Math.max(0, Math.min(view.w - crop.w, Math.round(cx - crop.w/2)));
    crop.y = Math.max(0, Math.min(view.h - crop.h, Math.round(cy - crop.h/2)));
    updateSizeReadout();
  }

  function draw() {
    // image
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0,0, view.w, view.h);

    // darken outside crop
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0,0,view.w, crop.y);
    ctx.fillRect(0, crop.y+crop.h, view.w, view.h - (crop.y+crop.h));
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    ctx.fillRect(crop.x+crop.w, crop.y, view.w-(crop.x+crop.w), crop.h);
    ctx.restore();

    // draw crop rect
    ctx.save();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x+0.5, crop.y+0.5, crop.w, crop.h);

    // thirds grid
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    for (let i=1;i<=2;i++){
      const gx = crop.x + (crop.w/3)*i;
      const gy = crop.y + (crop.h/3)*i;
      ctx.beginPath(); ctx.moveTo(gx, crop.y); ctx.lineTo(gx, crop.y+crop.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(crop.x, gy); ctx.lineTo(crop.x+crop.w, gy); ctx.stroke();
    }
    // corner handles
    drawHandle(crop.x, crop.y);
    drawHandle(crop.x+crop.w, crop.y);
    drawHandle(crop.x, crop.y+crop.h);
    drawHandle(crop.x+crop.w, crop.y+crop.h);
    ctx.restore();
  }

  function drawHandle(x,y) {
    const s = 8;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(Math.round(x - s/2)+0.5, Math.round(y - s/2)+0.5, s, s);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Pointer interactions
  const State = { Idle:0, Drag:1, Resize:2 };
  let ui = {
    state: 0, // Idle
    handle: "", // 'nw','ne','sw','se'
    start: { x:0, y:0, crop:{} }
  };

  function hitHandle(px,py) {
    const s = 10;
    const corners = [
      {id:"nw", x:crop.x, y:crop.y},
      {id:"ne", x:crop.x+crop.w, y:crop.y},
      {id:"sw", x:crop.x, y:crop.y+crop.h},
      {id:"se", x:crop.x+crop.w, y:crop.y+crop.h},
    ];
    for (const c of corners) {
      if (Math.abs(px - c.x) <= s && Math.abs(py - c.y) <= s) return c.id;
    }
    return "";
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (!img.naturalWidth) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const handle = hitHandle(px,py);
    if (handle) {
      ui.state = State.Resize;
      ui.handle = handle;
    } else if (px >= crop.x && px <= crop.x+crop.w && py >= crop.y && py <= crop.y+crop.h) {
      ui.state = State.Drag;
    } else {
      // click outside recenters crop around pointer
      const cx = Math.round(px - crop.w/2);
      const cy = Math.round(py - crop.h/2);
      crop.x = clamp(cx, 0, view.w - crop.w);
      crop.y = clamp(cy, 0, view.h - crop.h);
      draw(); updateSizeReadout();
      return;
    }
    ui.start.x = px; ui.start.y = py;
    ui.start.crop = { ...crop };
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!img.naturalWidth) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (ui.state === State.Drag) {
      const dx = px - ui.start.x;
      const dy = py - ui.start.y;
      crop.x = clamp(ui.start.crop.x + dx, 0, view.w - crop.w);
      crop.y = clamp(ui.start.crop.y + dy, 0, view.h - crop.h);
      draw(); updateSizeReadout();
    } else if (ui.state === State.Resize) {
      resizeFromHandle(px, py);
      draw(); updateSizeReadout();
    } else {
      // cursor feedback
      const h = hitHandle(px,py);
      canvas.style.cursor = h ? "nwse-resize" : (px >= crop.x && px <= crop.x+crop.w && py >= crop.y && py <= crop.y+crop.h) ? "grab" : "default";
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    ui.state = State.Idle;
    ui.handle = "";
    canvas.releasePointerCapture(e.pointerId);
  });

  function resizeFromHandle(px, py) {
    const keepRatio = aspect.mode === "fixed" ? (aspect.w / aspect.h) :
                      (img.naturalWidth / img.naturalHeight);
    // base on start crop
    let { x, y, w, h } = ui.start.crop;
    const minSize = 24;

    if (ui.handle === "nw" || ui.handle === "se") {
      // diagonal consistent ratio
      const cx = (ui.handle === "nw") ? x + w : x;
      const cy = (ui.handle === "nw") ? y + h : y;
      let newW = Math.abs(px - cx);
      let newH = newW / keepRatio;
      if (Math.abs(py - cy) < newH) newH = Math.abs(py - cy), newW = newH * keepRatio;
      if (ui.handle === "nw") {
        x = cx - newW; y = cy - newH; w = newW; h = newH;
      } else {
        w = newW; h = newH;
      }
    } else if (ui.handle === "ne" || ui.handle === "sw") {
      const cx = (ui.handle === "ne") ? x : x + w;
      const cy = (ui.handle === "ne") ? y + h : y;
      let newW = Math.abs(px - cx);
      let newH = newW / keepRatio;
      if (Math.abs(py - cy) < newH) newH = Math.abs(py - cy), newW = newH * keepRatio;
      if (ui.handle === "ne") {
        x = x; y = cy - newH; w = newW; h = newH;
      } else {
        x = cx - newW; y = y; w = newW; h = newH;
      }
    }

    // clamp to view
    if (w < minSize || h < minSize) { w = Math.max(w, minSize); h = Math.max(h, minSize); }
    if (x < 0) { const dx = -x; x = 0; w -= dx; h = w / keepRatio; }
    if (y < 0) { const dy = -y; y = 0; h -= dy; w = h * keepRatio; }
    if (x + w > view.w) { const dx = (x + w) - view.w; w -= dx; h = w / keepRatio; }
    if (y + h > view.h) { const dy = (y + h) - view.h; h -= dy; w = h * keepRatio; }

    crop.x = Math.round(x); crop.y = Math.round(y);
    crop.w = Math.round(w); crop.h = Math.round(h);
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Buttons
  fitBtn.addEventListener("click", () => { initCrop("fit"); draw(); });
  centerBtn.addEventListener("click", () => {
    crop.x = Math.round((view.w - crop.w)/2);
    crop.y = Math.round((view.h - crop.h)/2);
    draw();
  });

  // Format/quality UI
  formatSel.addEventListener("change", () => {
    const isLossy = (formatSel.value === "image/jpeg" || formatSel.value === "image/webp");
    $("#qualityField").style.opacity = isLossy ? "1" : "0.5";
  });
  quality.addEventListener("input", () => { qualityVal.textContent = quality.value; });

  // Download
  dlBtn.addEventListener("click", () => {
    if (!img.naturalWidth) return;
    const scale = 1 / view.scale;
    const sx = Math.round(crop.x * scale);
    const sy = Math.round(crop.y * scale);
    const sw = Math.round(crop.w * scale);
    const sh = Math.round(crop.h * scale);

    const out = document.createElement("canvas");
    out.width = sw; out.height = sh;
    const octx = out.getContext("2d");
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const type = formatSel.value;
    const q = (type === "image/png") ? 1.0 : (parseInt(quality.value,10)/100);
    out.toBlob((blob) => {
      const ext = type === "image/png" ? "png" : (type === "image/jpeg" ? "jpg" : "webp");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (filename.value || "crop") + "." + ext;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
    }, type, q);
  });

  function updateSizeReadout() {
    const scale = 1 / view.scale;
    const w = Math.round(crop.w * scale);
    const h = Math.round(crop.h * scale);
    sizeReadout.textContent = `${w} × ${h}px`;
  }

  // File load: input
  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      loadFile(file);
    }
  });

  // Drag-drop
  ;["dragenter","dragover"].forEach(ev => dropzone.addEventListener(ev, (e)=>{
    e.preventDefault(); e.stopPropagation();
    dropzone.classList.add("drag");
  }));
  ;["dragleave","drop"].forEach(ev => dropzone.addEventListener(ev, (e)=>{
    e.preventDefault(); e.stopPropagation();
    if (ev==="drop") {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) {
        const file = dt.files[0];
        if (file.type.startsWith("image/")) {
          loadFile(file);
        } else {
          alert("Drop an image file, not a URL.");
        }
      } else {
        alert("Drop an image file from your computer.");
      }
    }
    dropzone.classList.remove("drag");
  }));

  function loadFile(file) {
    if (imgURL) URL.revokeObjectURL(imgURL);
    imgURL = URL.createObjectURL(file);
    img = new Image();
    img.onload = () => {
      img.name = file.name;
      setupCanvas();
      initCrop("initial");
      draw();
      dlBtn.disabled = false;
      dzText.textContent = "Loaded: " + (img.name || "image");
    };
    img.src = imgURL;
  }

  // Start with blank state
  dlBtn.disabled = true;
  $("#qualityField").style.opacity = "0.5";
})();
