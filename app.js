(() => {
  const $ = (id) => document.getElementById(id);
  const number = (id) => {
    const value = Number($(id).value);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  };
  const money = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(value);
  const couponType = $('couponType');
  const couponValue = $('couponValue');
  const couponValueField = $('couponValueField');
  const couponValueLabel = $('couponValueLabel');
  const couponPrefix = $('couponPrefix');
  const shareField = $('restaurantShareField');

  function getFunding() {
    return document.querySelector('input[name="funding"]:checked')?.value || 'restaurant';
  }

  function updateControls() {
    const type = couponType.value;
    couponValueField.classList.toggle('hidden', type === 'none');
    if (type === 'percent') {
      couponValueLabel.textContent = 'कूपन की छूट (%)';
      couponPrefix.textContent = '%';
      couponValue.max = '100';
    } else {
      couponValueLabel.textContent = 'कूपन की रकम (₹)';
      couponPrefix.textContent = '₹';
      couponValue.removeAttribute('max');
    }
    shareField.classList.toggle('hidden', getFunding() !== 'shared');
    calculate();
  }

  function calculate() {
    const menu = number('menuPrice');
    const rawCoupon = number('couponValue');
    const minOrder = number('minOrder');
    const food = number('foodCost');
    const pack = number('packCost');
    const kitchen = number('kitchenCost');
    const fee = number('platformFee');
    const other = number('otherCost');
    const tax = number('taxReserve');
    const type = couponType.value;
    const eligible = menu >= minOrder;
    let coupon = 0;
    if (eligible && type === 'flat') coupon = Math.min(menu, rawCoupon);
    if (eligible && type === 'percent') coupon = Math.min(menu, menu * Math.min(rawCoupon, 100) / 100);
    const funding = getFunding();
    const share = Math.min(100, number('restaurantShare')) / 100;
    let restaurantDiscount = 0;
    if (funding === 'restaurant') restaurantDiscount = coupon;
    if (funding === 'shared') restaurantDiscount = coupon * share;

    const costs = food + pack + kitchen + fee + other + tax;
    const netSales = menu - restaurantDiscount;
    const contribution = netSales - costs;
    const margin = netSales > 0 ? (contribution / netSales) * 100 : 0;

    $('rMenu').textContent = money(menu);
    $('rCoupon').textContent = '−' + money(coupon);
    $('rRestaurantDiscount').textContent = '−' + money(restaurantDiscount);
    $('rNetSales').textContent = money(netSales);
    $('rCosts').textContent = money(costs);
    $('rMargin').textContent = (Number.isFinite(margin) ? margin : 0).toFixed(1) + '%';
    $('profitValue').textContent = money(contribution);

    const panel = $('profitPanel');
    const status = $('statusMessage');
    panel.classList.toggle('negative', contribution < 0);
    if (contribution < 0) {
      $('profitCaption').textContent = 'अनुमानित घाटा';
      $('profitSub').textContent = 'आपके दर्ज खर्च के हिसाब से यह ऑर्डर घाटे में है।';
      status.className = 'status-message negative';
      status.textContent = 'सावधान: इस हिसाब में प्रति ऑर्डर खर्च बिक्री से ज्यादा है। छूट या लागत बदलकर फिर देखें।';
    } else if (contribution === 0) {
      $('profitCaption').textContent = 'ब्रेक-ईवन';
      $('profitSub').textContent = 'दर्ज खर्च निकल रहे हैं, लेकिन अतिरिक्त योगदान नहीं बच रहा।';
      status.className = 'status-message neutral';
      status.textContent = 'इस अनुमान में न योगदान बच रहा है, न घाटा है। Fixed खर्च अभी शामिल नहीं भी हो सकते हैं।';
    } else {
      $('profitCaption').textContent = 'अनुमानित योगदान';
      $('profitSub').textContent = 'दर्ज खर्च और रेस्टोरेंट की छूट के बाद बची रकम।';
      status.className = 'status-message positive';
      status.textContent = eligible || type === 'none'
        ? 'इस अनुमान में खर्च निकालने के बाद रकम बच रही है। Fixed खर्च अलग से जाँचें।'
        : 'कूपन लागू नहीं हुआ क्योंकि ऑर्डर न्यूनतम ऑर्डर वैल्यू से कम है।';
    }
    if (!eligible && type !== 'none') {
      $('rCoupon').textContent = 'लागू नहीं';
      $('rRestaurantDiscount').textContent = '₹0.00';
    }
  }

  couponType.addEventListener('change', updateControls);
  document.querySelectorAll('input[name="funding"]').forEach(el => el.addEventListener('change', updateControls));
  document.querySelectorAll('input, select').forEach(el => {
    if (el.id !== 'couponType') el.addEventListener('input', calculate);
  });
  $('calculateBtn').addEventListener('click', calculate);
  $('resetBtn').addEventListener('click', () => {
    $('menuPrice').value = 199; $('couponType').value = 'flat'; $('couponValue').value = 80; $('minOrder').value = 149;
    document.querySelector('input[name="funding"][value="restaurant"]').checked = true;
    $('restaurantShare').value = 50; $('foodCost').value = 30; $('packCost').value = 8; $('kitchenCost').value = 7;
    $('platformFee').value = 25; $('otherCost').value = 0; $('taxReserve').value = 0;
    updateControls();
  });
  document.querySelectorAll('.preset').forEach(button => {
    button.addEventListener('click', () => {
      $('menuPrice').value = button.dataset.price; $('couponType').value = 'flat';
      $('couponValue').value = button.dataset.discount; $('minOrder').value = button.dataset.min;
      updateControls();
      $('profitPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // PWA install button: shown only when the browser supports install prompting.
  // let deferredInstallPrompt = null;
  // const installBtn = $('installBtn');
  // window.addEventListener('beforeinstallprompt', (event) => {
  //   event.preventDefault();
  //   deferredInstallPrompt = event;
  //   installBtn.hidden = false;
  // });
  // installBtn.addEventListener('click', async () => {
  //   if (!deferredInstallPrompt) return;
  //   deferredInstallPrompt.prompt();
  //   await deferredInstallPrompt.userChoice;
  //   deferredInstallPrompt = null;
  //   installBtn.hidden = true;
  // });
  // window.addEventListener('appinstalled', () => {
  //   installBtn.hidden = true;
  // });

  function updateOnlineStatus() {
    $('offlineBanner').hidden = navigator.onLine;
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // Service workers require HTTPS or localhost. File:// opening still works as a normal calculator.
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.error('PWA service worker registration failed:', error);
      });
    });
  }
  updateControls();
})();