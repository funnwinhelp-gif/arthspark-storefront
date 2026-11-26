
(function () {
  const cfg = window.ARTHSPARK_CONFIG || {};
  let settings = {
    brand_name: cfg.BRAND_NAME || "ArthSpark",
    logo_url: cfg.DEFAULT_LOGO || "logo.png",
    whatsapp: cfg.WHATSAPP_NUMBER || "917978895193",
    email: cfg.SUPPORT_EMAIL || "supportarthspark@gmail.com",
    razorpay_key: cfg.RAZORPAY_KEY || "",
    popup_interval_sec: 120,
    popup_message: "Need a custom website, software, or digital solution for your business? Tap to chat on WhatsApp!"
  };

  let allProjects = [];
  let selectedCategory = "All";
  let activeBuyProject = null;

  const supa =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("YOUR-PROJECT-ID") &&
    window.supabase
      ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
      : null;

  const FALLBACK_PROJECTS = [
    {
      id: 1,
      title: "ArthSpark E-Commerce Platform",
      category: "E-Commerce & Retail",
      description: "Complete online store with product catalog, cart, Buy Now checkout, order tracking & admin panel.",
      demo_type: "ecommerce",
      image_url: "",
      mrp: 24999,
      offer_price: 7999,
      free_maintenance: "1 Year Free Support & Updates",
      deliverables: ["Full Storefront + Admin", "Cart & Buy Now Flow", "UPI / Razorpay Ready"]
    },
    {
      id: 2,
      title: "ArthSpark Instant Grocery Store",
      category: "Grocery & Essentials",
      description: "Fast grocery ordering platform with category aisles, quick-add cart, slot delivery & order alert.",
      demo_type: "grocery",
      image_url: "",
      mrp: 21999,
      offer_price: 6999,
      free_maintenance: "1 Year Free Support & Updates",
      deliverables: ["Aisle & Search Filter", "Instant Cart Checkout", "Delivery Slot System"]
    },
    {
      id: 3,
      title: "ArthSpark Loan Hub (All Loan Categories)",
      category: "Loan & Finance",
      description: "Personal Loan, Business Loan, Mortgage Loan, Car Loan (New & Old), Bike Loan (New & Old) eligibility & apply flow.",
      demo_type: "loan",
      image_url: "",
      mrp: 24999,
      offer_price: 7999,
      free_maintenance: "1 Year Free Support & Updates",
      deliverables: ["Personal & Business Loan", "Mortgage & Car (New/Old)", "Bike Loan (New/Old) Flow"]
    }
  ];

  const FALLBACK_REVIEWS = [
    { client_name: "Rajesh Kumar", business_name: "Ranchi Retail Mart", rating: 5, comment: "E-Commerce aur Grocery setup bahut smooth chalta hai. Demo aur Buy flow se clients turant order karte hain." },
    { client_name: "Priya Sharma", business_name: "UrbanStay Hotels", rating: 5, comment: "Hotel booking flow clean aur fast hai. Admin se price aur offers change karna bahut aasan hai." },
    { client_name: "Vikram Singh", business_name: "FinBridge Advisory", rating: 5, comment: "Loan section mein Personal, Business, Car aur Bike loan ke options bilkul organized tarike se aate hain." },
    { client_name: "Ananya Verma", business_name: "FreshLeaf Organics", rating: 4, comment: "Milk aur Sabzi subscription ka layout badhiya hai, aur WhatsApp inquiry directly right details ke saath aati hai." }
  ];

  const FALLBACK_PARTNERS = [
    { partner_name: "ArthSpark Cloud", role_tag: "Web & App Architecture" },
    { partner_name: "Razorpay", role_tag: "Payment Gateway" },
    { partner_name: "Supabase", role_tag: "Realtime Database" },
    { partner_name: "Vercel & Netlify", role_tag: "Edge Hosting" },
    { partner_name: "WhatsApp Business", role_tag: "Instant Lead Routing" },
    { partner_name: "Meta & Google Ads", role_tag: "Growth & Performance" }
  ];

  function formatINR(num) {
    return "₹" + Number(num || 0).toLocaleString("en-IN");
  }

  function openWhatsApp(customText) {
    const cleanPhone = String(settings.whatsapp || "917978895193").replace(/\D/g, "");
    const msg = customText || "Hello ArthSpark team, how can you help me with a project/website/software?";
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function applySettingsUI() {
    const brand = (settings.brand_name || "ArthSpark").replace(/pvt\.?\s*ltd\.?/gi, "").trim() || "ArthSpark";
    document.getElementById("navBrandName").textContent = brand;
    document.getElementById("footerBrand").textContent = brand;
    document.getElementById("footerEmail").textContent = settings.email || "supportarthspark@gmail.com";
    document.getElementById("footerWa").textContent = settings.whatsapp || "917978895193";
    document.getElementById("timedPopupText").textContent =
      settings.popup_message || "Need a custom website, software, or digital solution for your business? Tap to chat on WhatsApp!";

    const logoEl = document.getElementById("navLogo");
    if (logoEl && settings.logo_url) {
      logoEl.src = settings.logo_url;
    }
  }

  function getCategoryVisual(demoType) {
    const map = {
      ecommerce: { bg: "linear-gradient(135deg,#2a1238,#120b24)", label: "Store • Cart • Orders" },
      grocery: { bg: "linear-gradient(135deg,#123328,#0d1424)", label: "Grocery • Fast Cart" },
      milk: { bg: "linear-gradient(135deg,#132b45,#120d26)", label: "Daily Milk • Schedule" },
      veg_fruits: { bg: "linear-gradient(135deg,#293312,#120d24)", label: "Fresh Produce • Combo" },
      restaurant: { bg: "linear-gradient(135deg,#3b1812,#140c24)", label: "Menu • Table & Order" },
      hotel: { bg: "linear-gradient(135deg,#2a1c3d,#0f0b1d)", label: "Rooms • Dates & Tariff" },
      bus: { bg: "linear-gradient(135deg,#12293d,#130d26)", label: "Routes • Seat Selection" },
      flight: { bg: "linear-gradient(135deg,#191847,#0d0b1c)", label: "Search • Fare & Booking" },
      ride: { bg: "linear-gradient(135deg,#382210,#130c24)", label: "Pickup/Drop • Fare Calc" },
      tour: { bg: "linear-gradient(135deg,#113038,#120c24)", label: "Packages • Trip Inquiry" },
      loan: { bg: "linear-gradient(135deg,#2e1438,#0f0b1f)", label: "Personal • Business • Car • Bike" },
      banking: { bg: "linear-gradient(135deg,#171c42,#0e0a1c)", label: "Accounts • Ledger UI" },
      payment: { bg: "linear-gradient(135deg,#33162b,#110c24)", label: "UPI • Checkout Flow" },
      school: { bg: "linear-gradient(135deg,#142e3b,#120c24)", label: "Admissions • Notices" },
      realestate: { bg: "linear-gradient(135deg,#2c1938,#0f0b1d)", label: "Properties • EMI View" },
      partner: { bg: "linear-gradient(135deg,#1f2847,#110c24)", label: "Sellers • Payouts" },
      delivery_partner: { bg: "linear-gradient(135deg,#381d14,#120b24)", label: "Riders • Task Queue" },
      it_marketing: { bg: "linear-gradient(135deg,#2b133d,#0d0a1a)", label: "Software • SEO & Ads" }
    };
    return map[demoType] || { bg: "linear-gradient(135deg,#251238,#0e0a1c)", label: "Interactive Demo" };
  }

  function renderCategoryTabs() {
    const tabsEl = document.getElementById("categoryTabs");
    const cats = ["All", ...new Set(allProjects.map((p) => p.category))];
    tabsEl.innerHTML = cats
      .map(
        (cat) =>
          `<button class="cat-chip ${cat === selectedCategory ? "active" : ""}" data-cat="${cat}" type="button">${cat}</button>`
      )
      .join("");

    tabsEl.querySelectorAll(".cat-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedCategory = btn.getAttribute("data-cat");
        renderCategoryTabs();
        renderProjects();
      });
    });
  }

  function renderProjects() {
    const grid = document.getElementById("projectsGrid");
    const q = (document.getElementById("searchInput").value || "").toLowerCase().trim();

    const filtered = allProjects.filter((p) => {
      const catMatch = selectedCategory === "All" || p.category === selectedCategory;
      const textMatch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return catMatch && textMatch;
    });

    if (!filtered.length) {
      grid.innerHTML = `<p style="color:var(--text-secondary);">No matching project found.</p>`;
      return;
    }

    grid.innerHTML = filtered
      .map((p) => {
        const mrp = Number(p.mrp || 0);
        const offer = Number(p.offer_price || 0);
        const discPercent = mrp > offer && mrp > 0 ? Math.round(((mrp - offer) / mrp) * 100) : 0;
        const vis = getCategoryVisual(p.demo_type);
        const pills = Array.isArray(p.deliverables) ? p.deliverables.slice(0, 3) : [];
        const demoUrl = `demo.html?type=${encodeURIComponent(p.demo_type || "ecommerce")}&title=${encodeURIComponent(p.title)}&price=${offer}`;

        return `
          <article class="project-card">
            <div class="card-photo-box" style="background:${vis.bg};">
              ${p.image_url ? `<img class="project-thumb" src="${p.image_url}" alt="${p.title}" />` : ""}
              <div class="photo-overlay-grad"></div>

              <div class="photo-top-row">
                <span class="cat-pill">${p.category}</span>
                ${discPercent > 0 ? `<span class="discount-pill">${discPercent}% OFF</span>` : `<span class="cat-pill">${vis.label}</span>`}
              </div>

              <div class="photo-price-badge">
                ${mrp > offer ? `<span class="mrp-cut">${formatINR(mrp)}</span>` : ""}
                <span class="offer-now">${formatINR(offer)}</span>
              </div>
            </div>

            <div class="card-body">
              <h3 class="card-title">${p.title}</h3>
              <p class="card-desc">${p.description}</p>

              <div class="feature-pills">
                ${pills.map((f) => `<span class="feature-pill">${f}</span>`).join("")}
              </div>

              <div class="card-price-row">
                <div>
                  ${mrp > offer ? `<span class="mrp-cut">${formatINR(mrp)}</span>` : ""}
                  <span class="offer-now">${formatINR(offer)}</span>
                </div>
                <span class="maint-tag">${p.free_maintenance || "Free Maintenance Included"}</span>
              </div>

              <div class="card-actions">
                <a href="${demoUrl}" class="btn btn-outline">Demo</a>
                <button class="btn btn-primary buy-now-btn" data-id="${p.id}" type="button">Buy Now</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll(".buy-now-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const proj = allProjects.find((x) => String(x.id) === String(id));
        if (proj) openBuyModal(proj);
      });
    });
  }

  function renderReviews(list) {
    const valid = (list && list.length ? list : FALLBACK_REVIEWS).filter((r) => Number(r.rating) >= 4);
    const items = valid.length ? valid : FALLBACK_REVIEWS;
    const doubled = [...items, ...items];

    document.getElementById("reviewsMarquee").innerHTML = doubled
      .map((r) => {
        const stars = "★".repeat(Math.min(5, Math.max(4, Number(r.rating) || 5)));
        return `
          <div class="review-card">
            <div class="review-stars">${stars} (${r.rating || 5}/5)</div>
            <p class="review-text">"${r.comment}"</p>
            <div class="review-author">${r.client_name} • ${r.business_name}</div>
          </div>
        `;
      })
      .join("");
  }

  function renderPartners(list) {
    const items = list && list.length ? list : FALLBACK_PARTNERS;
    document.getElementById("partnersGrid").innerHTML = items
      .map(
        (pt) => `
          <div class="partner-card">
            <strong>${pt.partner_name}</strong>
            <span>${pt.role_tag}</span>
          </div>
        `
      )
      .join("");
  }

  function openBuyModal(proj) {
    activeBuyProject = proj;
    document.getElementById("buyProjectTitle").textContent = proj.title;
    document.getElementById("buyMaintInfo").textContent = proj.free_maintenance || "1 Year Free Support & Maintenance";
    document.getElementById("buyMrp").textContent = formatINR(proj.mrp);
    document.getElementById("buyPrice").textContent = formatINR(proj.offer_price);
    document.getElementById("buyModal").classList.add("open");
  }

  async function saveOrderRecord(method, status) {
    if (!supa || !activeBuyProject) return;
    const name = (document.getElementById("buyerName").value || "Website Visitor").trim();
    const phone = (document.getElementById("buyerPhone").value || "Not Provided").trim();
    await supa.from("orders").insert({
      customer_name: name,
      customer_phone: phone,
      project_title: activeBuyProject.title,
      amount: Number(activeBuyProject.offer_price || 0),
      payment_method: method,
      payment_status: status
    });
  }

  async function initData() {
    applySettingsUI();

    if (!supa) {
      allProjects = FALLBACK_PROJECTS;
      renderCategoryTabs();
      renderProjects();
      renderReviews(FALLBACK_REVIEWS);
      renderPartners(FALLBACK_PARTNERS);
      return;
    }

    const [sRes, pRes, rRes, ptRes] = await Promise.all([
      supa.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supa.from("projects").select("*").order("sort_order", { ascending: true }),
      supa.from("reviews").select("*").order("id", { ascending: false }),
      supa.from("partners").select("*").order("id", { ascending: true })
    ]);

    if (sRes.data) {
      settings = { ...settings, ...sRes.data };
      applySettingsUI();
    }

    allProjects = pRes.data && pRes.data.length ? pRes.data : FALLBACK_PROJECTS;
    renderCategoryTabs();
    renderProjects();
    renderReviews(rRes.data);
    renderPartners(ptRes.data);
  }

  // Events
  document.getElementById("searchInput").addEventListener("input", renderProjects);

  document.getElementById("headerWaBtn").addEventListener("click", () => {
    openWhatsApp("Hello ArthSpark, how can you help me? I want details about your websites/software/projects.");
  });

  document.getElementById("heroWaBtn").addEventListener("click", () => {
    openWhatsApp("Hello ArthSpark, how can you help me with my project requirement?");
  });

  document.getElementById("floatingWaBtn").addEventListener("click", () => {
    openWhatsApp("Hello ArthSpark, how can you help me? I am checking your projects on the website.");
  });

  document.getElementById("loanWaBtn").addEventListener("click", () => {
    openWhatsApp("Hello ArthSpark, how can you help me regarding the Loan Portal & Lead System?");
  });

  document.getElementById("closeBuyModal").addEventListener("click", () => {
    document.getElementById("buyModal").classList.remove("open");
  });

  document.getElementById("buyWaBtn").addEventListener("click", async () => {
    if (!activeBuyProject) return;
    await saveOrderRecord("WhatsApp Inquiry", "WhatsApp Sent");
    const name = document.getElementById("buyerName").value.trim();
    const phone = document.getElementById("buyerPhone").value.trim();
    const msg =
      `Hello ArthSpark, how can you help me?\n` +
      `Project Enquiry: ${activeBuyProject.title}\n` +
      `Price: ${formatINR(activeBuyProject.offer_price)} (MRP: ${formatINR(activeBuyProject.mrp)})\n` +
      `Maintenance: ${activeBuyProject.free_maintenance}\n` +
      (name ? `Name: ${name}\n` : "") +
      (phone ? `Phone: ${phone}` : "");
    openWhatsApp(msg);
  });

  document.getElementById("buyRazorpayBtn").addEventListener("click", async () => {
    if (!activeBuyProject) return;
    const key = settings.razorpay_key || cfg.RAZORPAY_KEY;
    if (!key || key.includes("YOUR_KEY_HERE") || !window.Razorpay) {
      await saveOrderRecord("Razorpay (Fallback WhatsApp)", "Key Pending");
      openWhatsApp(
        `Hello ArthSpark, how can you help me? I want to pay via Razorpay for ${activeBuyProject.title} (${formatINR(activeBuyProject.offer_price)}).`
      );
      return;
    }

    const rzp = new window.Razorpay({
      key: key,
      amount: Number(activeBuyProject.offer_price || 0) * 100,
      currency: "INR",
      name: "ArthSpark",
      description: activeBuyProject.title,
      handler: async function () {
        await saveOrderRecord("Razorpay", "Paid");
        alert("Payment successful! Our team will contact you shortly.");
      }
    });
    rzp.open();
  });

  // 2-Minute (120s) Popup at Current Scroll Viewport
  const popupEl = document.getElementById("timedPopup");
  document.getElementById("closeTimedPopup").addEventListener("click", () => {
    popupEl.classList.remove("show");
  });
  document.getElementById("timedPopupWaBtn").addEventListener("click", () => {
    openWhatsApp("Hello ArthSpark, how can you help me with my business website/software?");
  });

  setInterval(() => {
    popupEl.classList.add("show");
  }, (Number(settings.popup_interval_sec) || 120) * 1000);

  initData();
})();
