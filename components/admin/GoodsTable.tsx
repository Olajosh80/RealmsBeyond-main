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
    <div className="p-6 bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl dark:bg-gray-900/40 overflow-hidden">
      <h2 className="mb-4 text-xl font-heading font-normal text-rare-primary">
        Current Products
      </h2>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-white/20 backdrop-blur-sm border-b border-white/10">
              <th className="p-4 font-heading font-normal text-rare-primary">Image</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Name</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Category</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Price</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Status</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Tags</th>
              <th className="p-4 font-heading font-normal text-rare-primary text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {goods.map((good) => {
              const imageUrl = good.images && good.images.length > 0 
                ? good.images[0] 
                : good.image || "/placeholder.png";
              
              const status = good.in_stock ? "In Stock" : "Out of Stock";

              return (
                <tr
                  key={good.id}
                  className="hover:bg-white/10 transition-colors"
                >
                  <td className="p-4">
                    <img
                      src={imageUrl}
                      alt={good.name}
                      className="object-cover w-12 h-12 rounded-lg shadow-sm border border-white/20"
                    />
                  </td>
                  <td className="p-4 font-medium text-rare-primary">
                    {good.name}
                  </td>
                  <td className="p-4 text-rare-text-light">
                    <span className="px-2 py-1 bg-white/20 rounded-md text-xs">
                      {good.category}
                    </span>
                  </td>
                  <td className="p-4 text-rare-primary">
                    <div className="flex flex-col">
                      <span className="font-semibold">${parseFloat(good.price).toFixed(2)}</span>
                      {good.compare_at_price && (
                        <span className="text-xs text-rare-text-light/60 line-through">
                          ${parseFloat(good.compare_at_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
                        good.in_stock
                          ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/20"
                          : "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-4 text-rare-text-light italic text-xs">
                    {Array.isArray(good.tags)
                      ? good.tags.join(", ")
                      : good.tags || "-"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onDelete(good.id)}
                      disabled={isDeleting}
                      className="px-4 py-2 text-sm text-white bg-red-500/80 hover:bg-red-600 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body"
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
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
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
