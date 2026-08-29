const targets = [
  {
    id: "sushi",
    name: "Суші-сет на вечір",
    price: 499,
    desiredDiscount: 18,
    description: "Комфортна вечеря, де агент шукає промо, акції та альтернативні набори.",
    query: "суші сет",
    categoryHint: "Готові страви"
  },
  {
    id: "coffee",
    name: "Кава в зернах 1 кг",
    price: 729,
    desiredDiscount: 15,
    description: "Ідеально для демо з купонами, улюбленими товарами та замінами.",
    query: "кава в зернах 1 кг",
    categoryHint: "Кава"
  },
  {
    id: "steak",
    name: "Стейк + соуси",
    price: 845,
    desiredDiscount: 22,
    description: "Преміальний сценарій: гість хоче дорого, а агент має збити ціну.",
    query: "стейк",
    categoryHint: "М'ясо"
  },
  {
    id: "protein",
    name: "Фітнес-кошик",
    price: 1120,
    desiredDiscount: 20,
    description: "Раціон, білкові продукти, заміни й добір під бюджет через MCP.",
    query: "протеїнові продукти",
    categoryHint: "Здорове харчування"
  }
];

const mcpTools = [
  ["location", "silpo_find_address", "Знайти координати за текстом адреси."],
  ["location", "silpo_get_available_delivery_types", "Отримати доступні типи доставки для координат."],
  ["location", "silpo_list_branches", "Перелік магазинів і точок самовивозу."],
  ["location", "silpo_get_time_slots", "Отримати валідні слоти доставки для магазину.", ["cart"]],
  ["location", "silpo_find_nova_poshta_settlements", "Пошук населених пунктів Нової Пошти."],
  ["location", "silpo_find_nova_poshta_offices", "Отримати відділення або поштомати НП."],
  ["products", "silpo_find_products_batch", "Паралельний пошук товарів для списку покупок.", ["cart"]],
  ["products", "silpo_get_products", "Пошук товарів із фільтрами, акціями та пагінацією.", ["cart"]],
  ["products", "silpo_get_product_details", "Повна картка товару зі складом і атрибутами.", ["cart"]],
  ["products", "silpo_get_similar_products", "Схожі або альтернативні товари.", ["cart"]],
  ["products", "silpo_get_replacements", "Заміни для товарів, яких немає.", ["cart"]],
  ["products", "silpo_get_my_favorites", "Список улюблених товарів гостя."],
  ["products", "silpo_add_or_update_favorite_products", "Додати або прибрати товари з улюблених.", ["write"]],
  ["catalog", "silpo_get_promotions", "Активні акції та знижки у магазині.", ["cart"]],
  ["catalog", "silpo_get_popular_categories", "Популярні категорії у вибраному магазині.", ["cart"]],
  ["catalog", "silpo_get_category", "Деталі окремої категорії.", ["cart"]],
  ["catalog", "silpo_get_categories", "Плоский список усіх категорій магазину."],
  ["catalog", "silpo_get_categories_tree", "Повне дерево категорій.", ["cart"]],
  ["catalog", "silpo_get_product_sets", "Кураторські тематичні добірки."],
  ["cart", "silpo_get_my_shopping_cart", "Перший крок сесії: отримати активний cartId."],
  ["cart", "silpo_get_shopping_cart_by_id", "Повний стан кошика, сум, бонусів і checkout-посилань."],
  ["cart", "silpo_add_or_update_cart_products", "Додати товари або оновити кількість.", ["write"]],
  ["cart", "silpo_remove_cart_products", "Видалити конкретні товари з кошика.", ["write"]],
  ["cart", "silpo_clear_shopping_cart", "Очистити весь кошик.", ["write"]],
  ["cart", "silpo_update_shopping_cart", "Оновити адресу, слот, промокод, оплату чи бонуси.", ["write"]],
  ["cart", "silpo_add_or_update_certificates", "Додати або зняти подарункові сертифікати з кошика.", ["write"]],
  ["orders", "silpo_get_my_online_orders", "Історія онлайн-замовлень."],
  ["orders", "silpo_get_my_offline_orders", "Історія покупок у фізичних магазинах."],
  ["profile", "silpo_get_my_profile", "Ім'я, телефон, email, дата народження."],
  ["profile", "silpo_get_my_delivery_addresses", "Збережені адреси доставки."],
  ["profile", "silpo_get_my_family", "Дані про дітей і тварин у профілі."],
  ["profile", "silpo_get_my_food_restrictions", "Дієтичні обмеження та харчові вподобання."],
  ["loyalty", "silpo_get_loyalty_info", "Балабонуси, статус і баланс «Власного Рахунку»."],
  ["loyalty", "silpo_get_my_coupons", "Доступні купони гостя."],
  ["loyalty", "silpo_get_coupon_details", "Умови, товари та штрих-код купона."],
  ["loyalty", "silpo_get_my_promos", "Персональні промо-пропозиції."],
  ["loyalty", "silpo_get_promo_codes", "Активні промокоди гостя."],
  ["loyalty", "silpo_get_my_certificates", "Подарункові сертифікати."],
  ["loyalty", "silpo_get_my_premium_subscription", "Статус Silpo Premium."]
];

const flowSteps = [
  "Користувач відкриває квест і обирає товар, який хоче купити вигідніше.",
  "Фронтенд не ходить у сторонні API, а лише в свій proxy-шар для викликів MCP.",
  "Proxy піднімає `tools/list`, а потім збирає cart-first контекст через `silpo_get_my_shopping_cart` і `silpo_get_shopping_cart_by_id`.",
  "Після цього агент обов’язково валідує слот через `silpo_get_time_slots`, як вказано у docs.",
  "Далі запускаються пошук товарів, акцій, купонів, бонусів і фінальний сценарій оновлення кошика."
];

const questThresholds = [
  { taps: 0, label: "Starter", tools: ["tools/list"] },
  { taps: 25, label: "Promo Scout", tools: ["silpo_get_promotions"] },
  { taps: 100, label: "Coupon Raider", tools: ["silpo_get_my_coupons", "silpo_get_my_promos"] },
  { taps: 250, label: "Bonus Engineer", tools: ["silpo_get_loyalty_info", "silpo_get_similar_products"] },
  { taps: 500, label: "Checkout Boss", tools: ["silpo_update_shopping_cart"] }
];

const demoDelay = 260;

const state = {
  selectedTarget: targets[0],
  taps: 0,
  energy: 0,
  filter: "all",
  liveTools: null,
  proxyOnline: false,
  eventLog: []
};

const els = {
  targetGrid: document.querySelector("#target-grid"),
  toolsGrid: document.querySelector("#tools-grid"),
  flowGrid: document.querySelector("#flow-grid"),
  questSteps: document.querySelector("#quest-steps"),
  tapButton: document.querySelector("#tap-button"),
  tapCount: document.querySelector("#tap-count"),
  tapEnergy: document.querySelector("#tap-energy"),
  tapLevel: document.querySelector("#tap-level"),
  tapPowerLabel: document.querySelector("#tap-power-label"),
  heroTargetName: document.querySelector("#hero-target-name"),
  heroTargetDesc: document.querySelector("#hero-target-desc"),
  heroDiscount: document.querySelector("#hero-discount"),
  heroFinalPrice: document.querySelector("#hero-final-price"),
  heroProgressBar: document.querySelector("#hero-progress-bar"),
  pulseCopy: document.querySelector("#pulse-copy"),
  rewardDiscount: document.querySelector("#reward-discount"),
  rewardCopy: document.querySelector("#reward-copy"),
  strategyCopy: document.querySelector("#strategy-copy"),
  nextGoalCopy: document.querySelector("#next-goal-copy"),
  agentOutput: document.querySelector("#agent-output"),
  mcpStatus: document.querySelector("#mcp-status"),
  mcpEndpoint: document.querySelector("#mcp-endpoint"),
  proxyEndpoint: document.querySelector("#proxy-endpoint"),
  loadLiveTools: document.querySelector("#load-live-tools"),
  runAgent: document.querySelector("#run-agent"),
  eventLog: document.querySelector("#event-log"),
  logMode: document.querySelector("#log-mode")
};

class SilpoMCPClient {
  constructor(proxyEndpoint, silpoEndpoint) {
    this.proxyEndpoint = proxyEndpoint;
    this.silpoEndpoint = silpoEndpoint;
  }

  async rpc(method, params = {}) {
    const response = await fetch(this.proxyEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: this.silpoEndpoint,
        method,
        params
      })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `Proxy error ${response.status}`);
    }
    return data.result;
  }

  async listTools() {
    const result = await this.rpc("tools/list");
    return result.tools || [];
  }

  async callTool(name, argumentsPayload = {}) {
    return this.rpc("tools/call", {
      name,
      arguments: argumentsPayload
    });
  }
}

function createFallbackToolMap() {
  return mcpTools.map(([group, name, description, flags = []]) => ({
    group,
    name,
    description,
    flags
  }));
}

function addEvent(title, detail, mode = "demo") {
  const item = {
    title,
    detail,
    mode,
    time: new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  };
  state.eventLog = [item, ...state.eventLog].slice(0, 16);
  renderEventLog();
}

function renderEventLog() {
  els.logMode.textContent = state.proxyOnline ? "proxy events" : "demo events";
  els.eventLog.innerHTML = state.eventLog.map((item) => `
    <article class="event-item">
      <small>${item.time} · ${item.mode}</small>
      <strong>${item.title}</strong>
      <p>${item.detail}</p>
    </article>
  `).join("");
}

function renderTargets() {
  els.targetGrid.innerHTML = targets.map((target) => {
    const isActive = state.selectedTarget.id === target.id ? "active" : "";
    return `
      <article class="target-card ${isActive}" data-target-id="${target.id}">
        <p class="eyebrow">Ціль</p>
        <h3>${target.name}</h3>
        <p>${target.description}</p>
        <div class="price">${target.price} грн</div>
        <small>Мета по знижці: до ${target.desiredDiscount}%</small>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-target-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const next = targets.find((item) => item.id === card.dataset.targetId);
      state.selectedTarget = next;
      addEvent("Нова ціль", `Обрано “${next.name}”. Агент готуватиме пошук за запитом “${next.query}”.`);
      renderTargets();
      updateDashboard();
    });
  });
}

function renderFlow() {
  els.flowGrid.innerHTML = flowSteps.map((text, index) => `
    <article class="flow-card">
      <div class="step">${index + 1}</div>
      <p>${text}</p>
    </article>
  `).join("");
}

function renderQuestSteps() {
  els.questSteps.innerHTML = questThresholds.map((step) => {
    const done = state.taps >= step.taps ? "done" : "";
    return `
      <div class="quest-step ${done}">
        <strong>${step.label}</strong>
        <div>${step.tools.join(" + ")}</div>
      </div>
    `;
  }).join("");
}

function renderTools() {
  const source = state.liveTools ?? createFallbackToolMap();
  const filtered = source.filter((tool) => state.filter === "all" || tool.group === state.filter);

  els.toolsGrid.innerHTML = filtered.map((tool) => {
    const badges = [
      `<span class="badge">${tool.group}</span>`,
      ...(tool.flags || []).map((flag) => `<span class="badge ${flag}">${flag === "cart" ? "requires cart" : flag}</span>`)
    ].join("");

    return `
      <article class="tool-card">
        <header>
          <strong>${tool.name}</strong>
        </header>
        <p>${tool.description ?? "Live tool, schema available from tools/list."}</p>
        <div class="badge-row">${badges}</div>
      </article>
    `;
  }).join("");
}

function getTapTier() {
  if (state.taps >= 500) return { level: "Checkout Boss", power: 12 };
  if (state.taps >= 250) return { level: "Bonus Engineer", power: 8 };
  if (state.taps >= 100) return { level: "Coupon Raider", power: 5 };
  if (state.taps >= 25) return { level: "Promo Scout", power: 3 };
  return { level: "Starter", power: 1 };
}

function getDiscountEstimate() {
  return Math.min(state.selectedTarget.desiredDiscount, Math.floor(state.energy / 18));
}

function getNextGoalMessage() {
  if (state.taps < 25) return `${25 - state.taps} тапів до silpo_get_promotions.`;
  if (state.taps < 100) return `${100 - state.taps} тапів до купонів і персональних промо.`;
  if (state.taps < 250) return `${250 - state.taps} тапів до бонусної оптимізації кошика.`;
  if (state.taps < 500) return `${500 - state.taps} тапів до фінального оновлення кошика.`;
  return "Максимальний режим активовано. Пора запускати повний MCP-сценарій.";
}

function getStrategyCopy(discount) {
  if (discount === 0) return "Агент стартує з tools/list, а далі збирає cart-first контекст.";
  if (discount < 7) return "Базовий шар: silpo_get_products + silpo_get_product_details + silpo_get_promotions.";
  if (discount < 14) return "Середній шар: додаємо silpo_get_my_coupons і silpo_get_my_promos.";
  if (discount < state.selectedTarget.desiredDiscount) return "Просунутий шар: бонуси, альтернативи й схожі товари для кращої ціни.";
  return "Фінішний шар: агент готує silpo_update_shopping_cart для застосування знайденої вигоди.";
}

function updateDashboard() {
  const tier = getTapTier();
  const discount = getDiscountEstimate();
  const progress = Math.min(100, (discount / state.selectedTarget.desiredDiscount) * 100 || 0);
  const finalPrice = Math.max(0, Math.round(state.selectedTarget.price * (1 - discount / 100)));

  els.tapCount.textContent = state.taps;
  els.tapEnergy.textContent = state.energy;
  els.tapLevel.textContent = tier.level;
  els.tapPowerLabel.textContent = `+${tier.power} сила`;
  els.heroTargetName.textContent = state.selectedTarget.name;
  els.heroTargetDesc.textContent = state.selectedTarget.description;
  els.heroDiscount.textContent = `${discount}%`;
  els.rewardDiscount.textContent = `${discount}%`;
  els.heroFinalPrice.textContent = discount
    ? `Орієнтовно ${finalPrice} грн після агентної оптимізації.`
    : "Фінальна ціна з’явиться після стратегії агента.";
  els.heroProgressBar.style.width = `${progress}%`;
  els.rewardCopy.textContent = discount
    ? `Для “${state.selectedTarget.name}” агент уже може обґрунтувати до ${discount}% вигоди.`
    : "Почніть тапати, щоб агент відкрив сценарії економії.";
  els.strategyCopy.textContent = getStrategyCopy(discount);
  els.nextGoalCopy.textContent = getNextGoalMessage();
  els.pulseCopy.textContent = state.proxyOnline
    ? "Proxy online, можна бігти в live MCP"
    : discount
      ? "Demo-агент зібрав чорнову стратегію"
      : "Очікує перших тапів";
  renderQuestSteps();
}

function spawnFloatScore(power) {
  const tpl = document.querySelector("#float-template");
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.textContent = `+${power}`;
  node.style.left = `${35 + Math.random() * 30}%`;
  node.style.top = `${40 + Math.random() * 25}%`;
  els.tapButton.appendChild(node);
  setTimeout(() => node.remove(), 900);
}

function onTap() {
  const tier = getTapTier();
  state.taps += 1;
  state.energy += tier.power;
  if ([1, 25, 100, 250, 500].includes(state.taps)) {
    addEvent("Новий поріг", `Досягнуто рівень ${getTapTier().level}. Відкриваються нові MCP-інструменти.`, "game");
  }
  spawnFloatScore(tier.power);
  updateDashboard();
}

function inferGroup(name = "") {
  if (name.includes("address") || name.includes("branch") || name.includes("time_slot") || name.includes("nova")) return "location";
  if (name.includes("product") || name.includes("favorite") || name.includes("replacement") || name.includes("similar")) return "products";
  if (name.includes("promotions") || name.includes("categories") || name.includes("category") || name.includes("sets")) return "catalog";
  if (name.includes("cart") || name.includes("shopping_cart") || name.includes("certificates")) return "cart";
  if (name.includes("orders")) return "orders";
  if (name.includes("profile") || name.includes("delivery_addresses") || name.includes("family") || name.includes("restrictions")) return "profile";
  return "loyalty";
}

function getClient() {
  return new SilpoMCPClient(
    els.proxyEndpoint.value.trim() || "/api/mcp",
    els.mcpEndpoint.value.trim() || "https://mcp.silpo.ua/mcp"
  );
}

async function loadLiveTools() {
  const client = getClient();
  els.mcpStatus.textContent = "Пробую завантажити tools/list через proxy...";

  try {
    const tools = await client.listTools();
    state.liveTools = tools.map((tool) => ({
      group: inferGroup(tool.name),
      name: tool.name,
      description: tool.description,
      flags: [
        /cart/i.test(tool.description || "") ? "cart" : null,
        /write|update|add|remove|clear/i.test(tool.name) ? "write" : null
      ].filter(Boolean)
    }));
    state.proxyOnline = true;
    renderTools();
    addEvent("tools/list", `Proxy повернув ${state.liveTools.length} live tools.`, "proxy");
    els.mcpStatus.textContent = `Proxy online. tools/list успішний, завантажено ${state.liveTools.length} tools.`;
    els.agentOutput.textContent = JSON.stringify({
      mode: "live",
      step: "tools/list",
      endpoint: els.mcpEndpoint.value.trim(),
      toolsLoaded: state.liveTools.length
    }, null, 2);
  } catch (error) {
    state.proxyOnline = false;
    addEvent("tools/list fallback", `Не вдалося дістати live tools: ${error.message}`, "demo");
    els.mcpStatus.textContent = `Proxy недоступний або неавторизований. Залишаю demo mode. ${error.message}`;
  }
  updateDashboard();
}

function buildMCPPlan(discount) {
  const steps = [
    { tool: "silpo_get_my_shopping_cart", args: {} },
    { tool: "silpo_get_shopping_cart_by_id", args: { cartId: "from_previous_step" } },
    { tool: "silpo_get_time_slots", args: { branchId: "from_cart", deliveryType: "from_cart" } },
    { tool: "silpo_get_products", args: { query: state.selectedTarget.query, category: state.selectedTarget.categoryHint } },
    { tool: "silpo_get_product_details", args: { productId: "top_match_product_id" } },
    { tool: "silpo_get_promotions", args: { branchId: "from_cart" } }
  ];

  if (discount >= 7) {
    steps.push({ tool: "silpo_get_my_coupons", args: {} });
    steps.push({ tool: "silpo_get_my_promos", args: {} });
  }
  if (discount >= 12) {
    steps.push({ tool: "silpo_get_loyalty_info", args: {} });
    steps.push({ tool: "silpo_get_similar_products", args: { slug: "top_match_slug" } });
  }
  if (discount >= state.selectedTarget.desiredDiscount) {
    steps.push({ tool: "silpo_update_shopping_cart", args: { promoCode: "best_available", bonusRequested: "max_allowed" } });
  }

  return steps;
}

async function runDemoPlan(plan) {
  const transcript = [];
  for (const step of plan) {
    await new Promise((resolve) => setTimeout(resolve, demoDelay));
    addEvent(step.tool, "Симуляція кроку за офіційним MCP-сценарієм.", "demo");
    transcript.push({
      tool: step.tool,
      status: "simulated",
      args: step.args
    });
  }
  return transcript;
}

async function runLivePlan(client, plan) {
  const transcript = [];
  for (const step of plan) {
    addEvent(step.tool, "Proxy надсилає live tools/call.", "proxy");
    const result = await client.callTool(step.tool, step.args);
    transcript.push({
      tool: step.tool,
      status: "ok",
      result
    });
  }
  return transcript;
}

async function runAgentScenario() {
  const discount = getDiscountEstimate();
  const plan = buildMCPPlan(discount);
  const client = getClient();

  els.mcpStatus.textContent = state.proxyOnline
    ? "Запускаю live MCP-сценарій через proxy..."
    : "Proxy не підтверджений, показую demo MCP-сценарій.";

  try {
    const transcript = state.proxyOnline
      ? await runLivePlan(client, plan)
      : await runDemoPlan(plan);

    const finalPrice = Math.max(0, Math.round(state.selectedTarget.price * (1 - discount / 100)));
    const payload = {
      mode: state.proxyOnline ? "live" : "demo",
      target: state.selectedTarget.name,
      taps: state.taps,
      energy: state.energy,
      estimatedDiscountPercent: discount,
      estimatedFinalPrice: finalPrice,
      officialFlow: [
        "tools/list",
        "silpo_get_my_shopping_cart",
        "silpo_get_shopping_cart_by_id",
        "silpo_get_time_slots"
      ],
      transcript
    };

    els.agentOutput.textContent = JSON.stringify(payload, null, 2);
    addEvent("Сценарій завершено", `Агент зібрав ${transcript.length} MCP-кроків для “${state.selectedTarget.name}”.`, state.proxyOnline ? "proxy" : "demo");
    els.mcpStatus.textContent = state.proxyOnline
      ? "Live MCP-сценарій виконано через proxy."
      : "Demo MCP-сценарій готовий для пітчу.";
  } catch (error) {
    addEvent("Помилка сценарію", error.message, "proxy");
    els.mcpStatus.textContent = `Сценарій зламався: ${error.message}`;
    els.agentOutput.textContent = JSON.stringify({
      mode: "error",
      message: error.message
    }, null, 2);
  }
}

function bindEvents() {
  els.tapButton.addEventListener("click", onTap);
  els.loadLiveTools.addEventListener("click", loadLiveTools);
  els.runAgent.addEventListener("click", runAgentScenario);

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((node) => node.classList.remove("active"));
      chip.classList.add("active");
      state.filter = chip.dataset.filter;
      renderTools();
    });
  });
}

renderTargets();
renderFlow();
renderQuestSteps();
renderTools();
bindEvents();
updateDashboard();
addEvent("Сайт готовий", "UI піднято. Можна тапати або підключати proxy до офіційного MCP.", "system");
