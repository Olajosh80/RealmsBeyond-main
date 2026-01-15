"use client";
import React from "react";

export default function GoodsTable({
  goods,
  onDelete,
  isDeleting = false,
}: {
  goods: any[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}) {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <h2 className="mb-4 text-xl font-heading font-bold text-gray-900">
        Current Products
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider">Image</th>
              <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider">Name</th>
              <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider">Category</th>
              <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider">Price</th>
              <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider">Status</th>
              <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider">Tags</th>
              <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {goods.map((good) => {
              const imageUrl = good.images && good.images.length > 0 
                ? good.images[0] 
                : good.image || "/placeholder.png";
              
              const status = good.in_stock ? "In Stock" : "Out of Stock";

              return (
                <tr
                  key={good.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <img
                      src={imageUrl}
                      alt={good.name}
                      className="object-cover w-12 h-12 rounded-lg shadow-sm border border-gray-200"
                    />
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {good.name}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs border border-gray-200">
                      {good.category}
                    </span>
                  </td>
                  <td className="p-4 text-rare-primary">
                    <div className="flex flex-col">
                      <span className="font-bold">₦{parseFloat(good.price).toLocaleString()}</span>
                      {good.compare_at_price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₦{parseFloat(good.compare_at_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border shadow-sm ${
                        good.in_stock
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 italic text-xs">
                    {Array.isArray(good.tags)
                      ? good.tags.join(", ")
                      : good.tags || "-"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onDelete(good.id)}
                      disabled={isDeleting}
                      className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {goods.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="py-12 text-center text-gray-500"
                >
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
