// Product catalogue fallback; live products are loaded from the API when available.
window.PeakProducts = (() => {
  const fallback = [
    [1,15000,5000,60,"⚡"],[2,30000,10000,45,"🔋"],[3,60000,20000,30,"☀️"],
    [4,120000,30000,15,"🔧"],[5,250000,62500,15,"⚙️"],[6,500000,125000,15,"🔌"],
    [7,1000000,250000,10,"🛠️"],[8,1500000,500000,10,"🔩"],[9,2000000,750000,10,"🏭"],
    [10,1000000,250000,30,"⚡"]
  ];
  const format = value => Number(value).toLocaleString("en-UG");
  function render(items) {
    const root = document.getElementById("productList");
    if (!root) return;
    root.innerHTML = items.map(item => {
      const number = Number(String(item.name || "").match(/\d+/)?.[0] || item.id);
      const price = Number(item.price_ugx), daily = Number(item.daily_income_ugx), days = Number(item.duration_days);
      const icon = fallback[number - 1]?.[4] || "⚙️";
      const name = String(item.name || ("Machine " + number)).replace(/[<>]/g, "");
      return '<article class="product"><div class="machine">' + icon + '</div><div><h3>' + name +
        '</h3><p>Price: <b>UGX ' + format(price) + '</b></p><p>Daily income: <b>UGX ' + format(daily) +
        '</b></p><p>Duration: ' + days + ' days</p><p>Total listed return: <b>UGX ' + format(daily * days) +
        '</b></p><button class="btn primary" data-action="buy" data-product="' + number + '">View details</button></div></article>';
    }).join("");
  }
  const fallbackItems = fallback.map(p => ({ id:p[0], name:"Machine " + p[0], price_ugx:p[1], daily_income_ugx:p[2], duration_days:p[3] }));
  return { render, fallbackItems, format };
})();
