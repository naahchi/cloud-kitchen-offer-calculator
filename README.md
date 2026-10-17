# Cloud Kitchen Offer & Profit Calculator — PWA v2

मोबाइल और PC के लिए responsive Progressive Web App (PWA)। HTML, CSS और JavaScript में बना है।

## क्या नया है?

- `manifest.webmanifest` जोड़ा गया — ऐप का नाम, standalone display और icons
- `sw.js` service worker — app shell cache करता है ताकि एक बार लोड होने के बाद ऐप offline भी खुल सके
- `favicon.svg` और 192×192, 512×512 PNG app icons
- PWA install button — केवल compatible browser में install prompt उपलब्ध होने पर दिखता है
- Offline indicator
- GitHub Pages के लिए relative paths (`./`) ताकि repository project subfolder में भी चले

## Local preview

PWA install/service worker test करने के लिए सिर्फ `index.html` पर double-click न करें; `file://` पर service worker काम नहीं करता। इनमें से कोई तरीका इस्तेमाल करें:

### GitHub Pages (आसान तरीका)
1. ZIP extract करें और सभी files/folder GitHub repository में upload करें।
2. Settings → Pages → Deploy from a branch → `main` → `/ (root)` चुनें।
3. बने हुए HTTPS Pages URL को Chrome/Edge में खोलें।
4. Browser के address bar में install icon या menu में **Install page as app / Install Cloud Kitchen Calculator** चुनें। Supported browser में पेज पर **ऐप इंस्टॉल करें** बटन भी दिख सकता है।

### Local server
अगर आपके PC पर Python है, project folder में terminal खोलकर चलाएँ:
`python -m http.server 8000`
फिर `http://localhost:8000` खोलें। Localhost पर service worker test हो सकता है।

## GitHub Pages deploy

Repository में ये files/folder upload करें:
- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `favicon.svg`
- `icons/`
- `README.md`
- `strategy-notes.md`

फिर Settings → Pages में branch deploy चालू करें। GitHub Pages HTTPS उपलब्ध कराता है, जो PWA install और service worker के लिए जरूरी है।

## Calculator model

`Estimated contribution = menu value - restaurant-funded discount - entered costs`

Entered costs = food + packaging + kitchen + platform fee + other + tax/fee reserve.

Platform-funded discount option में calculator restaurant discount को ₹0 मानता है। इसे तभी चुनें जब settlement/offer terms पुष्टि करें कि discount का पूरा हिस्सा platform वहन कर रहा है। Shared funding में restaurant share (%) लागू होता है।

## Troubleshooting

- Install button हर browser में नहीं दिखता; Chrome/Edge का app install menu भी इस्तेमाल करें।
- PWA के लिए HTTPS या `localhost` जरूरी है। `file://` से सामान्य calculator चलेगा, लेकिन service worker/offline caching/install सुविधा नहीं।
- नई version deploy करने पर service worker cache version `sw.js` में बदला गया है (`v2`)। अगर पुराना page दिखे, browser reload करें या site data/cache clear करके दोबारा खोलें।
- Google Fonts online connection पर लोड होते हैं; offline में system fallback fonts इस्तेमाल होंगे।

## Important limitations

यह planning estimate है, accounting/tax tool नहीं। वास्तविक settlement में commission slabs, fees, fee पर GST, tax treatment, cancellation/refund और अन्य contractual adjustments हो सकते हैं। Fixed expenses शामिल नहीं हैं जब तक दर्ज न किए जाएँ।
