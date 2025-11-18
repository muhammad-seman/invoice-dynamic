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

  // Attach event listeners to initial item card
  attachItemCardListeners(itemsList.querySelector(".item-card"));
  updateRemoveButtons();

  // Initial preview update
  updatePreview();
}

// Attach Event Listeners to Item Card
function attachItemCardListeners(itemCard) {
  const removeBtn = itemCard.querySelector(".btn-remove");
  removeBtn.addEventListener("click", () => removeItemRow(itemCard));

  const itemInputs = itemCard.querySelectorAll("input, textarea");
  itemInputs.forEach((input) => {
    if (input.type === "file") {
      input.addEventListener("change", (e) =>
        handleItemImagesUpload(e, itemCard),
      );
    } else {
      input.addEventListener("input", updatePreview);
    }
  });
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
                    <input type="file" class="item-image-input" accept="image/*" multiple>
                    <span>+ Tambah Gambar (Max 5)</span>
                </label>
                <div class="item-gallery" style="display: none;"></div>
            </div>
        </div>
    `;

  itemsList.appendChild(itemCard);

  // Attach event listeners using shared function
  attachItemCardListeners(itemCard);

  updateRemoveButtons();
  updatePreview();
}

// Handle Multiple Item Images Upload
function handleItemImagesUpload(e, itemCard) {
  const files = Array.from(e.target.files).slice(0, 5); // Max 5 images
  const galleryContainer = itemCard.querySelector(".item-gallery");

  if (files.length === 0) return;

  galleryContainer.innerHTML = "";
  galleryContainer.style.display = "grid";
  galleryContainer.className = `item-gallery gallery-${files.length}`;

  files.forEach((file, index) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const imgWrapper = document.createElement("div");
        imgWrapper.style.position = "relative";

        const img = document.createElement("img");
        img.src = event.target.result;
        img.alt = `Image ${index + 1}`;

        const removeBtn = document.createElement("button");
        removeBtn.className = "gallery-remove-btn";
        removeBtn.textContent = "×";
        removeBtn.type = "button";
        removeBtn.addEventListener("click", () => {
          imgWrapper.remove();
          updateGalleryLayout(itemCard);
          updatePreview();
        });

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(removeBtn);
        galleryContainer.appendChild(imgWrapper);

        updatePreview();
      };
      reader.readAsDataURL(file);
    }
  });
}

// Update Gallery Layout after removing image
function updateGalleryLayout(itemCard) {
  const gallery = itemCard.querySelector(".item-gallery");
  const images = gallery.querySelectorAll("img");
  const count = images.length;

  if (count === 0) {
    gallery.style.display = "none";
    gallery.className = "item-gallery";
  } else {
    gallery.className = `item-gallery gallery-${count}`;
  }
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

    // Get all images from gallery
    const images = [];
    const galleryImgs = card.querySelectorAll(".item-gallery img");
    galleryImgs.forEach((img) => {
      if (img.src && img.src.startsWith("data:image")) {
        images.push(img.src);
      }
    });

    if (name && qty > 0 && price >= 0) {
      items.push({
        name,
        qty,
        price,
        description,
        images,
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

        // Add gallery if images exist
        if (item.images && item.images.length > 0) {
          serviceContent += `<div class="service-gallery gallery-${item.images.length}">`;
          item.images.forEach((imgSrc, idx) => {
            serviceContent += `<img src="${imgSrc}" alt="${item.name} ${idx + 1}">`;
          });
          serviceContent += `</div>`;
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
