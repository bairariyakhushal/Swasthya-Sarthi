
import { motion } from "framer-motion"
import {
  FaPills,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaStore,
  FaPhoneAlt,
  FaShoppingCart,
} from "react-icons/fa"

export default function ProductCard({ pharmacy, index, cartQty, onAddToCart, onRemoveFromCart, formatCurrency }) {
  const itemTotal = cartQty * pharmacy.price

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-blue-200 flex flex-row group w-full max-w-3xl"
    >
      <div className="flex flex-col w-2/4 border-r border-gray-200">
        {/* Image Section */}
        <div className="relative bg-gradient-to-br  p-6 flex items-center justify-center h-60 overflow-hidden transition-all duration-500">
          {pharmacy.medicineImage ? (
            <img
              src={pharmacy.medicineImage || "/placeholder.svg"}
              alt={pharmacy.medicineName}
              className="max-w-full max-h-full object-contain rounded-lg group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = "none"
                e.target.parentElement.querySelector(".fallback-icon").classList.remove("hidden")
              }}
            />
          ) : null}

          {/* Fallback Icon */}
          <div className={`fallback-icon flex items-center justify-center ${pharmacy.medicineImage ? "hidden" : ""}`}>
            <div className="text-center">
              <div className="inline-flex p-6 bg-white rounded-3xl shadow-lg mb-3">
                <FaPills className="text-5xl text-blue-200" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No image available</p>
            </div>
          </div>

          {/* Badges Container */}
          <div className="absolute inset-0 p-4">
            {/* Distance Badge - Top Left */}
            <div className="absolute top-4 left-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-white/90 border-2 border-blue-300 px-3 py-2 rounded-full shadow-md backdrop-blur-md hover:scale-105 transition-transform duration-200">
                <FaMapMarkerAlt className="text-sm" />
                {pharmacy.distance}
              </span>
            </div>
          </div>
        </div>

        {/* Medicine Name & Stock Section */}
        <div className="p-5 flex-1  flex flex-col justify-center border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-200">
            {pharmacy.medicineName}
          </h3>

          {/* Stock Info */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 font-medium">Stock:</span>
            <span
              className={`font-bold px-4 py-2 rounded-xl shadow-sm border-2 transition-all duration-200 ${
                pharmacy.stock > 50
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                  : pharmacy.stock > 10
                    ? "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                    : "text-red-700 bg-red-50 border-red-200 hover:bg-red-100"
              }`}
            >
              {pharmacy.stock} units
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-3/5 p-5">
        {/* Availability Badge */}
        <div className="mb-4 flex justify-end">
          {pharmacy.isAvailable ? (
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-full shadow-sm">
              <FaCheckCircle className="text-sm" />
              In Stock
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-full shadow-sm">
              <FaTimesCircle className="text-sm" />
              Out of Stock
            </span>
          )}
        </div>

        {/* Pharmacy Information Card */}
        <div className="mb-5 flex-1">
          <div className=" rounded-xl p-4 border-2 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300 space-y-3 h-full">
            {/* Pharmacy Name & Address */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12  rounded-xl flex items-center justify-center  group-hover:scale-110 transition-transform duration-300">
                <FaStore className="text-blue-600 text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-base mb-1.5 truncate hover:text-blue-600 transition-colors" title={pharmacy.pharmacyName}>
                  {pharmacy.pharmacyName}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed" title={pharmacy.address}>
                  {pharmacy.address}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2.5 text-xs text-gray-700 bg-white rounded-lg px-3.5 py-2.5 border-2 border-slate-200 hover:border-blue-300 transition-colors duration-200 shadow-sm">
              <FaPhoneAlt className="text-blue-600 flex-shrink-0 text-sm" />
              <span className="font-semibold truncate">{pharmacy.ownerContact}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{formatCurrency(pharmacy.price)}</span>
            <span className="text-sm text-gray-500 font-semibold">/unit</span>
          </div>

          {/* Show total price when items are in cart */}
          {cartQty > 0 && (
            <div className="flex items-center justify-between gap-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="text-blue-700 font-semibold">Cart Total:</span>
              <span className="text-blue-900 font-bold text-xl">{formatCurrency(itemTotal)}</span>
            </div>
          )}
        </div>

        {/* Cart Actions */}
        <div className="mt-auto">
          {cartQty > 0 ? (
            <div className="flex items-stretch gap-3">
              {/* Quantity Controls */}
              <div className="flex items-center flex-1 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 rounded-xl p-2 border-2 border-gray-300 shadow-md">
                <button
                  onClick={() => onRemoveFromCart(pharmacy)}
                  className="w-11 h-11 bg-white text-gray-700 font-bold text-xl rounded-xl hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:border-red-300 active:scale-90 transition-all duration-200 flex items-center justify-center shadow-sm border-2 border-gray-200 hover:shadow-md"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="flex-1 font-bold text-gray-900 text-xl text-center px-2">{cartQty}</div>
                <button
                  onClick={() => onAddToCart(pharmacy)}
                  disabled={!pharmacy.isAvailable}
                  className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 transition-all duration-200 flex items-center justify-center shadow-md disabled:hover:from-blue-600 disabled:hover:to-indigo-600"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(pharmacy)}
              disabled={!pharmacy.isAvailable}
              className="w-full px-6 py-4 bg-slate-50 text-gray-700 font-bold rounded-xl hover:border-2 hover:border-gray-400 hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg group"
            >
              <FaShoppingCart className="text-lg group-hover:scale-110 transition-transform duration-200" />
              <span className="text-base">{pharmacy.isAvailable ? "Add to Cart" : "Out of Stock"}</span>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
