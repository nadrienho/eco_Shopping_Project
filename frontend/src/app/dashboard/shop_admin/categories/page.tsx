"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
}

export default function ManageCategoriesPage() {

  const { data: session } = useSession();
  const token = session?.accessToken;

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // Fetch categories (public)
  useEffect(() => {
    fetch(`${API}/api/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, [API]);

  // Create category (admin only)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    console.log("TOKEN USED:", token);
    const res = await fetch(`${API}/api/categories/manage/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCategory }),
    });

    if (res.ok) {
      const created = await res.json();
      setCategories([...categories, created]);
      setNewCategory("");
    }

    setLoading(false);
  };

  // Start editing
  const handleEdit = (category: Category) => {
    setEditId(category.id);
    setEditName(category.name);
  };

  // Update category (admin)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    setLoading(true);
    console.log("TOKEN USED:", token);

    const res = await fetch(`${API}/api/categories/manage/${editId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName }),
    });

    if (res.ok) {
      setCategories(categories.map(cat =>
        cat.id === editId ? { ...cat, name: editName } : cat
      ));
      setEditId(null);
      setEditName("");
    }

    setLoading(false);
  };

  // Delete category
  const handleDelete = async (id: number) => {
    setLoading(true);
    console.log("TOKEN USED:", token);

    const res = await fetch(`${API}/api/categories/manage/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setCategories(categories.filter(cat => cat.id !== id));
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Manage Categories</h1>
        <p className="text-green-100">View and manage all categories.</p>
      </div>

      {/* Create */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-6 mt-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="flex-1 border p-2 rounded text-gray-700"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Add
        </button>
      </form>

      {/* List */}
      <ul>
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-2 mb-2 text-gray-800 ">
            {editId === cat.id ? (
              <form onSubmit={handleUpdate} className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 border p-2 rounded"
                  required
                />
                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="bg-gray-300 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="flex-1">{cat.name}</span>
                <button onClick={() => handleEdit(cat)} className="text-blue-600 px-2">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-600 px-2"
                  disabled={loading}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
