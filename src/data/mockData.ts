import type { Plot } from '../types/plot';

const today = new Date();
const daysAgo = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const mockPlots: Plot[] = [
  { id: '1', plotNumber: 'A1', owner: '张大爷', plant: '番茄 🍅', lastWatered: daysAgo(1), lastWeeded: daysAgo(5), status: 'claimed' },
  { id: '2', plotNumber: 'A2', owner: '李阿姨', plant: '黄瓜 🥒', lastWatered: daysAgo(2), lastWeeded: daysAgo(3), status: 'claimed' },
  { id: '3', plotNumber: 'A3', owner: null, plant: null, lastWatered: null, lastWeeded: null, status: 'available' },
  { id: '4', plotNumber: 'A4', owner: '王叔叔', plant: '辣椒 🌶️', lastWatered: daysAgo(4), lastWeeded: daysAgo(8), status: 'needsMaintenance' },
  { id: '5', plotNumber: 'A5', owner: '赵奶奶', plant: '茄子 🍆', lastWatered: daysAgo(2), lastWeeded: daysAgo(6), status: 'claimed' },
  { id: '6', plotNumber: 'A6', owner: null, plant: null, lastWatered: null, lastWeeded: null, status: 'available' },
  
  { id: '7', plotNumber: 'B1', owner: '陈大哥', plant: '白菜 🥬', lastWatered: daysAgo(5), lastWeeded: daysAgo(10), status: 'needsMaintenance' },
  { id: '8', plotNumber: 'B2', owner: '刘姐', plant: '萝卜 🥕', lastWatered: daysAgo(1), lastWeeded: daysAgo(4), status: 'claimed' },
  { id: '9', plotNumber: 'B3', owner: '周师傅', plant: '生菜 🥗', lastWatered: daysAgo(3), lastWeeded: daysAgo(7), status: 'needsMaintenance' },
  { id: '10', plotNumber: 'B4', owner: null, plant: null, lastWatered: null, lastWeeded: null, status: 'available' },
  { id: '11', plotNumber: 'B5', owner: '吴阿姨', plant: '菠菜 🌿', lastWatered: daysAgo(2), lastWeeded: daysAgo(2), status: 'claimed' },
  { id: '12', plotNumber: 'B6', owner: '郑大爷', plant: '葱 🧅', lastWatered: daysAgo(1), lastWeeded: daysAgo(1), status: 'claimed' },
  
  { id: '13', plotNumber: 'C1', owner: null, plant: null, lastWatered: null, lastWeeded: null, status: 'available' },
  { id: '14', plotNumber: 'C2', owner: '孙奶奶', plant: '土豆 🥔', lastWatered: daysAgo(6), lastWeeded: daysAgo(12), status: 'needsMaintenance' },
  { id: '15', plotNumber: 'C3', owner: '马大哥', plant: '玉米 🌽', lastWatered: daysAgo(2), lastWeeded: daysAgo(5), status: 'claimed' },
  { id: '16', plotNumber: 'C4', owner: null, plant: null, lastWatered: null, lastWeeded: null, status: 'available' },
  { id: '17', plotNumber: 'C5', owner: '朱阿姨', plant: '南瓜 🎃', lastWatered: daysAgo(3), lastWeeded: daysAgo(6), status: 'claimed' },
  { id: '18', plotNumber: 'C6', owner: '胡叔叔', plant: '冬瓜 🍈', lastWatered: daysAgo(4), lastWeeded: daysAgo(9), status: 'needsMaintenance' },
  
  { id: '19', plotNumber: 'D1', owner: '林姐', plant: '西瓜 🍉', lastWatered: daysAgo(1), lastWeeded: daysAgo(3), status: 'claimed' },
  { id: '20', plotNumber: 'D2', owner: null, plant: null, lastWatered: null, lastWeeded: null, status: 'available' },
  { id: '21', plotNumber: 'D3', owner: '何大爷', plant: '草莓 🍓', lastWatered: daysAgo(2), lastWeeded: daysAgo(4), status: 'claimed' },
  { id: '22', plotNumber: 'D4', owner: '高奶奶', plant: '葡萄 🍇', lastWatered: daysAgo(7), lastWeeded: daysAgo(14), status: 'needsMaintenance' },
  { id: '23', plotNumber: 'D5', owner: null, plant: null, lastWatered: null, lastWeeded: null, status: 'available' },
  { id: '24', plotNumber: 'D6', owner: '罗师傅', plant: '豆角 🫛', lastWatered: daysAgo(1), lastWeeded: daysAgo(2), status: 'claimed' },
];
