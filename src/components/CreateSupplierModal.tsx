import { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { SupplierSummary } from '../models';

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierSummary) => void;
}

interface ContactItem {
  id: string;
  type: string;
  value: string;
  name: string;
}

export function CreateSupplierModal({ isOpen, onClose, onSubmit }: CreateSupplierModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    localName: '',
    shortNameEn: '',
    shortNameCn: '',
    category: 'Logistics',
    location: '',
    address: '',
    structure: '',
    tags: '',
    businessType: '',
    advantage: ''
  });

  const [contacts, setContacts] = useState<ContactItem[]>([
    { id: '1', type: 'Email', value: '', name: '' }
  ]);

  if (!isOpen) return null;

  const handleAddContact = () => {
    setContacts([...contacts, { id: Math.random().toString(36).substr(2, 9), type: 'Mobile', value: '', name: '' }]);
  };

  const handleRemoveContact = (id: string) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const handleContactChange = (id: string, field: keyof ContactItem, value: string) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the first contact as the primary contact for the summary
    const primaryContact = contacts[0] || { name: '', value: '', type: '' };
    
    onSubmit({
      ...formData,
      id: `SUP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'Trial',
      totalSpend: '¥ 0',
      performanceScore: 0,
      tags: formData.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
      logoText: (formData.shortNameEn || formData.name).charAt(0).toUpperCase(),
      // @ts-ignore
      businessLines: formData.businessType ? [{
          type: formData.businessType,
          description: formData.advantage,
          routes: [],
          carriers: [],
          contact: {
              name: primaryContact.name,
              email: primaryContact.type === 'Email' ? primaryContact.value : '',
              phone: primaryContact.type === 'Mobile' || primaryContact.type === 'Phone' ? primaryContact.value : ''
          }
      }] : []
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">新建供应商档案</h2>
            <p className="text-sm text-slate-500">录入新的潜在供应商信息</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-500 pl-2">基本信息 (Basic Info)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">供应商名称 (英文)</label>
                <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="例如: Global Logistics Co., Ltd."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
                </div>
                
                <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">供应商名称 (中文)</label>
                <input
                    required
                    name="localName"
                    value={formData.localName}
                    onChange={handleChange}
                    placeholder="例如: 环球物流有限公司"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
                </div>

                <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">英文简称</label>
                <input
                    name="shortNameEn"
                    value={formData.shortNameEn}
                    onChange={handleChange}
                    placeholder="e.g. GLC"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
                </div>

                <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">中文简称</label>
                <input
                    name="shortNameCn"
                    value={formData.shortNameCn}
                    onChange={handleChange}
                    placeholder="例如: 环球物流"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
                </div>

                <div className="col-span-2 space-y-2">
                <label className="text-xs font-medium text-slate-700">公司地址</label>
                <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="详细注册地址"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
                </div>

                <div className="col-span-2 space-y-2">
                <label className="text-xs font-medium text-slate-700">公司结构</label>
                <textarea
                    name="structure"
                    value={formData.structure}
                    onChange={handleChange as any}
                    placeholder="简述公司股权结构或隶属关系"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
                </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-l-4 border-brand-500 pl-2">
              <h3 className="text-sm font-bold text-slate-900">联系方式 (Contact)</h3>
              <button 
                type="button" 
                onClick={handleAddContact}
                className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
              >
                <Plus className="w-3 h-3" /> 添加联系人
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase font-medium">
                  <tr>
                    <th className="px-3 py-2 w-[20%]">类型</th>
                    <th className="px-3 py-2 w-[25%]">姓名</th>
                    <th className="px-3 py-2 w-[45%]">号码/地址</th>
                    <th className="px-3 py-2 w-[10%] text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="bg-white">
                      <td className="p-2">
                        <select
                          value={contact.type}
                          onChange={(e) => handleContactChange(contact.id, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                        >
                          <option value="Mobile">手机 (Mobile)</option>
                          <option value="Email">邮箱 (Email)</option>
                          <option value="WeChat">微信 (WeChat)</option>
                          <option value="QQ">QQ</option>
                          <option value="Phone">座机 (Landline)</option>
                          <option value="Fax">传真 (Fax)</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleContactChange(contact.id, 'name', e.target.value)}
                          placeholder="联系人姓名"
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={contact.value}
                          onChange={(e) => handleContactChange(contact.id, 'value', e.target.value)}
                          placeholder={contact.type === 'Email' ? 'example@company.com' : '请输入号码/ID'}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(contact.id)}
                          disabled={contacts.length === 1}
                          className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {contacts.length === 0 && (
              <div className="text-center py-4 text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                暂无联系方式，请点击上方添加
              </div>
            )}
          </div>

          {/* Section 3: Business Info */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-500 pl-2">主营业务 (Business)</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">所在地区</label>
                <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="例如: 上海, 中国"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">主要业务类型</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm bg-white"
                  >
                     <option value="">请选择...</option>
                     {['海运 (Ocean)', '空运 (Air)', '铁路 (Rail)', '卡车 (Truck)', '拖车 (Trailer)', '仓储 (Storage)', '报关 (Customs)'].map(t => (
                         <option key={t} value={t}>{t}</option>
                     ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-medium text-slate-700">优势概述</label>
                  <input
                    name="advantage"
                    value={formData.advantage}
                    onChange={handleChange}
                    placeholder="例如: 美西快船庄家"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                  />
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">标签 (用逗号分隔)</label>
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="例如: 跨境电商, 美线, 优质服务"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存档案
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
