// State Management
let logoData = null;

// DOM Elements
const form = document.getElementById("invoiceForm");
const addItemBtn = document.getElementById("addItem");
const itemsList = document.getElementById("itemsList");
const downloadBtn = document.getElementById("downloadPDF");

// Logo Elements
const logoUpload = document.getElementById("logoUpload");
const logoPreview = document.getElementById("logoPreview");
const logoPreviewImg = document.getElementById("logoPreviewImg");
const removeLogo = document.getElementById("removeLogo");

// Form Inputs
const inputs = {
  businessName: document.getElementById("businessName"),
  businessContact: document.getElementById("businessContact"),
  clientName: document.getElementById("clientName"),
  eventType: document.getElementById("eventType"),
  eventDate: document.getElementById("eventDate"),
  invoiceNumber: document.getElementById("invoiceNumber"),
  discount: document.getElementById("discount"),
  tax: document.getElementById("tax"),
  notes: document.getElementById("notes"),
};

// Preview Elements
const preview = {
  logo: document.getElementById("previewLogo"),
  logoContainer: document.getElementById("previewLogoContainer"),
  businessName: document.getElementById("previewBusinessName"),
  businessContact: document.getElementById("previewBusinessContact"),
  clientName: document.getElementById("previewClientName"),
  eventType: document.getElementById("previewEventType"),
  eventDate: document.getElementById("previewEventDate"),
  invoiceNumber: document.getElementById("previewInvoiceNumber"),
  date: document.getElementById("previewDate"),
  items: document.getElementById("previewItems"),
  subtotal: document.getElementById("previewSubtotal"),
  discount: document.getElementById("previewDiscount"),
  discountPercent: document.getElementById("previewDiscountPercent"),
  tax: document.getElementById("previewTax"),
  taxPercent: document.getElementById("previewTaxPercent"),
  total: document.getElementById("previewTotal"),
  notes: document.getElementById("previewNotes"),
  notesSection: document.getElementById("previewNotesSection"),
  discountRow: document.getElementById("discountRow"),
  taxRow: document.getElementById("taxRow"),
};

// Initialize
function init() {
  // Set today's date
  preview.date.textContent = formatDate(new Date());

  // Event Listeners
  addItemBtn.addEventListener("click", addItemRow);
  downloadBtn.addEventListener("click", generatePDF);

  // Logo Upload
  logoUpload.addEventListener("change", handleLogoUpload);
  removeLogo.addEventListener("click", handleRemoveLogo);

  // Live Preview Updates
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", updatePreview);
  });

  // Initial preview update
  updatePreview();
}

// Logo Upload Handler
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (event) {
      logoData = event.target.result;
      logoPreviewImg.src = logoData;
      logoPreview.style.display = "flex";
      updatePreview();
    };
    reader.readAsDataURL(file);
  }
}

// Remove Logo Handler
function handleRemoveLogo() {
  logoData = null;
  logoUpload.value = "";
  logoPreview.style.display = "none";
  logoPreviewImg.src = "";
  updatePreview();
}

// Add Item Row
function addItemRow() {
  const itemCard = document.createElement("div");
  itemCard.className = "item-card";
  itemCard.innerHTML = `
        <div class="item-main-row">
            <input type="text" class="item-name" placeholder="Nama Layanan" required>
            <input type="number" class="item-qty" placeholder="Qty" value="1" min="1" required>
            <input type="number" class="item-price" placeholder="Harga" min="0" required>
            <button type="button" class="btn-remove">×</button>
        </div>
        <div class="item-details">
            <textarea class="item-description" placeholder="Deskripsi layanan (optional)" rows="2"></textarea>
            <div class="item-image-upload">
                <label class="file-upload-label">
                    <input type="file" class="item-image-input" accept="image/*">
                    <span>+ Tambah Gambar</span>
                </label>
                <div class="item-image-preview" style="display: none;">
                    <img class="item-image-preview-img" alt="Preview">
                    <button type="button" class="btn-remove-image">×</button>
                </div>
            </div>
        </div>
    `;

  itemsList.appendChild(itemCard);

  // Add event listeners
  const removeBtn = itemCard.querySelector(".btn-remove");
  removeBtn.addEventListener("click", () => removeItemRow(itemCard));

  const itemInputs = itemCard.querySelectorAll("input, textarea");
  itemInputs.forEach((input) => {
    if (input.type === "file") {
      input.addEventListener("change", (e) =>
        handleItemImageUpload(e, itemCard),
      );
    } else {
      input.addEventListener("input", updatePreview);
    }
  });

  const removeImageBtn = itemCard.querySelector(".btn-remove-image");
  removeImageBtn.addEventListener("click", () =>
    handleRemoveItemImage(itemCard),
  );

  updateRemoveButtons();
  updatePreview();
}

// Handle Item Image Upload
function handleItemImageUpload(e, itemCard) {
  const file = e.target.files[0];
  const previewContainer = itemCard.querySelector(".item-image-preview");
  const previewImg = itemCard.querySelector(".item-image-preview-img");

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (event) {
      previewImg.src = event.target.result;
      previewContainer.style.display = "inline-block";
      updatePreview();
    };
    reader.readAsDataURL(file);
  }
}

// Handle Remove Item Image
function handleRemoveItemImage(itemCard) {
  const fileInput = itemCard.querySelector(".item-image-input");
  const previewContainer = itemCard.querySelector(".item-image-preview");
  const previewImg = itemCard.querySelector(".item-image-preview-img");

  fileInput.value = "";
  previewImg.src = "";
  previewContainer.style.display = "none";
  updatePreview();
}

// Remove Item Row
function removeItemRow(card) {
  card.remove();
  updateRemoveButtons();
  updatePreview();
}

// Update Remove Buttons State
function updateRemoveButtons() {
  const cards = itemsList.querySelectorAll(".item-card");
  const removeButtons = itemsList.querySelectorAll(".btn-remove");

  removeButtons.forEach((btn, index) => {
    btn.disabled = cards.length === 1;
  });
}

// Collect Items Data
function collectItemsData() {
  const items = [];
  const cards = itemsList.querySelectorAll(".item-card");

  cards.forEach((card) => {
    const name = card.querySelector(".item-name").value;
    const qty = parseFloat(card.querySelector(".item-qty").value) || 0;
    const price = parseFloat(card.querySelector(".item-price").value) || 0;
    const description = card.querySelector(".item-description").value;
    const imagePreview = card.querySelector(".item-image-preview-img");
    const image = imagePreview && imagePreview.src ? imagePreview.src : null;

    if (name && qty > 0 && price >= 0) {
      items.push({
        name,
        qty,
        price,
        description,
        image,
        total: qty * price,
      });
    }
  });

  return items;
}

// Calculate Totals
function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountPercent = parseFloat(inputs.discount.value) || 0;
  const taxPercent = parseFloat(inputs.tax.value) || 0;

  const discountAmount = subtotal * (discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxPercent / 100);
  const total = afterDiscount + taxAmount;

  return {
    subtotal,
    discountPercent,
    discountAmount,
    taxPercent,
    taxAmount,
    total,
  };
}

// Update Preview
function updatePreview() {
  // Logo
  if (logoData) {
    preview.logo.src = logoData;
    preview.logoContainer.style.display = "block";
  } else {
    preview.logoContainer.style.display = "none";
  }

  // Business Info
  preview.businessName.textContent = inputs.businessName.value || "Nama Usaha";
  preview.businessContact.textContent =
    inputs.businessContact.value || "Kontak Usaha";

  // Client Info
  preview.clientName.textContent = inputs.clientName.value || "-";
  preview.eventType.textContent = inputs.eventType.value || "-";
  preview.eventDate.textContent = inputs.eventDate.value
    ? formatDate(new Date(inputs.eventDate.value))
    : "-";
  preview.invoiceNumber.textContent = inputs.invoiceNumber.value || "-";

  // Items
  const items = collectItemsData();

  if (items.length === 0) {
    preview.items.innerHTML =
      '<tr><td colspan="4" class="empty-state">Belum ada item</td></tr>';
  } else {
    preview.items.innerHTML = items
      .map((item) => {
        let serviceContent = `<div class="service-item">
                <div class="service-name">${item.name}</div>`;

        if (item.description) {
          serviceContent += `<div class="service-description">${item.description}</div>`;
        }

        if (item.image) {
          serviceContent += `<img src="${item.image}" class="service-image" alt="${item.name}">`;
        }

        serviceContent += `</div>`;

        return `
                <tr>
                    <td>${serviceContent}</td>
                    <td>${item.qty}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.total)}</td>
                </tr>
            `;
      })
      .join("");
  }

  // Calculations
  const totals = calculateTotals(items);

  preview.subtotal.textContent = formatCurrency(totals.subtotal);

  // Discount
  if (totals.discountPercent > 0) {
    preview.discountRow.style.display = "flex";
    preview.discountPercent.textContent = totals.discountPercent;
    preview.discount.textContent = "- " + formatCurrency(totals.discountAmount);
  } else {
    preview.discountRow.style.display = "none";
  }

  // Tax
  if (totals.taxPercent > 0) {
    preview.taxRow.style.display = "flex";
    preview.taxPercent.textContent = totals.taxPercent;
    preview.tax.textContent = formatCurrency(totals.taxAmount);
  } else {
    preview.taxRow.style.display = "none";
  }

  preview.total.textContent = formatCurrency(totals.total);

  // Notes
  if (inputs.notes.value.trim()) {
    preview.notesSection.style.display = "block";
    preview.notes.textContent = inputs.notes.value;
  } else {
    preview.notesSection.style.display = "none";
  }
}

// Format Currency (Indonesian Rupiah)
function formatCurrency(amount) {
  return (
    "Rp " +
    amount.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

// Format Date
function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("id-ID", options);
}

// Generate PDF
async function generatePDF() {
  const invoiceElement = document.getElementById("invoicePreview");
  const button = downloadBtn;

  // Disable button
  button.disabled = true;
  button.textContent = "Generating...";

  try {
    // Use html2canvas to capture the invoice
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");

    // Calculate PDF dimensions with margins
    const imgWidth = 190; // A4 width with margins (210 - 20)
    const pageHeight = 277; // A4 height with margins (297 - 20)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const leftMargin = 10;
    const topMargin = 10;

    // Create PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF (handle multiple pages if needed)
    pdf.addImage(
      imgData,
      "PNG",
      leftMargin,
      topMargin + position,
      imgWidth,
      imgHeight,
    );
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        leftMargin,
        topMargin + position,
        imgWidth,
        imgHeight,
      );
      heightLeft -= pageHeight;
    }

    // Generate filename
    const invoiceNum = inputs.invoiceNumber.value || "invoice";
    const filename = `${invoiceNum.replace(/[^a-z0-9]/gi, "_")}.pdf`;

    // Download
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Terjadi kesalahan saat membuat PDF. Silakan coba lagi.");
  } finally {
    // Re-enable button
    button.disabled = false;
    button.textContent = "Download PDF";
  }
}

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
