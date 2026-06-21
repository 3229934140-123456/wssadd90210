import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useStoreStore } from '@/store/useStoreStore';
import { cities } from '@/mock';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  User,
  Users,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';

export default function StoreManagement() {
  const { stores, getAllCities } = useStoreStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    manager: '',
    phone: '',
    capacity: 50,
  });

  const allCities = getAllCities();

  const filteredStores = stores.filter(store => {
    if (searchKeyword && !store.name.includes(searchKeyword) && !store.manager.includes(searchKeyword)) {
      return false;
    }
    if (selectedCity && store.city !== selectedCity) {
      return false;
    }
    return true;
  });

  const handleAdd = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      city: '',
      address: '',
      manager: '',
      phone: '',
      capacity: 50,
    });
    setShowModal(true);
  };

  const handleEdit = (store: any) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      city: store.city,
      address: store.address,
      manager: store.manager,
      phone: store.phone,
      capacity: store.capacity,
    });
    setShowModal(true);
  };

  const getSaturationColor = (saturation: number) => {
    if (saturation > 80) return 'text-red-600 bg-red-50';
    if (saturation > 60) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  return (
    <PageContainer
      title="门店管理"
      subtitle={`共 ${stores.length} 家门店，覆盖 ${allCities.length} 个城市`}
      actions={
        <Button onClick={handleAdd}>
          <Plus size={14} className="mr-1" />
          新增门店
        </Button>
      }
    >
      <div className="space-y-4">
        <Card>
          <Card.Body className="py-3">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索门店名称、店长..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
              >
                <option value="">全部城市</option>
                {allCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </Card.Body>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map(store => {
            const saturation = Math.round((store.currentLoad / store.capacity) * 100);
            
            return (
              <Card key={store.id} hover>
                <Card.Body>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
                        <Building2 size={22} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{store.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{store.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(store)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">店长：{store.manager}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users size={14} className="text-gray-400" />
                        <span>承接饱和度</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSaturationColor(saturation)}`}>
                        {saturation}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${
                          saturation > 80 ? 'bg-red-500' :
                          saturation > 60 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${saturation}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>当前 {store.currentLoad} 人</span>
                      <span>容量 {store.capacity} 人</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>

        {filteredStores.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 size={48} className="mb-3 opacity-30" />
            <p className="text-sm">暂无符合条件的门店</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingStore ? '编辑门店' : '新增门店'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>取消</Button>
            <Button onClick={() => setShowModal(false)}>保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">门店名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入门店名称"
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
            <select
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            >
              <option value="">请选择城市</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">详细地址</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="请输入详细地址"
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">店长</label>
              <input
                type="text"
                value={formData.manager}
                onChange={e => setFormData({ ...formData, manager: e.target.value })}
                placeholder="店长姓名"
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="门店电话"
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">最大接待容量</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
