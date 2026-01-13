'use client';

import { useEffect, useState } from 'react';

interface QuoteItem {
  type: string;
  label: string;
  value: string;
  price: number;
}

interface FormData {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  serviceCalculator?: string;
  finalPrice?: number;
  quote?: QuoteItem[];
}

interface FormPreviewProps {
  id: string;
  onBack: () => void;
}

export default function FormPreview({ id, onBack }: FormPreviewProps) {
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`/api/getFormById?id=${id}`);
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error('Error fetching form:', err);
      }
    }
    fetchForm();
  }, [id]);

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[100vh] bg-white">
        {/* <img src="/BB-web-chai-1.gif" alt="Loading..." className="w-60 h-60" /> */}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.28) 18%, rgba(252,220,84,0.24) 100%)',
      }}
    >
      <div
        className="max-w-3xl w-full p-6 flex flex-col
                   md:p-[20px_20px]
                   bg-white rounded-[8px] border border-[#1E1E1E]
                   shadow-[6px_5px_0px_0px_#262626]"
      >
        {/* Header with Back button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-center flex-1">
            Customer Quotation Preview
          </h2>
          <button
            onClick={onBack}
           className="rounded-[5px] bg-[#262626] shadow-[2px_2px_0px_0px_#F9B31B] 
                                       flex justify-center items-center gap-[10px] px-[20px] py-[6px] 
                                       text-[#F9B31B] font-semibold transition-colors"
          >
            Back
          </button>
        </div>

        {/* Details */}
        <div className="mb-2">
          <strong>Name:</strong> {formData.name || 'N/A'}
        </div>
        <div className="mb-2">
          <strong>Email:</strong> {formData.email || 'N/A'}
        </div>
        <div className="mb-2">
          <strong>Phone:</strong> {formData.phone || 'N/A'}
        </div>
        <div className="mb-2">
          <strong>Service:</strong> {formData.serviceCalculator || 'N/A'}
        </div>
        <div className="mb-2">
          <strong>Final Price:</strong>{' '}
          {formData.finalPrice
            ? `₹${formData.finalPrice.toLocaleString('en-IN')}`
            : 'N/A'}
        </div>

        {/* Quotation */}
        <div className="mb-4">
          <strong>Quotation:</strong>
          <div className="mt-2 p-4 bg-gray-100 rounded space-y-2">
            {Array.isArray(formData.quote) && formData.quote.length > 0 ? (
              formData.quote.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b pb-1 last:border-b-0"
                >
                  <span>
                    <strong>{item.type} - {item.label}</strong> <br />
                     {item.value}
                  </span>
                  <span>₹{item.price.toLocaleString('en-IN')}</span>
                </div>
              ))
            ) : (
              <div>N/A</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
