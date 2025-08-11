# Quick Crop & Export

Drag and drop an image, crop to a fixed aspect ratio, then download as PNG, JPG, or WebP. All client-side.

## Features

- Drag-and-drop or file picker
- Presets: 1:1, 16:9, 4:3, 3:2, 7:4, 9:16, plus custom
- Locked-ratio resize with corner handles
- Move crop by dragging, click outside to recenter
- Fit and Center controls
- Export to PNG (lossless), JPG, or WebP with quality
- Full-resolution output from the source image

## Install

### Load unpacked (dev)

1. Download or clone the repo.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the folder with `manifest.json`.

### Web Store (unlisted/private)

1. Zip the extension folder (with `manifest.json` at root).
2. Upload in the Chrome Developer Dashboard.
3. Set **Visibility** to **Unlisted** or **Private**.
4. Install from the store URL on permitted accounts.

## Usage

1. Click the extension icon.
2. Drop an image into the dropzone or choose a file.
3. Select an aspect ratio or choose **Custom…**.
4. Drag to move. Resize with corner handles.
5. Select format and quality (JPG/WebP).
6. Click **Download**.

## Privacy and permissions

- No permissions requested.
- No network calls.
- Images stay in memory and are not uploaded.

## Project structure

```
/ (extension root)
├─ manifest.json
├─ popup.html
├─ popup.css
├─ popup.js
├─ icon-16.png
├─ icon-32.png
├─ icon-48.png
└─ icon-128.png
```

## Customization

### Aspect ratios

Edit `<select id="ratioSelect">` in `popup.html`.  
Custom logic lives in `applyCustomRatio()` in `popup.js`.

### Popup width

```css
/* popup.css */
html,
body {
	min-width: 780px;
}
.wrap {
	width: 100%;
	max-width: 780px;
} /* avoid 100vw */
```

### Larger dropzone

```css
/* popup.css */
.dropzone {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: clamp(160px, 35vh, 320px);
	width: 100%;
	border: 1px dashed #3a4059;
	border-radius: 10px;
	padding: 12px;
	text-align: center;
	color: var(--muted);
	cursor: pointer;
}
```

## Controls

- Move: drag inside the crop
- Resize: drag corner handles
- Recenter: click outside the crop
- Fit: fit crop to current ratio
- Center: center the crop

## Notes and limits

- Local files only by design. Dropping URLs is blocked.
- Output dimensions match the source pixels in the crop.
- Quality affects JPG/WebP only. PNG ignores quality.
- Metadata is not preserved.

## Troubleshooting

- Popup is narrow: use the `min-width` rule and reload.
- Download disabled: load an image first.
- Preview looks soft: preview is scaled; export uses full resolution.

## Development

- Manifest V3. Action popup only.
- No background or external deps.
- Edit HTML/CSS/JS and reload in `chrome://extensions`.

## Roadmap

- Zoom and pan
- Freeform crop and rotation
- Keyboard nudging and snapping
- EXIF orientation handling toggle
- Preset output sizes

## Changelog

- **1.0.0** — initial release

## License

MIT © R3HAB MEDIA Web Tools
