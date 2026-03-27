// src/components/CheckoutForm.jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; 

const CheckoutForm = ({ cartItems, totalAmount }) => {
  const [formData, setFormData] = useState({
    name: '', rollNumber: '', branch: '', phone: '', utrNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateOrderId = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newOrderId = generateOrderId();

    try {
      await addDoc(collection(db, "orders"), {
        orderId: newOrderId,
        customerDetails: formData,
        cart: cartItems,
        total: totalAmount,
        status: "Pending",
        timestamp: serverTimestamp() 
      });
      setOrderSuccess(newOrderId);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to connect to database. Check your Firebase config!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200">
        <h2 className="text-2xl font-bold text-green-700">Order Placed!</h2>
        <p className="mt-4 text-4xl font-black text-gray-900">{orderSuccess}</p>
        <p className="mt-2 text-gray-600">Show this ID at the Biryani stall.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white border rounded-xl shadow-sm">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Checkout Details</h3>
      
      <div className="space-y-4">
        <input required type="text" name="name" onChange={handleChange}
          className="w-full p-3 border rounded-lg bg-gray-50" placeholder="Full Name" />
        
        <div className="grid grid-cols-2 gap-4">
          <input required type="text" name="rollNumber" onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-50" placeholder="Roll Number" />
          <input required type="text" name="branch" onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-50" placeholder="Branch & Year" />
        </div>

        <input required type="tel" name="phone" onChange={handleChange}
          className="w-full p-3 border rounded-lg bg-gray-50" placeholder="Phone Number" />
      </div>

      <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100 text-center">
        <p className="font-bold text-xl mb-3 text-blue-900">Total: ₹{totalAmount}</p>
        <div className="w-40 h-40 bg-white mx-auto flex items-center justify-center mb-4 rounded-lg shadow-sm">
           <span className="text-gray-400 text-sm">QR Code Image</span>
        </div>
        <input required type="text" name="utrNumber" onChange={handleChange} maxLength="12" minLength="12"
          className="w-full p-3 border text-center font-mono tracking-widest rounded-lg" placeholder="12-Digit UTR Number" />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="mt-6 w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400">
        {isSubmitting ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
};

export default CheckoutForm;