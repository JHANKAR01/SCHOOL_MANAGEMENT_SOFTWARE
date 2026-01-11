import React from 'react';
import { Row, Col } from '../../components/Layout';

const STOCK_ITEMS = [
  { id: 1, name: 'A4 Paper Reams', quantity: 15, threshold: 20, unit: 'Box' },
  { id: 2, name: 'Whiteboard Markers (Blue)', quantity: 45, threshold: 10, unit: 'Pc' },
  { id: 3, name: 'Chalk Boxes (White)', quantity: 8, threshold: 10, unit: 'Box' },
];

export const InventoryDashboard = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Store & Inventory</h1>

      <Row>
        {/* Stock List */}
        <Col className="w-full lg:w-1/2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-700">Current Stock Levels</h2>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">2 Low Items</span>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-center">Qty</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {STOCK_ITEMS.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-center text-sm font-mono">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right">
                      {item.quantity < item.threshold ? (
                        <span className="text-xs text-red-600 font-bold">LOW STOCK</span>
                      ) : (
                        <span className="text-xs text-green-600 font-bold">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Col>

        {/* Requisitions */}
        <Col className="w-full lg:w-1/2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full">
            <h2 className="font-bold text-gray-700 mb-4">Pending Staff Requisitions</h2>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between">
                  <p className="font-bold text-sm">Science Dept.</p>
                  <span className="text-xs text-gray-500">Today</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Requested: 5x HCL Acid Bottles, 10x Beakers</p>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-gray-900 text-white text-xs py-1 rounded">Approve</button>
                  <button className="flex-1 border border-gray-300 text-gray-700 text-xs py-1 rounded">Reject</button>
                </div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between">
                  <p className="font-bold text-sm">Exam Cell</p>
                  <span className="text-xs text-gray-500">Yesterday</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Requested: 50x A4 Paper Reams</p>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-gray-900 text-white text-xs py-1 rounded">Approve</button>
                  <button className="flex-1 border border-gray-300 text-gray-700 text-xs py-1 rounded">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
