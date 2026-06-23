import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./Products.css";

const CATEGORIES = [
  { id: "frames", label: "Frames" },
  { id: "contacts", label: "Contact Lenses" },
  { id: "sunglasses", label: "Sunglasses" },
  { id: "for-him", label: "For Him" },
  { id: "for-her", label: "For Her" },
  { id: "for-kids", label: "For Kids" },
];
const CLOUD_NAME = "dgde8cwjk";
const UPLOAD_PRESET = "cec_products"; // Create this unsigned preset in Cloudinary dashboard

async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          price: String(product.price),
          category: product.category || [],
          tag: product.tag || "",
          stock_qty: String(product.stock_qty),
          discount_percent: String(product.discount_percent),
          image_url: product.image_url || "",
        }
      : {
          name: "",
          price: "",
          category: [],
          tag: "",
          stock_qty: "",
          discount_percent: "0",
          image_url: "",
        },
  );

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setPreview] = useState(product?.image_url || null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.price || isNaN(form.price) || Number(form.price) < 0)
      e.price = "Enter a valid price.";
    if (form.category.length === 0)
      e.category = "Select at least one category.";
    if (!form.stock_qty || isNaN(form.stock_qty) || Number(form.stock_qty) < 0)
      e.stock_qty = "Enter a valid stock quantity.";
    if (
      isNaN(form.discount_percent) ||
      Number(form.discount_percent) < 0 ||
      Number(form.discount_percent) > 100
    )
      e.discount_percent = "Discount must be 0–100.";
    return e;
  }

  function toggleCat(catId) {
    setForm((f) => ({
      ...f,
      category: f.category.includes(catId)
        ? f.category.filter((c) => c !== catId)
        : [...f.category, catId],
    }));
    if (errors.category) setErrors((p) => ({ ...p, category: "" }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      let image_url = form.image_url;
      if (imageFile) {
        image_url = await uploadToCloudinary(imageFile);
      }
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        tag: form.tag.trim() || null,
        stock_qty: Number(form.stock_qty),
        discount_percent: Number(form.discount_percent),
        image_url: image_url || null,
      };
      const { error } = product
        ? await supabase.from("products").update(payload).eq("id", product.id)
        : await supabase
            .from("products")
            .insert([
              {
                ...payload,
                created_by: (await supabase.auth.getUser()).data.user?.id,
              },
            ]);
      if (error) throw error;
      onSaved();
    } catch (err) {
      alert("Error saving product: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function f(k) {
    return {
      value: form[k],
      onChange: (e) => {
        setForm((p) => ({ ...p, [k]: e.target.value }));
        if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
      },
    };
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal prod-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="admin-modal-title">
          {product ? "Edit product" : "Add product"}
        </h2>
        <div className="prod-form">
          {/* Image upload */}
          <div className="prod-field">
            <label className="prod-label">Product image</label>
            <div className="prod-image-wrap">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="prod-image-preview"
                />
              )}
              <label className="prod-image-btn">
                {imagePreview ? "Change image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  className="prod-image-remove"
                  onClick={() => {
                    setImageFile(null);
                    setPreview(null);
                    setForm((f) => ({ ...f, image_url: "" }));
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="prod-field">
            <label className="prod-label">Product name</label>
            <input
              className={`prod-input${errors.name ? " prod-input--err" : ""}`}
              {...f("name")}
              placeholder="e.g. Classic Oval Frame"
            />
            {errors.name && <span className="prod-err">{errors.name}</span>}
          </div>

          <div className="prod-row">
            <div className="prod-field">
              <label className="prod-label">Price (₦)</label>
              <input
                className={`prod-input${errors.price ? " prod-input--err" : ""}`}
                type="number"
                min="0"
                {...f("price")}
                placeholder="15000"
              />
              {errors.price && <span className="prod-err">{errors.price}</span>}
            </div>
            <div className="prod-field">
              <label className="prod-label">Stock quantity</label>
              <input
                className={`prod-input${errors.stock_qty ? " prod-input--err" : ""}`}
                type="number"
                min="0"
                {...f("stock_qty")}
                placeholder="0"
              />
              {errors.stock_qty && (
                <span className="prod-err">{errors.stock_qty}</span>
              )}
            </div>
          </div>

          <div className="prod-field">
            <label className="prod-label">Discount (%)</label>
            <input
              className={`prod-input${errors.discount_percent ? " prod-input--err" : ""}`}
              type="number"
              min="0"
              max="100"
              {...f("discount_percent")}
              placeholder="0"
            />
            {errors.discount_percent && (
              <span className="prod-err">{errors.discount_percent}</span>
            )}
          </div>

          <div className="prod-field">
            <label className="prod-label">
              Tag{" "}
              <span
                style={{ color: "var(--color-text-muted)", fontWeight: 400 }}
              >
                (optional — e.g. "New", "Sale")
              </span>
            </label>
            <input className="prod-input" {...f("tag")} placeholder="New" />
          </div>

          <div className="prod-field">
            <label className="prod-label">Categories</label>
            <div className="prod-cats">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`prod-cat-btn${form.category.includes(cat.id) ? " prod-cat-btn--on" : ""}`}
                  onClick={() => toggleCat(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && (
              <span className="prod-err">{errors.category}</span>
            )}
          </div>
        </div>

        <div
          className="admin-modal-actions"
          style={{ marginTop: "var(--space-6)" }}
        >
          <button
            className="admin-btn admin-btn--ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? imageFile
                ? "Uploading image…"
                : "Saving…"
              : product
                ? "Save changes"
                : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation modal — no browser dialogs
function DeleteModal({ product, onClose, onConfirm, deleting }) {
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="admin-modal-icon-wrap"
          style={{ background: "var(--teal-50)", color: "var(--teal-700)" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </div>
        <h2 className="admin-modal-title">Delete product?</h2>
        <p className="admin-modal-body">
          "<strong>{product.name}</strong>" will be permanently deleted. This
          cannot be undone.
        </p>
        <div className="admin-modal-actions">
          <button
            className="admin-btn admin-btn--ghost"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="admin-btn admin-btn--danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { isSuperAdmin } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("products").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    load();
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || []).some((c) =>
        c.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  if (loading)
    return (
      <div className="admin-empty">
        <p className="admin-empty-body">Loading products…</p>
      </div>
    );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products & Inventory</h1>
          <p className="admin-page-subtitle">
            Items at 3 or fewer units trigger a restock alert automatically.
          </p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setModal("add")}
        >
          + Add product
        </button>
      </div>

      <div className="prod-search-wrap">
        <input
          className="prod-search"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-card">
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">
              {search ? "No products match your search." : "No products yet."}
            </p>
            <p className="admin-empty-body">
              {!search && 'Click "Add product" to get started.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Image</th>
                <th>Product</th>
                <th>Categories</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const lowStock = p.stock_qty <= 3;
                const discountedPrice =
                  p.discount_percent > 0
                    ? Math.round(p.price * (1 - p.discount_percent / 100))
                    : null;
                return (
                  <tr key={p.id} className={lowStock ? "prod-row--low" : ""}>
                    <td>
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="prod-thumb"
                        />
                      ) : (
                        <div className="prod-thumb-placeholder">📦</div>
                      )}
                    </td>
                    <td>
                      <p style={{ fontWeight: 500, margin: 0 }}>{p.name}</p>
                      {p.tag && <span className="prod-tag">{p.tag}</span>}
                    </td>
                    <td
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {(p.category || []).join(", ") || "—"}
                    </td>
                    <td>
                      {discountedPrice ? (
                        <span>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "var(--color-text-muted)",
                              marginRight: 4,
                            }}
                          >
                            ₦{p.price.toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--teal-700)",
                            }}
                          >
                            ₦{discountedPrice.toLocaleString()}
                          </span>
                        </span>
                      ) : (
                        <span>₦{p.price.toLocaleString()}</span>
                      )}
                    </td>
                    <td>
                      {p.discount_percent > 0
                        ? `${p.discount_percent}% off`
                        : "—"}
                    </td>
                    <td
                      style={{
                        fontWeight: lowStock ? 600 : 400,
                        color: lowStock ? "var(--teal-700)" : "inherit",
                      }}
                    >
                      {p.stock_qty}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${lowStock ? "admin-badge--low-stock" : "admin-badge--in-stock"}`}
                      >
                        {lowStock ? "Low stock" : "In stock"}
                      </span>
                    </td>
                    <td>
                      <div className="prod-actions">
                        <button
                          className="admin-btn admin-btn--ghost prod-action-btn"
                          onClick={() => setModal(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn--danger prod-action-btn"
                          onClick={() => setDeleteTarget(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ProductModal
          product={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
