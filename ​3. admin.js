
(function () {
  const cfg = window.ARTHSPARK_CONFIG || {};
  const supa =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("YOUR-PROJECT-ID") &&
    window.supabase
      ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
      : null;

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  document.getElementById("adminLoginBtn").addEventListener("click", () => {
    const pass = document.getElementById("adminPassInput").value;
    if (pass === (cfg.ADMIN_PASSWORD || "ArthSpark@2026")) {
      document.getElementById("loginBox").style.display = "none";
      document.getElementById("adminDashboard").style.display = "block";
      loadAdminData();
    } else {
      alert("Wrong Admin Password!");
    }
  });

  async function loadAdminData() {
    if (!supa) {
      alert("Please add your Supabase URL and Anon Key in config.js first.");
      return;
    }

    const { data: sData } = await supa.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (sData) {
      document.getElementById("setBrand").value = sData.brand_name || "ArthSpark";
      document.getElementById("setLogoUrl").value = sData.logo_url || "logo.png";
      document.getElementById("setWhatsapp").value = sData.whatsapp || "917978895193";
      document.getElementById("setEmail").value = sData.email || "supportarthspark@gmail.com";
      document.getElementById("setRazorpay").value = sData.razorpay_key || "";
      document.getElementById("setPopupSec").value = sData.popup_interval_sec || 120;
      document.getElementById("setPopupMsg").value = sData.popup_message || "";
    }

    const { data: pData } = await supa.from("projects").select("*").order("sort_order", { ascending: true });
    renderAdminProjects(pData || []);

    const { data: oData } = await supa.from("orders").select("*").order("id", { ascending: false }).limit(30);
    renderAdminOrders(oData || []);
  }

  document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
    if (!supa) return;
    let logoVal = document.getElementById("setLogoUrl").value.trim() || "logo.png";
    const fileInput = document.getElementById("setLogoFile");
    if (fileInput.files && fileInput.files[0]) {
      logoVal = await fileToBase64(fileInput.files[0]);
    }

    const cleanBrand = (document.getElementById("setBrand").value || "ArthSpark")
      .replace(/pvt\.?\s*ltd\.?/gi, "")
      .trim();

    const { error } = await supa.from("site_settings").upsert({
      id: 1,
      brand_name: cleanBrand || "ArthSpark",
      logo_url: logoVal,
      whatsapp: document.getElementById("setWhatsapp").value.trim(),
      email: document.getElementById("setEmail").value.trim(),
      razorpay_key: document.getElementById("setRazorpay").value.trim(),
      popup_interval_sec: Number(document.getElementById("setPopupSec").value) || 120,
      popup_message: document.getElementById("setPopupMsg").value.trim()
    });

    if (error) alert("Error: " + error.message);
    else alert("Settings & Logo updated successfully!");
  });

  document.getElementById("addProjectBtn").addEventListener("click", async () => {
    if (!supa) return;
    let imgVal = document.getElementById("newImgUrl").value.trim();
    const imgFile = document.getElementById("newImgFile");
    if (imgFile.files && imgFile.files[0]) {
      imgVal = await fileToBase64(imgFile.files[0]);
    }

    const featuresArr = (document.getElementById("newFeatures").value || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const { error } = await supa.from("projects").insert({
      title: document.getElementById("newTitle").value.trim(),
      category: document.getElementById("newCat").value.trim() || "Websites & Software",
      description: document.getElementById("newDesc").value.trim(),
      demo_type: document.getElementById("newDemoType").value,
      image_url: imgVal,
      mrp: Number(document.getElementById("newMrp").value) || 19999,
      offer_price: Number(document.getElementById("newOffer").value) || 6999,
      free_maintenance: document.getElementById("newMaint").value.trim() || "1 Year Free Support & Updates",
      deliverables: featuresArr,
      sort_order: 99
    });

    if (error) alert("Error: " + error.message);
    else {
      alert("New project added!");
      loadAdminData();
    }
  });

  function renderAdminProjects(list) {
    const container = document.getElementById("adminProjectsList");
    container.innerHTML = list
      .map(
        (p) => `
        <div class="admin-row">
          <div style="flex:1; min-width:220px;">
            <strong>${p.title}</strong>
            <div style="font-size:0.78rem; color:var(--text-secondary);">${p.category}</div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <input type="text" id="img_${p.id}" value="${p.image_url || ""}" placeholder="Photo URL" style="width:150px; padding:7px; border-radius:8px; background:#0c0917; border:1px solid var(--border-subtle); color:#fff;" />
            <input type="number" id="mrp_${p.id}" value="${p.mrp}" placeholder="MRP" style="width:95px; padding:7px; border-radius:8px; background:#0c0917; border:1px solid var(--border-subtle); color:#fff;" />
            <input type="number" id="off_${p.id}" value="${p.offer_price}" placeholder="Offer Price" style="width:95px; padding:7px; border-radius:8px; background:#0c0917; border:1px solid var(--border-subtle); color:#fff;" />
            <button class="btn btn-primary upd-proj-btn" data-id="${p.id}" type="button">Update</button>
            <button class="btn btn-outline del-proj-btn" data-id="${p.id}" type="button" style="color:#ff7b7b;">Delete</button>
          </div>
        </div>`
      )
      .join("");

    container.querySelectorAll(".upd-proj-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.getAttribute("data-id"));
        const mrp = Number(document.getElementById(`mrp_${id}`).value);
        const offer_price = Number(document.getElementById(`off_${id}`).value);
        const image_url = document.getElementById(`img_${id}`).value.trim();

        const { error } = await supa.from("projects").update({ mrp, offer_price, image_url }).eq("id", id);
        if (error) alert("Error: " + error.message);
        else alert("Price & Photo updated!");
      });
    });

    container.querySelectorAll(".del-proj-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.getAttribute("data-id"));
        if (!confirm("Delete this project?")) return;
        await supa.from("projects").delete().eq("id", id);
        loadAdminData();
      });
    });
  }

  function renderAdminOrders(orders) {
    const el = document.getElementById("adminOrdersList");
    if (!orders.length) {
      el.innerHTML = `<p style="color:var(--text-secondary); font-size:0.86rem;">No orders yet.</p>`;
      return;
    }
    el.innerHTML = orders
      .map(
        (o) => `
        <div class="admin-row">
          <div>
            <strong>${o.project_title}</strong> — ₹${o.amount}
            <div style="font-size:0.8rem; color:var(--text-secondary);">${o.customer_name} (${o.customer_phone}) • ${o.payment_method}</div>
          </div>
          <span class="cat-pill">${o.payment_status}</span>
        </div>`
      )
      .join("");
  }
})();
