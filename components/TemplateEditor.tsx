import React, { useState } from 'react';
import { ReplyTemplate } from '../types';
import { Save, RotateCcw } from 'lucide-react';

interface TemplateEditorProps {
  templates: ReplyTemplate[];
  onSave: (templates: ReplyTemplate[]) => void;
}

const defaultTemplates: ReplyTemplate[] = [
  {
    id: 'yes',
    name: '接受合作 (Yes)',
    subject: '回复：关于 {brandName} 的合作意向确认',
    body: `您好，

感谢贵品牌 {brandName} 的盛情邀请。我是博主本人。

如果你是品牌方，我非常荣幸能有机会与贵品牌合作。我已经详细阅读了您的合作需求，觉得非常契合我的账号风格。

请问是否有详细的Brief或产品资料可以进一步同步？期待进一步沟通。

祝好，
[您的名字]`
  },
  {
    id: 'no',
    name: '婉拒合作 (No)',
    subject: '回复：关于 {brandName} 的合作邀约',
    body: `您好，

非常感谢 {brandName} 的关注与认可。

经过慎重考虑，由于近期档期已满/内容规划原因，暂时无法承接此次合作。希望未来由于合适的机会能再续前缘。

祝新品大卖！

祝好，
[您的名字]`
  }
];

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templates, onSave }) => {
  const [localTemplates, setLocalTemplates] = useState<ReplyTemplate[]>(templates);
  const [activeTab, setActiveTab] = useState<'yes' | 'no'>('yes');

  const handleChange = (field: 'subject' | 'body', value: string) => {
    setLocalTemplates(prev => prev.map(t => t.id === activeTab ? { ...t, [field]: value } : t));
  };

  const handleSave = () => {
    onSave(localTemplates);
    alert('模版已保存！');
  };

  const handleReset = () => {
    if(confirm('确定恢复默认模版吗？')) {
        setLocalTemplates(defaultTemplates);
        onSave(defaultTemplates);
    }
  };

  const currentTemplate = localTemplates.find(t => t.id === activeTab);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <h2 className="text-lg font-bold text-slate-800 mb-4">回复模版设置</h2>
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('yes')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'yes' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'}`}
        >
          接受 (Yes)
        </button>
        <button
          onClick={() => setActiveTab('no')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'no' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'}`}
        >
          拒绝 (No)
        </button>
      </div>

      {currentTemplate && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">邮件标题</label>
            <input
              type="text"
              value={currentTemplate.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              邮件正文 <span className="text-indigo-500 normal-case font-normal ml-2">(使用 {'{brandName}'} 代表品牌名)</span>
            </label>
            <textarea
              value={currentTemplate.body}
              onChange={(e) => handleChange('body', e.target.value)}
              className="w-full h-48 p-2 border border-slate-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
        <button onClick={handleReset} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm">
            <RotateCcw className="w-4 h-4" /> 重置
        </button>
        <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm">
          <Save className="w-4 h-4" /> 保存模版
        </button>
      </div>
    </div>
  );
};

export default TemplateEditor;
