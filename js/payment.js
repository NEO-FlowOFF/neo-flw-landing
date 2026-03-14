/**
 * FlowPay Shared Payment Logic
 * NEØ.FLOWOFF Agency
 */

let currentProduct = { name: "", price: 0 };
let chargeId = null;
let statusInterval = null;
let currentCustomerEmail = "";

const FLOWPAY_API_CANDIDATES = [
    window.location.origin,
    window.__FLOWPAY_API__ || "https://api.flowpay.cash",
    "https://flowpay-api.flowpay-system.workers.dev",
];

let activeFlowPayApi = FLOWPAY_API_CANDIDATES[0];

async function fetchFlowPay(path, options = {}) {
    const orderedApis = [
        activeFlowPayApi,
        ...FLOWPAY_API_CANDIDATES.filter((api) => api !== activeFlowPayApi),
    ];
    let lastError = null;

    for (const apiBase of orderedApis) {
        try {
            const response = await fetch(`${apiBase}${path}`, options);

            // 404 normally indicates missing endpoint on this host, try next.
            if (response.status === 404) {
                lastError = new Error(`Error 404 at ${apiBase}${path}`);
                continue;
            }

            activeFlowPayApi = apiBase;
            return response;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Failed to connect to FlowPay API.");
}

/**
 * Initializes payment for a specific product
 * Used both in modal (landing) and inline (product pages)
 */
function initPayment(name, price) {
    currentProduct = { name, price };
    currentCustomerEmail = "";
    
    const nameEl = document.getElementById("flowpay-product-name");
    const priceEl = document.getElementById("flowpay-product-price");
    
    if (nameEl) nameEl.innerText = `Pacote ${name}`;
    if (priceEl) priceEl.innerText = `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

    const step1 = document.getElementById("flowpay-step-1");
    const step2 = document.getElementById("flowpay-step-2");
    const step3 = document.getElementById("flowpay-step-3");
    const errorEl = document.getElementById("flowpay-error");

    if (step1) step1.style.display = "flex";
    if (step2) step2.style.display = "none";
    if (step3) step3.style.display = "none";
    if (errorEl) errorEl.style.display = "none";

    // Reset QR Code and Skeleton
    const qrImg = document.getElementById("flowpay-qr-img");
    const qrSkeleton = document.getElementById("flowpay-qr-skeleton");
    if (qrImg) {
        qrImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        qrImg.style.display = "none";
    }
    if (qrSkeleton) {
        qrSkeleton.style.display = "block";
    }

    // Tracking: Begin checkout
    if (window.pushNeoDataLayerEvent) {
        window.pushNeoDataLayerEvent("begin_checkout", {
            item_name: name,
            price: price,
        });
    }

    if (typeof lucide !== "undefined" && lucide.createIcons) {
        lucide.createIcons();
    }
}

async function generatePix() {
    const cpfEl = document.getElementById("flowpay-cpf");
    const emailEl = document.getElementById("flowpay-email");
    const btn = document.getElementById("btn-generate-pix");
    const errorEl = document.getElementById("flowpay-error");

    if (!cpfEl || !emailEl) return;

    const cpf = cpfEl.value.replace(/\D/g, "");
    const email = emailEl.value.trim();

    const isValidCPF = (cpf) => {
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        let sum = 0, rest;
        for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        rest = (sum * 10) % 11;
        if ((rest === 10) || (rest === 11)) rest = 0;
        if (rest !== parseInt(cpf.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        rest = (sum * 10) % 11;
        if ((rest === 10) || (rest === 11)) rest = 0;
        if (rest !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    };

    const isValidCNPJ = (cnpj) => {
        if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;
        let size = cnpj.length - 2;
        let numbers = cnpj.substring(0, size);
        let digits = cnpj.substring(size);
        let sum = 0;
        let pos = size - 7;
        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }
        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result != digits.charAt(0)) return false;
        size = size + 1;
        numbers = cnpj.substring(0, size);
        sum = 0;
        pos = size - 7;
        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }
        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result != digits.charAt(1)) return false;
        return true;
    };

    const isTaxIdValid = (id) => {
        if (id.length === 11) return isValidCPF(id);
        if (id.length === 14) return isValidCNPJ(id);
        return false;
    };

    if (!isTaxIdValid(cpf)) {
        alert("Por favor, insira um CPF ou CNPJ válido.");
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "<span>Gerando...</span>";
    }
    if (errorEl) errorEl.style.display = "none";

    try {
        currentCustomerEmail = email.toLowerCase();
        const response = await fetchFlowPay("/api/create-charge-landing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount_brl: currentProduct.price,
                product_ref: `landing-${currentProduct.name.toLowerCase()}`,
                customer_cpf: cpf,
                customer_email: email,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${response.statusText}. ${errorText.substring(0, 100)}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid API response format.");
        }

        const data = await response.json();

        if (data.success) {
            chargeId = data.charge.charge_id;
            const qrImg = document.getElementById("flowpay-qr-img");
            const copyCode = document.getElementById("flowpay-copy-code");
            
            if (qrImg) qrImg.src = data.charge.qr_code;
            if (copyCode) copyCode.innerText = data.charge.pix_copy_paste;

            const step1 = document.getElementById("flowpay-step-1");
            const step2 = document.getElementById("flowpay-step-2");
            
            if (step1) step1.style.display = "none";
            if (step2) step2.style.display = "flex";

            // Tracking: PIX generated
            if (window.pushNeoDataLayerEvent) {
                window.pushNeoDataLayerEvent("add_payment_info", {
                    item_name: currentProduct.name,
                    price: currentProduct.price,
                });
            }

            startStatusCheck();
        } else {
            throw new Error(data.message || "Unknown error");
        }
    } catch (error) {
        console.error("FlowPay Error:", error);
        if (errorEl) {
            errorEl.innerText = error.message.includes("JSON") ? "API Connection error." : error.message;
            errorEl.style.display = "block";
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = "<span>Gerar PIX</span>";
        }
    }
}

function copyPixCode() {
    const copyCode = document.getElementById("flowpay-copy-code");
    if (!copyCode) return;
    
    const code = copyCode.innerText;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = copyCode.innerText;
        copyCode.innerText = "Copiado!";
        setTimeout(() => {
            copyCode.innerText = code;
        }, 2000);
    });
}

function startStatusCheck() {
    if (statusInterval) clearInterval(statusInterval);
    statusInterval = setInterval(async () => {
        try {
            const response = await fetchFlowPay(`/api/charge/${chargeId}`);

            if (!response.ok) return;

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) return;

            const data = await response.json();

            const paidStatuses = ["PIX_PAID", "PENDING_REVIEW", "APPROVED", "SETTLED", "COMPLETED"];
            if (data.success && paidStatuses.includes(data.status)) {
                clearInterval(statusInterval);
                showSuccess();
            }
        } catch (e) {
            console.error("Status check error:", e);
        }
    }, 5000);
}

function showSuccess() {
    const step2 = document.getElementById("flowpay-step-2");
    const step3 = document.getElementById("flowpay-step-3");
    
    if (step2) step2.style.display = "none";
    if (step3) step3.style.display = "flex";

    // Update URL with success param for tracking
    const url = new URL(window.location);
    url.searchParams.set("checkout", "success");
    window.history.pushState({}, "", url);

    // Ads Engineer Tracking
    if (window.triggerAdsEngineerWebhook) {
        window.triggerAdsEngineerWebhook("Purchase", {
            value: currentProduct.price,
        });
    }

    // DataLayer Tracking
    if (window.pushNeoDataLayerEvent) {
        window.pushNeoDataLayerEvent("purchase_complete", {
            product_name: currentProduct.name,
            value: currentProduct.price,
            currency: "BRL",
        });
    }

    notifyPurchaseConfirmation().catch((error) => {
        console.error("Purchase confirmation email error:", error);
    });

    if (typeof lucide !== "undefined" && lucide.createIcons) {
        lucide.createIcons();
    }
}

// Global exposure for backward compatibility or simple triggers
window.openFlowPay = (name, price) => {
    initPayment(name, price);
    const modal = document.getElementById("flowpay-modal");
    if (modal) modal.classList.add("active");
};

window.closeFlowPay = () => {
    const modal = document.getElementById("flowpay-modal");
    if (modal) modal.classList.remove("active");
    if (statusInterval) clearInterval(statusInterval);
};


// Input Masking Logic
document.addEventListener("input", (e) => {
    if (e.target && e.target.id === "flowpay-cpf") {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length <= 11) {
            // CPF Mask: 000.000.000-00
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        } else {
            // CNPJ Mask: 00.000.000/0000-00
            value = value.substring(0, 14);
            value = value.replace(/^(\d{2})(\d)/, "$1.$2");
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
            value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
            value = value.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
        }
        e.target.value = value;
    }
});

window.generatePix = generatePix;
window.copyPixCode = copyPixCode;

async function notifyPurchaseConfirmation() {
    if (!chargeId) return;

    await fetchFlowPay("/api/payment-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chargeId,
            customerEmail: currentCustomerEmail,
            productName: `Pacote ${currentProduct.name}`,
            amountBrl: currentProduct.price,
        }),
    });
}
