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
    <div className="p-6 bg-white border rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-700">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        Current Products
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="p-2">Image</th>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Price</th>
              <th className="p-2">Status</th>
              <th className="p-2">Tags</th>
              <th className="p-2 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {goods.map((good) => {
              const imageUrl = good.images && good.images.length > 0 
                ? good.images[0] 
                : good.image || "/placeholder.png";
              
              const displayPrice = good.compare_at_price 
                ? good.compare_at_price 
                : good.price;
              
              const status = good.in_stock ? "In Stock" : "Out of Stock";

              return (
                <tr
                  key={good.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/30 dark:border-gray-700"
                >
                  <td className="p-2">
                    <img
                      src={imageUrl}
                      alt={good.name}
                      className="object-cover w-12 h-12 rounded"
                    />
                  </td>
                  <td className="p-2 font-medium text-gray-800 dark:text-gray-100">
                    {good.name}
                  </td>
                  <td className="p-2 text-gray-600 dark:text-gray-400">
                    {good.category}
                  </td>
                  <td className="p-2 text-gray-800 dark:text-gray-300">
                    <div className="flex flex-col">
                      <span>${parseFloat(good.price).toFixed(2)}</span>
                      {good.compare_at_price && (
                        <span className="text-xs text-gray-500 line-through">
                          ${parseFloat(good.compare_at_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-lg font-medium ${
                        good.in_stock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-2 text-gray-600 dark:text-gray-400">
                    {Array.isArray(good.tags)
                      ? good.tags.join(", ")
                      : good.tags || "-"}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => onDelete(good.id)}
                      disabled={isDeleting}
                      className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
