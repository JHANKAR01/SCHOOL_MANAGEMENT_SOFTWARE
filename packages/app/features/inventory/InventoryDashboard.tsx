import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Row, Col } from '../../components/Layout';

const STOCK_ITEMS = [
  { id: 1, name: 'A4 Paper Reams', quantity: 15, threshold: 20, unit: 'Box' },
  { id: 2, name: 'Whiteboard Markers (Blue)', quantity: 45, threshold: 10, unit: 'Pc' },
  { id: 3, name: 'Chalk Boxes (White)', quantity: 8, threshold: 10, unit: 'Box' },
];

export const InventoryDashboard = () => {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 md:p-6 max-w-5xl mx-auto w-full">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Store & Inventory</Text>

        <Row>
          {/* Stock List */}
          <Col className="w-full lg:w-1/2">
            <View className="bg-white rounded-xl shadow-sm border border-gray-200 h-full overflow-hidden">
              <View className="p-4 border-b border-gray-100 bg-gray-50 flex-row justify-between items-center">
                <Text className="font-bold text-gray-700">Current Stock Levels</Text>
                <View className="bg-red-100 px-2 py-1 rounded-full">
                  <Text className="text-xs text-red-800 font-bold">2 Low Items</Text>
                </View>
              </View>
              <View className="w-full">
                <View className="flex-row bg-gray-50 border-b border-gray-100">
                  <Text className="flex-[2] px-4 py-2 text-xs text-gray-500 uppercase font-bold">Item</Text>
                  <Text className="flex-1 px-4 py-2 text-xs text-gray-500 uppercase font-bold text-center">Qty</Text>
                  <Text className="flex-1 px-4 py-2 text-xs text-gray-500 uppercase font-bold text-right">Status</Text>
                </View>
                <View>
                  {STOCK_ITEMS.map(item => (
                    <View key={item.id} className="flex-row border-b border-gray-100">
                      <Text className="flex-[2] px-4 py-3 text-sm font-medium text-gray-900">{item.name}</Text>
                      <Text className="flex-1 px-4 py-3 text-center text-sm font-mono text-gray-600">{item.quantity} {item.unit}</Text>
                      <View className="flex-1 px-4 py-3 items-end justify-center">
                        {item.quantity < item.threshold ? (
                          <Text className="text-xs text-red-600 font-bold">LOW STOCK</Text>
                        ) : (
                          <Text className="text-xs text-green-600 font-bold">OK</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Col>

          {/* Requisitions */}
          <Col className="w-full lg:w-1/2">
            <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full">
              <Text className="font-bold text-gray-700 mb-4">Pending Staff Requisitions</Text>
              <View className="gap-3">
                <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <View className="flex-row justify-between">
                    <Text className="font-bold text-sm text-gray-800">Science Dept.</Text>
                    <Text className="text-xs text-gray-500">Today</Text>
                  </View>
                  <Text className="text-sm text-gray-600 mt-1">Requested: 5x HCL Acid Bottles, 10x Beakers</Text>
                  <View className="flex-row gap-2 mt-2">
                    <Pressable className="flex-1 bg-gray-900 py-1 rounded justify-center items-center">
                      <Text className="text-white text-xs font-bold">Approve</Text>
                    </Pressable>
                    <Pressable className="flex-1 border border-gray-300 py-1 rounded justify-center items-center">
                      <Text className="text-gray-700 text-xs">Reject</Text>
                    </Pressable>
                  </View>
                </View>
                {/* Second Item */}
                <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <View className="flex-row justify-between">
                    <Text className="font-bold text-sm text-gray-800">Exam Cell</Text>
                    <Text className="text-xs text-gray-500">Yesterday</Text>
                  </View>
                  <Text className="text-sm text-gray-600 mt-1">Requested: 50x A4 Paper Reams</Text>
                  <View className="flex-row gap-2 mt-2">
                    <Pressable className="flex-1 bg-gray-900 py-1 rounded justify-center items-center">
                      <Text className="text-white text-xs font-bold">Approve</Text>
                    </Pressable>
                    <Pressable className="flex-1 border border-gray-300 py-1 rounded justify-center items-center">
                      <Text className="text-gray-700 text-xs">Reject</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </Col>
        </Row>
      </View>
    </ScrollView>
  );
};
