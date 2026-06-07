import { useState } from 'react';
import { Sprout, Plus, Trash2, Edit2, Check, X, MapPin, Calendar, ChevronRight, Home } from 'lucide-react';
import { useGardenStore } from '../store/useGardenStore';
import type { Garden } from '../types/plot';

interface GardenListProps {
  onSelectGarden: (gardenId: string) => void;
  onBack: () => void;
}

export function GardenList({ onSelectGarden, onBack }: GardenListProps) {
  const gardens = useGardenStore((state) => state.gardens);
  const currentGardenId = useGardenStore((state) => state.currentGardenId);
  const gardenData = useGardenStore((state) => state.gardenData);
  const createGarden = useGardenStore((state) => state.createGarden);
  const deleteGarden = useGardenStore((state) => state.deleteGarden);
  const updateGarden = useGardenStore((state) => state.updateGarden);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGardenName, setNewGardenName] = useState('');
  const [newGardenDesc, setNewGardenDesc] = useState('');
  const [newGardenLocation, setNewGardenLocation] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const handleCreate = () => {
    if (!newGardenName.trim()) return;
    const newGarden = createGarden({
      name: newGardenName.trim(),
      description: newGardenDesc.trim() || undefined,
      location: newGardenLocation.trim() || undefined,
    });
    setNewGardenName('');
    setNewGardenDesc('');
    setNewGardenLocation('');
    setIsCreating(false);
    onSelectGarden(newGarden.id);
  };

  const handleDelete = (gardenId: string) => {
    const garden = gardens.find((g) => g.id === gardenId);
    if (garden?.isDefault) return;
    if (window.confirm(`确定要删除菜园"${garden?.name}"吗？此操作不可恢复。`)) {
      deleteGarden(gardenId);
    }
  };

  const startEdit = (garden: Garden) => {
    setEditingId(garden.id);
    setEditName(garden.name);
    setEditDesc(garden.description || '');
    setEditLocation(garden.location || '');
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateGarden(editingId, {
      name: editName.trim(),
      description: editDesc.trim() || undefined,
      location: editLocation.trim() || undefined,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-garden-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-garden-100 transition-colors"
              >
                <Home className="w-5 h-5 text-garden-700" />
              </button>
              <div className="w-10 h-10 bg-garden-500 rounded-xl flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-garden-800">菜园管理</h1>
                <p className="text-xs text-garden-500">管理您的多个菜园</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-garden-800">我的菜园</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm shadow-garden-500/20"
          >
            <Plus size={16} />
            新建菜园
          </button>
        </div>

        {isCreating && (
          <div className="mb-6 p-4 bg-white rounded-2xl border-2 border-garden-200 shadow-sm">
            <h3 className="font-semibold text-garden-800 mb-4">创建新菜园</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-garden-700 mb-1">
                  菜园名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newGardenName}
                  onChange={(e) => setNewGardenName(e.target.value)}
                  placeholder="例如：东园、南圃..."
                  className="w-full px-3 py-2 border border-garden-200 rounded-xl focus:ring-2 focus:ring-garden-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-garden-700 mb-1">
                  描述
                </label>
                <input
                  type="text"
                  value={newGardenDesc}
                  onChange={(e) => setNewGardenDesc(e.target.value)}
                  placeholder="简单描述一下这个菜园"
                  className="w-full px-3 py-2 border border-garden-200 rounded-xl focus:ring-2 focus:ring-garden-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-garden-700 mb-1">
                  位置
                </label>
                <input
                  type="text"
                  value={newGardenLocation}
                  onChange={(e) => setNewGardenLocation(e.target.value)}
                  placeholder="例如：社区东区3号楼后"
                  className="w-full px-3 py-2 border border-garden-200 rounded-xl focus:ring-2 focus:ring-garden-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <Check size={16} />
                创建
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewGardenName('');
                  setNewGardenDesc('');
                  setNewGardenLocation('');
                }}
                className="px-4 py-2 bg-garden-100 text-garden-700 rounded-xl hover:bg-garden-200 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <X size={16} />
                取消
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gardens.map((garden) => {
            const data = gardenData[garden.id];
            const plotCount = data?.plots?.length || 0;
            const claimedCount = data?.plots?.filter((p) => p.owner).length || 0;

            return (
              <div
                key={garden.id}
                className={`relative bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md ${
                  garden.id === currentGardenId
                    ? 'border-garden-500 ring-2 ring-garden-100'
                    : 'border-garden-100 hover:border-garden-200'
                }`}
              >
                {garden.id === currentGardenId && (
                  <div className="absolute -top-2 -right-2 bg-garden-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    当前
                  </div>
                )}
                {garden.isDefault && (
                  <div className="absolute -top-2 -left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    默认
                  </div>
                )}

                {editingId === garden.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-garden-200 rounded-xl focus:ring-2 focus:ring-garden-500 focus:border-transparent outline-none transition-all font-semibold"
                    />
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="描述"
                      className="w-full px-3 py-2 border border-garden-200 rounded-xl focus:ring-2 focus:ring-garden-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="位置"
                      className="w-full px-3 py-2 border border-garden-200 rounded-xl focus:ring-2 focus:ring-garden-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="p-2 bg-garden-500 text-white rounded-lg hover:bg-garden-600 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-garden-100 text-garden-700 rounded-lg hover:bg-garden-200 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-garden-800 truncate">{garden.name}</h3>
                        {garden.description && (
                          <p className="text-sm text-garden-500 mt-0.5 truncate">{garden.description}</p>
                        )}
                      </div>
                    </div>

                    {garden.location && (
                      <div className="flex items-center gap-1.5 text-sm text-garden-500 mb-2">
                        <MapPin size={14} />
                        <span className="truncate">{garden.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-sm text-garden-500 mb-3">
                      <Calendar size={14} />
                      <span>创建于 {formatDate(garden.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-semibold text-garden-800">{plotCount}</span>
                        <span className="text-garden-500 ml-1">地块</span>
                      </div>
                      <div>
                        <span className="font-semibold text-garden-800">{claimedCount}</span>
                        <span className="text-garden-500 ml-1">已认领</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectGarden(garden.id)}
                        className="flex-1 px-3 py-2 bg-garden-50 text-garden-700 rounded-xl hover:bg-garden-100 transition-colors font-medium text-sm flex items-center justify-center gap-1.5"
                      >
                        {garden.id === currentGardenId ? '查看详情' : '切换至此菜园'}
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => startEdit(garden)}
                        className="p-2 text-garden-500 hover:bg-garden-100 rounded-xl transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      {!garden.isDefault && (
                        <button
                          onClick={() => handleDelete(garden.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {gardens.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-8 h-8 text-garden-400" />
            </div>
            <p className="text-garden-600 mb-4">还没有创建任何菜园</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-garden-500 text-white rounded-xl hover:bg-garden-600 transition-colors font-medium text-sm inline-flex items-center gap-2"
            >
              <Plus size={16} />
              创建第一个菜园
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
