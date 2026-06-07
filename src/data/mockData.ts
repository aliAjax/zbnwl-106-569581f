import type { Plot } from '../types/plot';

const today = new Date();
const daysAgo = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const mockPlots: Plot[] = [
  { id: '1', plotNumber: 'A1', owner: '张大爷', contact: '138****1234', plant: '番茄 🍅', lastWatered: daysAgo(1), lastWeeded: daysAgo(5), firstMaintenanceDate: daysAgo(30), status: 'claimed' },
  { id: '2', plotNumber: 'A2', owner: '李阿姨', contact: '139****5678', plant: '黄瓜 🥒', lastWatered: daysAgo(2), lastWeeded: daysAgo(3), firstMaintenanceDate: daysAgo(25), status: 'claimed' },
  { id: '3', plotNumber: 'A3', owner: null, contact: null, plant: null, lastWatered: null, lastWeeded: null, firstMaintenanceDate: null, status: 'available' },
  { id: '4', plotNumber: 'A4', owner: '王叔叔', contact: '137****9012', plant: '辣椒 🌶️', lastWatered: daysAgo(4), lastWeeded: daysAgo(8), firstMaintenanceDate: daysAgo(20), status: 'needsMaintenance' },
  { id: '5', plotNumber: 'A5', owner: '赵奶奶', contact: '136****3456', plant: '茄子 🍆', lastWatered: daysAgo(2), lastWeeded: daysAgo(6), firstMaintenanceDate: daysAgo(15), status: 'claimed' },
  { id: '6', plotNumber: 'A6', owner: null, contact: null, plant: null, lastWatered: null, lastWeeded: null, firstMaintenanceDate: null, status: 'available' },

  { id: '7', plotNumber: 'B1', owner: '陈大哥', contact: '135****7890', plant: '白菜 🥬', lastWatered: daysAgo(5), lastWeeded: daysAgo(10), firstMaintenanceDate: daysAgo(18), status: 'needsMaintenance' },
  { id: '8', plotNumber: 'B2', owner: '刘姐', contact: '134****1122', plant: '萝卜 🥕', lastWatered: daysAgo(1), lastWeeded: daysAgo(4), firstMaintenanceDate: daysAgo(22), status: 'claimed' },
  { id: '9', plotNumber: 'B3', owner: '周师傅', contact: '133****3344', plant: '生菜 🥗', lastWatered: daysAgo(3), lastWeeded: daysAgo(7), firstMaintenanceDate: daysAgo(10), status: 'needsMaintenance' },
  { id: '10', plotNumber: 'B4', owner: null, contact: null, plant: null, lastWatered: null, lastWeeded: null, firstMaintenanceDate: null, status: 'available' },
  { id: '11', plotNumber: 'B5', owner: '吴阿姨', contact: '132****5566', plant: '菠菜 🌿', lastWatered: daysAgo(2), lastWeeded: daysAgo(2), firstMaintenanceDate: daysAgo(12), status: 'claimed' },
  { id: '12', plotNumber: 'B6', owner: '郑大爷', contact: '131****7788', plant: '葱 🧅', lastWatered: daysAgo(1), lastWeeded: daysAgo(1), firstMaintenanceDate: daysAgo(8), status: 'claimed' },

  { id: '13', plotNumber: 'C1', owner: null, contact: null, plant: null, lastWatered: null, lastWeeded: null, firstMaintenanceDate: null, status: 'available' },
  { id: '14', plotNumber: 'C2', owner: '孙奶奶', contact: '130****9900', plant: '土豆 🥔', lastWatered: daysAgo(6), lastWeeded: daysAgo(12), firstMaintenanceDate: daysAgo(35), status: 'needsMaintenance' },
  { id: '15', plotNumber: 'C3', owner: '马大哥', contact: '159****1212', plant: '玉米 🌽', lastWatered: daysAgo(2), lastWeeded: daysAgo(5), firstMaintenanceDate: daysAgo(28), status: 'claimed' },
  { id: '16', plotNumber: 'C4', owner: null, contact: null, plant: null, lastWatered: null, lastWeeded: null, firstMaintenanceDate: null, status: 'available' },
  { id: '17', plotNumber: 'C5', owner: '朱阿姨', contact: '158****3434', plant: '南瓜 🎃', lastWatered: daysAgo(3), lastWeeded: daysAgo(6), firstMaintenanceDate: daysAgo(16), status: 'claimed' },
  { id: '18', plotNumber: 'C6', owner: '胡叔叔', contact: '157****5656', plant: '冬瓜 🍈', lastWatered: daysAgo(4), lastWeeded: daysAgo(9), firstMaintenanceDate: daysAgo(14), status: 'needsMaintenance' },

  { id: '19', plotNumber: 'D1', owner: '林姐', contact: '156****7878', plant: '西瓜 🍉', lastWatered: daysAgo(1), lastWeeded: daysAgo(3), firstMaintenanceDate: daysAgo(21), status: 'claimed' },
  { id: '20', plotNumber: 'D2', owner: null, contact: null, plant: null, lastWatered: null, lastWeeded: null, firstMaintenanceDate: null, status: 'available' },
  { id: '21', plotNumber: 'D3', owner: '何大爷', contact: '155****9090', plant: '草莓 🍓', lastWatered: daysAgo(2), lastWeeded: daysAgo(4), firstMaintenanceDate: daysAgo(19), status: 'claimed' },
  { id: '22', plotNumber: 'D4', owner: '高奶奶', contact: '154****1111', plant: '葡萄 🍇', lastWatered: daysAgo(7), lastWeeded: daysAgo(14), firstMaintenanceDate: daysAgo(40), status: 'needsMaintenance' },
  { id: '23', plotNumber: 'D5', owner: null, contact: null, plant: null, lastWatered: null, lastWeeded: null, firstMaintenanceDate: null, status: 'available' },
  { id: '24', plotNumber: 'D6', owner: '罗师傅', contact: '153****2222', plant: '豆角 🫛', lastWatered: daysAgo(1), lastWeeded: daysAgo(2), firstMaintenanceDate: daysAgo(7), status: 'claimed' },
];
